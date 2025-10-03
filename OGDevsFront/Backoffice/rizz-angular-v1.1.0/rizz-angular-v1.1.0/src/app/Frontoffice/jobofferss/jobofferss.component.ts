import { Component, OnInit } from '@angular/core';
import {CommonModule, CurrencyPipe, NgIf} from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { JobOfferService, JobOffer } from '@/app/services/job-offre.service';
import { CandidateService } from '@/app/services/candidate.service';
import { FooterFrontComponent } from '@/app/Frontoffice/footer-front/footer-front.component';
import { HeaderFrontComponent } from '@/app/Frontoffice/header-front/header-front.component';
import {RouterOutlet, Router, RouterLink} from '@angular/router';
import { SweetAlertService } from '@/app/services/sweet-alert.service';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-jobofferss',
  imports: [
    FooterFrontComponent,
    RouterOutlet,
    HeaderFrontComponent,
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './jobofferss.component.html',
  standalone: true,
  styleUrl: './jobofferss.component.scss',
})
export class JobofferssComponent implements OnInit {
  jobOffers: JobOffer[] = []
  filteredJobOffers: JobOffer[] = []
  errorMessage: string | null = null
  showApplicationForm: boolean = false
  showJobDetailsModal: boolean = false
  showGenerateCVModal: boolean = false
  selectedOfferId: number |undefined
  selectedOffer: JobOffer | null = null
  candidateForm: FormGroup
  resumeForm: FormGroup
  filterForm: FormGroup
  photoBase64: string | null = null
  isJobOffersRoute: boolean = false // Flag to control visibility

  constructor(
    private jobOfferService: JobOfferService,
    private candidateService: CandidateService,
    private fb: FormBuilder,
    private sweetAlertService: SweetAlertService,
    private router: Router
  ) {
    // Candidate Form
    this.candidateForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      resume: [null, Validators.required],
      gender: ['', Validators.required],
    })

    // Resume Form
    this.resumeForm = this.fb.group({
      templateStyle: ['modern', Validators.required],
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      address: [''],
      professionalProfile: [''],
      educations: this.fb.array([]),
      experiences: this.fb.array([]),
      linkedIn: [
        '',
        [
          Validators.pattern(
            /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9\-_]+\/?$/
          ),
        ],
      ],
      interests: [''],
      technicalSkills: this.fb.array([]),
      languages: this.fb.array([]),
    })

    // Filter Form
    this.filterForm = this.fb.group({
      title: [''],
      contractType: [''],
      salaryMin: [null],
      salaryMax: [null],
    })
  }

  ngOnInit(): void {
    // Check if the current route is '/job-offers'
    this.isJobOffersRoute = this.router.url === '/job-offerss'

    this.loadJobOffers()
    this.filterForm.valueChanges.subscribe(() => this.applyFilters())
  }

  loadJobOffers(): void {
    this.jobOfferService.getAllJobOffersPublic().subscribe({
      next: (data: JobOffer[]) => {
        this.jobOffers = data
        this.filteredJobOffers = data
        this.errorMessage = null
      },
      error: (error: any) => {
        this.errorMessage =
          'Error loading job offers: ' + (error.message || error)
        this.sweetAlertService.showError(this.errorMessage)
      },
    })
  }

  applyFilters(): void {
    const filters = this.filterForm.value
    this.filteredJobOffers = this.jobOffers.filter((offer) => {
      const matchesTitle = filters.title
        ? offer.title.toLowerCase().includes(filters.title.toLowerCase())
        : true
      const matchesContract = filters.contractType
        ? offer.contractType === filters.contractType
        : true
      const matchesSalaryMin = filters.salaryMin
        ? offer.salary >= filters.salaryMin
        : true
      const matchesSalaryMax = filters.salaryMax
        ? offer.salary <= filters.salaryMax
        : true

      return (
        matchesTitle && matchesContract && matchesSalaryMin && matchesSalaryMax
      )
    })
  }

  resetFilters(): void {
    this.filterForm.reset()
    this.filteredJobOffers = this.jobOffers
  }

  showJobDetails(offer: JobOffer): void {
    this.selectedOffer = offer
    this.showJobDetailsModal = true
  }

  onApply(jobOfferId: number | undefined): void {
    this.selectedOfferId = jobOfferId
    this.showApplicationForm = true
    this.showJobDetailsModal = false
    this.candidateForm.reset()
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement
    if (input.files && input.files.length > 0) {
      const file = input.files[0]
      if (file.type === 'application/pdf') {
        this.fileToBase64(file).then((base64) => {
          this.candidateForm.patchValue({ resume: base64 })
        })
      } else {
        this.candidateForm.patchValue({ resume: null })
        this.errorMessage = 'Please upload a PDF file only.'
        this.sweetAlertService.showError(this.errorMessage)
      }
    }
  }

  onPhotoUpload(event: Event): void {
    const input = event.target as HTMLInputElement
    if (input.files && input.files.length > 0) {
      const file = input.files[0]
      if (file.type === 'image/jpeg' || file.type === 'image/png') {
        if (file.size > 1024 * 1024) {
          this.sweetAlertService.showError(
            'The image is too large. Maximum size: 1MB.'
          )
          return
        }
        this.fileToBase64(file).then((base64) => {
          this.photoBase64 = base64
        })
      } else {
        this.photoBase64 = null
        this.sweetAlertService.showError(
          'Please upload an image in JPG or PNG format.'
        )
      }
    }
  }

  createCandidate(): void {
    if (this.candidateForm.invalid) {
      this.candidateForm.markAllAsTouched()
      this.sweetAlertService.showError('Please fill out all fields correctly.')
      return
    }

    const candidateData: any = this.candidateForm.value
    this.candidateService.createCandidate(candidateData).subscribe({
      next: (candidate: any) => {
        if (this.selectedOfferId !== null) {
          this.candidateService
            .assignCandidateToJobOffer(candidate.id!, this.selectedOfferId)
            .subscribe({
              next: () => {
                this.showApplicationForm = false
                this.errorMessage = null
                this.sweetAlertService.showSuccess(
                  'Application submitted and assigned successfully!'
                )
                this.candidateForm.reset()
              },
              error: (error: any) => {
                this.errorMessage =
                  'Error during assignment: ' + (error.message || error)
                this.sweetAlertService.showError(this.errorMessage)
              },
            })
        } else {
          this.sweetAlertService.showSuccess('Candidate created successfully!')
          this.candidateForm.reset()
        }
      },
      error: (error: any) => {
        this.errorMessage =
          'Error creating candidate: ' + (error.message || error)
        this.sweetAlertService.showError(this.errorMessage)
      },
    })
  }

  get educations(): FormArray {
    return this.resumeForm.get('educations') as FormArray
  }

  addEducation(): void {
    this.educations.push(
      this.fb.group({
        startDate: [''],
        endDate: [''],
        description: [''],
      })
    )
  }

  removeEducation(index: number): void {
    this.educations.removeAt(index)
  }

  get experiences(): FormArray {
    return this.resumeForm.get('experiences') as FormArray
  }

  addExperience(): void {
    this.experiences.push(
      this.fb.group({
        startDate: [''],
        endDate: [''],
        description: [''],
      })
    )
  }

  removeExperience(index: number): void {
    this.experiences.removeAt(index)
  }

  get technicalSkills(): FormArray {
    return this.resumeForm.get('technicalSkills') as FormArray
  }

  addTechnicalSkill(): void {
    this.technicalSkills.push(
      this.fb.group({
        name: [''],
        level: ['80'],
      })
    )
  }

  removeTechnicalSkill(index: number): void {
    this.technicalSkills.removeAt(index)
  }

  get languages(): FormArray {
    return this.resumeForm.get('languages') as FormArray
  }

  addLanguage(): void {
    this.languages.push(
      this.fb.group({
        name: [''],
        level: ['Intermediate'],
      })
    )
  }

  removeLanguage(index: number): void {
    this.languages.removeAt(index)
  }

  private checkPageOverflow(
    doc: jsPDF,
    currentY: number,
    sectionHeight: number,
    marginBottom: number = 20
  ): { newY: number; pageChanged: boolean } {
    const pageHeight = doc.internal.pageSize.height
    if (currentY + sectionHeight > pageHeight - marginBottom) {
      doc.addPage()
      return { newY: 20, pageChanged: true }
    }
    return { newY: currentY, pageChanged: false }
  }

  generateCV(): void {
    if (this.resumeForm.invalid) {
      this.resumeForm.markAllAsTouched()
      this.sweetAlertService.showError('Please fill out all required fields.')
      return
    }

    const resumeData = this.resumeForm.value
    const doc = new jsPDF()
    const leftColumnX = 20
    const rightColumnX = 90
    let leftY = 20
    let rightY = 20
    const pageWidth = doc.internal.pageSize.width
    const sectionSpacing = 15
    const smallSpacing = 5
    const contactItemSpacing = 5
    const marginBottom = 20
    const lineSpacing = 5

    if (this.photoBase64) {
      try {
        const photoHeight = 35
        const photoOverflow = this.checkPageOverflow(
          doc,
          leftY,
          photoHeight,
          marginBottom
        )
        if (photoOverflow.pageChanged) {
          leftY = photoOverflow.newY
        }
        doc.addImage(this.photoBase64, 'JPEG', leftColumnX, leftY, 30, 30)
        leftY += 35
      } catch (error) {
        console.error('Error adding photo to PDF:', error)
        this.sweetAlertService.showError('Error adding photo to CV.')
      }
    }

    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(20)
    doc.setTextColor(0, 102, 204)
    const nameHeight = 15
    const nameOverflow = this.checkPageOverflow(
      doc,
      rightY,
      nameHeight,
      marginBottom
    )
    if (nameOverflow.pageChanged) {
      rightY = nameOverflow.newY
    }
    doc.text(resumeData.fullName.toUpperCase(), rightColumnX, rightY)
    rightY += 15

    doc.setFontSize(12)
    doc.setTextColor(0, 102, 204)
    doc.setFont('Helvetica', 'bold')
    let contactHeight = 10
    contactHeight += lineSpacing + contactItemSpacing
    if (resumeData.phone) contactHeight += lineSpacing + contactItemSpacing
    if (resumeData.address) contactHeight += lineSpacing + contactItemSpacing
    if (resumeData.linkedIn) contactHeight += lineSpacing + contactItemSpacing
    const contactOverflow = this.checkPageOverflow(
      doc,
      leftY,
      contactHeight,
      marginBottom
    )
    if (contactOverflow.pageChanged) {
      leftY = contactOverflow.newY
    }
    doc.text('CONTACT', leftColumnX, leftY)
    leftY += 5
    doc.setLineWidth(0.5)
    doc.setDrawColor(0, 102, 204)
    doc.line(leftColumnX, leftY, leftColumnX + 50, leftY)
    leftY += 10
    doc.setFont('Helvetica', 'normal')
    doc.setTextColor(0, 0, 0)
    doc.text(`Email: ${resumeData.email}`, leftColumnX, leftY, { maxWidth: 50 })
    leftY += lineSpacing + contactItemSpacing
    if (resumeData.phone) {
      doc.text(`Phone: ${resumeData.phone}`, leftColumnX, leftY, {
        maxWidth: 50,
      })
      leftY += lineSpacing + contactItemSpacing
    }
    if (resumeData.address) {
      doc.text(`Address: ${resumeData.address}`, leftColumnX, leftY, {
        maxWidth: 50,
      })
      leftY += lineSpacing + contactItemSpacing
    }
    if (resumeData.linkedIn) {
      doc.text(`LinkedIn: ${resumeData.linkedIn}`, leftColumnX, leftY, {
        maxWidth: 50,
      })
      leftY += lineSpacing + contactItemSpacing
    }
    leftY += smallSpacing

    if (resumeData.technicalSkills && resumeData.technicalSkills.length > 0) {
      doc.setFontSize(12)
      doc.setTextColor(0, 102, 204)
      doc.setFont('Helvetica', 'bold')
      let skillsHeight = 10 + resumeData.technicalSkills.length * 10 + 10
      const skillsOverflow = this.checkPageOverflow(
        doc,
        leftY,
        skillsHeight,
        marginBottom
      )
      if (skillsOverflow.pageChanged) {
        leftY = skillsOverflow.newY
      }
      doc.text('SOFTWARE & SKILLS', leftColumnX, leftY)
      leftY += 5
      doc.setLineWidth(0.5)
      doc.setDrawColor(0, 102, 204)
      doc.line(leftColumnX, leftY, leftColumnX + 50, leftY)
      leftY += 10
      doc.setFont('Helvetica', 'normal')
      doc.setTextColor(0, 0, 0)
      for (const skill of resumeData.technicalSkills) {
        doc.text(skill.name, leftColumnX, leftY)
        const barWidth = (parseInt(skill.level) / 100) * 30
        doc.setFillColor(0, 102, 204)
        doc.rect(leftColumnX + 20, leftY - 3, barWidth, 2, 'F')
        doc.setFillColor(200, 200, 200)
        doc.rect(leftColumnX + 20 + barWidth, leftY - 3, 30 - barWidth, 2, 'F')
        leftY += 10
      }
      leftY += 10
    }

    if (resumeData.languages && resumeData.languages.length > 0) {
      doc.setFontSize(12)
      doc.setTextColor(0, 102, 204)
      doc.setFont('Helvetica', 'bold')
      let languagesHeight = 10 + resumeData.languages.length * 10 + 10
      const languagesOverflow = this.checkPageOverflow(
        doc,
        leftY,
        languagesHeight,
        marginBottom
      )
      if (languagesOverflow.pageChanged) {
        leftY = languagesOverflow.newY
      }
      doc.text('LANGUAGES', leftColumnX, leftY)
      leftY += 5
      doc.setLineWidth(0.5)
      doc.setDrawColor(0, 102, 204)
      doc.line(leftColumnX, leftY, leftColumnX + 50, leftY)
      leftY += 10
      doc.setFont('Helvetica', 'normal')
      doc.setTextColor(0, 0, 0)
      for (const lang of resumeData.languages) {
        doc.text(lang.name, leftColumnX, leftY)
        const levelMap: { [key: string]: number } = {
          Advanced: 80,
          Intermediate: 60,
          Beginner: 40,
        }
        const barWidth = (levelMap[lang.level] / 100) * 30
        doc.setFillColor(0, 102, 204)
        doc.rect(leftColumnX + 20, leftY - 3, barWidth, 2, 'F')
        doc.setFillColor(200, 200, 200)
        doc.rect(leftColumnX + 20 + barWidth, leftY - 3, 30 - barWidth, 2, 'F')
        leftY += 10
      }
      leftY += 10
    }

    if (resumeData.professionalProfile) {
      doc.setFontSize(12)
      doc.setTextColor(0, 102, 204)
      doc.setFont('Helvetica', 'bold')
      const profileLines = doc.splitTextToSize(
        resumeData.professionalProfile,
        100
      )
      const profileHeight =
        10 + profileLines.length * lineSpacing + smallSpacing
      const profileOverflow = this.checkPageOverflow(
        doc,
        rightY,
        profileHeight,
        marginBottom
      )
      if (profileOverflow.pageChanged) {
        rightY = profileOverflow.newY
        leftY = Math.max(leftY, rightY)
      }
      doc.text('PROFESSIONAL PROFILE', rightColumnX, rightY)
      rightY += 5
      doc.setLineWidth(0.5)
      doc.setDrawColor(0, 102, 204)
      doc.line(rightColumnX, rightY, pageWidth - 20, rightY)
      rightY += 10
      doc.setFont('Helvetica', 'normal')
      doc.setTextColor(0, 0, 0)
      doc.text(profileLines, rightColumnX, rightY)
      rightY += profileLines.length * lineSpacing + smallSpacing
    }

    if (resumeData.educations && resumeData.educations.length > 0) {
      doc.setFontSize(12)
      doc.setTextColor(0, 102, 204)
      doc.setFont('Helvetica', 'bold')
      let educationHeight = 10
      resumeData.educations.forEach((edu: any) => {
        const dateRange =
          edu.startDate && edu.endDate
            ? `${edu.startDate} - ${edu.endDate}`
            : edu.startDate || edu.endDate || ''
        const text = dateRange
          ? `${dateRange}\n${edu.description}`
          : edu.description
        const eduLines = doc.splitTextToSize(text, 100)
        educationHeight += eduLines.length * lineSpacing + 5
      })
      educationHeight += smallSpacing
      const educationOverflow = this.checkPageOverflow(
        doc,
        rightY,
        educationHeight,
        marginBottom
      )
      if (educationOverflow.pageChanged) {
        rightY = educationOverflow.newY
        leftY = Math.max(leftY, rightY)
      }
      doc.text('EDUCATION', rightColumnX, rightY)
      rightY += 5
      doc.setLineWidth(0.5)
      doc.setDrawColor(0, 102, 204)
      doc.line(rightColumnX, rightY, pageWidth - 20, rightY)
      rightY += 10
      doc.setFont('Helvetica', 'normal')
      doc.setTextColor(0, 0, 0)
      for (const edu of resumeData.educations) {
        const dateRange =
          edu.startDate && edu.endDate
            ? `${edu.startDate} - ${edu.endDate}`
            : edu.startDate || edu.endDate || ''
        const text = dateRange
          ? `${dateRange}\n${edu.description}`
          : edu.description
        const eduLines = doc.splitTextToSize(text, 100)
        doc.text(eduLines, rightColumnX, rightY)
        rightY += eduLines.length * lineSpacing + 5
      }
      rightY += smallSpacing
    }

    if (resumeData.experiences && resumeData.experiences.length > 0) {
      doc.setFontSize(12)
      doc.setTextColor(0, 102, 204)
      doc.setFont('Helvetica', 'bold')
      let experienceHeight = 10
      resumeData.experiences.forEach((exp: any) => {
        const dateRange =
          exp.startDate && exp.endDate
            ? `${exp.startDate} - ${exp.endDate}`
            : exp.startDate || exp.endDate || ''
        const text = dateRange
          ? `${dateRange}\n${exp.description}`
          : exp.description
        const expLines = doc.splitTextToSize(text, 100)
        experienceHeight += expLines.length * lineSpacing + 5
      })
      experienceHeight += sectionSpacing
      const experienceOverflow = this.checkPageOverflow(
        doc,
        rightY,
        experienceHeight,
        marginBottom
      )
      if (experienceOverflow.pageChanged) {
        rightY = experienceOverflow.newY
        leftY = Math.max(leftY, rightY)
      }
      doc.text('EXPERIENCE', rightColumnX, rightY)
      rightY += 5
      doc.setLineWidth(0.5)
      doc.setDrawColor(0, 102, 204)
      doc.line(rightColumnX, rightY, pageWidth - 20, rightY)
      rightY += 10
      doc.setFont('Helvetica', 'normal')
      doc.setTextColor(0, 0, 0)
      for (const exp of resumeData.experiences) {
        const dateRange =
          exp.startDate && exp.endDate
            ? `${exp.startDate} - ${exp.endDate}`
            : exp.startDate || exp.endDate || ''
        const text = dateRange
          ? `${dateRange}\n${exp.description}`
          : exp.description
        const expLines = doc.splitTextToSize(text, 100)
        doc.text(expLines, rightColumnX, rightY)
        rightY += expLines.length * lineSpacing + 5
      }
      rightY += sectionSpacing
    }

    if (resumeData.interests) {
      doc.setFontSize(12)
      doc.setTextColor(0, 102, 204)
      doc.setFont('Helvetica', 'bold')
      const interestLines = doc.splitTextToSize(resumeData.interests, 100)
      const interestsHeight =
        10 + interestLines.length * lineSpacing + sectionSpacing
      const interestsOverflow = this.checkPageOverflow(
        doc,
        rightY,
        interestsHeight,
        marginBottom
      )
      if (interestsOverflow.pageChanged) {
        rightY = interestsOverflow.newY
        leftY = Math.max(leftY, rightY)
      }
      doc.text('INTERESTS', rightColumnX, rightY)
      rightY += 5
      doc.setLineWidth(0.5)
      doc.setDrawColor(0, 102, 204)
      doc.line(rightColumnX, rightY, pageWidth - 20, rightY)
      rightY += 10
      doc.setFont('Helvetica', 'normal')
      doc.setTextColor(0, 0, 0)
      doc.text(interestLines, rightColumnX, rightY)
      rightY += interestLines.length * lineSpacing + sectionSpacing
    }

    doc.save('resume.pdf')
    this.showGenerateCVModal = false
    this.sweetAlertService.showSuccess(
      'CV generated and downloaded successfully!'
    )
    this.resumeForm.reset()
    this.photoBase64 = null
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const base64String = reader.result as string
        resolve(base64String.split(',')[1] || base64String)
      }
      reader.onerror = (error) => reject(error)
      reader.readAsDataURL(file)
    })
  }

  get f() {
    return this.candidateForm.controls
  }

  get r() {
    return this.resumeForm.controls
  }
}
