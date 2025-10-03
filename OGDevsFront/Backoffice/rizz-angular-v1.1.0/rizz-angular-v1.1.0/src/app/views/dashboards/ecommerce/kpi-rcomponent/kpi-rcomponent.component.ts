import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Kpi, Report } from '@core/models/Kpi.model';
import { ApexOptions } from 'ng-apexcharts';
import { IndicateurService } from '@/app/services/indicateur.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import { CardTitleComponent } from '@/app/components/card-title.component';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { KeycloakService } from 'keycloak-angular';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-kpi-rcomponent',
  templateUrl: './kpi-rcomponent.component.html',
  styleUrls: ['./kpi-rcomponent.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, NgApexchartsModule, CardTitleComponent],
})
export class KpiRcomponentComponent implements OnInit {
  kpis: Kpi[] = [];
  selectedKpi: Kpi | null = null;
  isEditing: boolean = false;
  isLoading: boolean = false;
  fileContent: string | ArrayBuffer | null = null;
  reports: Report[] = [];
  selectedReport: Report | null = null;
  isEditingReport: boolean = false;
  selectedPeriod: string = 'Monthly';
  reportTitle: string = '';
  currentUser: string = 'Connected User';
  selectedKpiIds: number[] = [];

  columnChart: Partial<ApexOptions> = {
    chart: { height: 350, type: 'bar', toolbar: { show: false } },
    series: [],
    xaxis: { categories: [] },
    yaxis: { title: { text: 'Current Value' } },
    colors: ['#22c55e'],
    dataLabels: { enabled: false },
    plotOptions: { bar: { horizontal: false } },
    tooltip: { y: { formatter: (value) => `${value}%` } },
  };

  lineChart: Partial<ApexOptions> = {
    chart: {
      height: 280,
      type: 'line',
      toolbar: { show: false },
      dropShadow: { enabled: true, top: 12, left: 0, blur: 2, color: 'rgba(132, 145, 183, 0.3)', opacity: 0.35 },
    },
    annotations: { points: [] },
    colors: ['#ef4444', '#3b82f6'],
    dataLabels: { enabled: false },
    stroke: { show: true, curve: 'smooth', width: [3, 3], dashArray: [0, 0], lineCap: 'round' },
    series: [],
    labels: ['Point 1', 'Point 2', 'Point 3'],
    yaxis: { labels: { offsetX: -12, offsetY: 0, formatter: (value) => `${value}%` } },
    grid: { strokeDashArray: 3, xaxis: { lines: { show: true } }, yaxis: { lines: { show: false } } },
    legend: { show: true, position: 'top' },
    fill: { type: 'gradient', gradient: { type: 'vertical', shadeIntensity: 1, inverseColors: false, opacityFrom: 0.05, opacityTo: 0.05, stops: [45, 100] } },
  };

  apexArea2: Partial<ApexOptions> = {
    chart: { height: 350, type: 'area', toolbar: { show: true } },
    annotations: { xaxis: [], yaxis: [], points: [] },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.9, stops: [0, 100] } },
    markers: { size: 0 },
    tooltip: { shared: true, intersect: false, y: { formatter: (value) => `${value}%` } },
    series: [],
    colors: ['#4caf50'],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    grid: { borderColor: '#e7e7e7', row: { colors: ['#fff', 'transparent'], opacity: 0.5 } },
    xaxis: {
      type: 'datetime',
      categories: [],
      labels: { format: 'MMM yyyy' },
    },
  };

  frequencyChart: Partial<ApexOptions> = {
    chart: { height: 350, type: 'bar', toolbar: { show: false } },
    series: [{ name: 'Number of KPIs by Frequency', data: [] }],
    xaxis: { categories: ['Monthly', 'Annual'], title: { text: 'Frequency' } },
    yaxis: { title: { text: 'Number of KPIs' } },
    colors: ['#ff9800'],
    dataLabels: { enabled: false },
    plotOptions: { bar: { horizontal: false } },
    tooltip: { y: { formatter: (value) => `${value} KPIs` } },
  };

  targetChart: Partial<ApexOptions> = {
    chart: { height: 350, type: 'bar', toolbar: { show: false } },
    series: [
      { name: 'Target', data: [] },
      { name: 'Current Value', data: [] },
    ],
    xaxis: { categories: [], title: { text: 'KPI Code' } },
    yaxis: { title: { text: 'Value' } },
    colors: ['#2196f3', '#4caf50'],
    dataLabels: { enabled: false },
    plotOptions: { bar: { horizontal: false } },
    tooltip: { y: { formatter: (value) => `${value}` } },
  };

  constructor(
    private indicateurService: IndicateurService,
    private keycloakService: KeycloakService
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
    this.loadKpis();
    this.loadReports();
  }

  async loadUserInfo() {
    try {
      const isLoggedIn = await this.keycloakService.isLoggedIn();
      if (isLoggedIn) {
        const token = await this.keycloakService.getToken();
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        this.currentUser = tokenPayload.name || tokenPayload.preferred_username || 'Connected User';
      } else {
        this.currentUser = 'Not Connected User';
      }
    } catch (error) {
      console.error('Error retrieving user information:', error);
      this.currentUser = 'Not Connected User';
    }
  }

  loadKpis(): void {
    this.isLoading = true;
    this.indicateurService.getAllKpis().subscribe({
      next: (kpis: Kpi[]) => {
        this.kpis = kpis;
        this.updateCharts();
        this.updateAreaChart();
        this.updateFrequencyChart();
        this.updateTargetChart();
      },
      error: (err: HttpErrorResponse) => {
        Swal.fire('Error', `Unable to load KPIs: ${err.message}`, 'error');
      },
      complete: () => (this.isLoading = false),
    });
  }

  loadReports(): void {
    this.indicateurService.getAllReports().subscribe({
      next: (reports: Report[]) => (this.reports = reports),
      error: (err: HttpErrorResponse) => Swal.fire('Error', `Unable to load reports: ${err.message}`, 'error'),
    });
  }

  updateCharts(): void {
    this.columnChart.series = [
      { name: 'Current Value', data: this.kpis.map(kpi => kpi.currentValue || 0) },
      { name: 'Target', data: this.kpis.map(kpi => kpi.cible || 0) },
    ];
    this.columnChart.xaxis = { categories: this.kpis.map(kpi => kpi.code) };

    this.lineChart.series = this.kpis.map(kpi => ({
      name: kpi.code,
      data: this.simulateTrend(kpi.currentValue || 0, kpi.cible || 0),
    }));
    this.lineChart.annotations = {
      points: this.kpis.length > 0 ? [{
        x: 'Point 1',
        y: this.kpis[0].currentValue || 0,
        marker: { size: 6, fillColor: '#007bff', strokeColor: '#fff', strokeWidth: 4 },
        label: { borderWidth: 1, offsetY: -110, text: `${this.kpis[0].currentValue || 0}${this.kpis[0].unite}`, style: { background: '#007bff', fontSize: '14px', fontWeight: '600', color: '#fff' } },
      }] : [],
    };
  }

  updateAreaChart(): void {
    const dates = this.kpis.map((kpi, i) => new Date(2024, i, 1).toISOString().split('T')[0]);
    this.apexArea2.series = [
      { name: 'Current Value', data: this.kpis.map(kpi => kpi.currentValue || 0) },
      { name: 'Target', data: this.kpis.map(kpi => kpi.cible || 0) },
    ];
    this.apexArea2.xaxis = { type: 'datetime', categories: dates, labels: { format: 'MMM yyyy' } };
  }

  updateAreaChartRange(range: string): void {
    const now = new Date();
    let startDate: Date;
    let categories: string[] = [];
    let data: number[] = [];
    let targetData: number[] = [];

    switch (range) {
      case '1m':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        categories = this.kpis.slice(-4).map((_, i) => new Date(startDate.getTime() + i * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
        data = this.kpis.slice(-4).map(kpi => kpi.currentValue || 0);
        targetData = this.kpis.slice(-4).map(kpi => kpi.cible || 0);
        break;
      case '6m':
        startDate = new Date(now.setMonth(now.getMonth() - 6));
        categories = this.kpis.slice(-26).map((_, i) => new Date(startDate.getTime() + i * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
        data = this.kpis.slice(-26).map(kpi => kpi.currentValue || 0);
        targetData = this.kpis.slice(-26).map(kpi => kpi.cible || 0);
        break;
      case '1y':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        categories = this.kpis.slice(-52).map((_, i) => new Date(startDate.getTime() + i * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
        data = this.kpis.slice(-52).map(kpi => kpi.currentValue || 0);
        targetData = this.kpis.slice(-52).map(kpi => kpi.cible || 0);
        break;
      case 'ytd':
        startDate = new Date(now.getFullYear(), 0, 1);
        categories = this.kpis.map((_, i) => new Date(startDate.getTime() + i * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
        data = this.kpis.map(kpi => kpi.currentValue || 0);
        targetData = this.kpis.map(kpi => kpi.cible || 0);
        break;
      case 'all':
        categories = this.kpis.map((_, i) => new Date(2024, i, 1).toISOString().split('T')[0]);
        data = this.kpis.map(kpi => kpi.currentValue || 0);
        targetData = this.kpis.map(kpi => kpi.cible || 0);
        break;
    }

    this.apexArea2.series = [
      { name: 'Current Value', data: data },
      { name: 'Target', data: targetData },
    ];
    this.apexArea2.xaxis = { type: 'datetime', categories: categories, labels: { format: 'MMM yyyy' } };
    const buttons = document.querySelectorAll('.toolbar button');
    buttons.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`#${range}`)?.classList.add('active');
  }

  updateFrequencyChart(): void {
    const monthlyCount = this.kpis.filter(kpi => kpi.frequence === 'Monthly').length;
    const annualCount = this.kpis.filter(kpi => kpi.frequence === 'Annual').length;
    this.frequencyChart.series = [
      { name: 'Number of KPIs by Frequency', data: [monthlyCount, annualCount] },
    ];
  }

  updateTargetChart(): void {
    this.targetChart.series = [
      { name: 'Target', data: this.kpis.map(kpi => kpi.cible || 0) },
      { name: 'Current Value', data: this.kpis.map(kpi => kpi.currentValue || 0) },
    ];
    this.targetChart.xaxis = { categories: this.kpis.map(kpi => kpi.code) };
  }

  simulateTrend(currentValue: number, target: number): number[] {
    return [currentValue, (currentValue + target) / 2, target];
  }

  addKpi(): void {
    this.selectedKpi = { code: '', libelle: '', methodeCalcul: '', frequence: 'Monthly', unite: '%', cible: 0, actif: 'Yes' };
    this.isEditing = true;
  }

  editKpi(kpi: Kpi): void {
    this.selectedKpi = { ...kpi };
    this.isEditing = true;
  }

  saveKpi(): void {
    if (!this.validateKpiForm()) return;

    Swal.fire({
      title: this.selectedKpi?.idIndicateur ? 'Edit KPI' : 'Add KPI',
      text: 'Do you want to save this KPI?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.isConfirmed && this.selectedKpi) {
        const action = this.selectedKpi.idIndicateur
          ? this.indicateurService.updateKpi(this.selectedKpi)
          : this.indicateurService.createKpi(this.selectedKpi);
        action.subscribe({
          next: () => {
            this.loadKpis();
            Swal.fire('Success', 'KPI saved successfully!', 'success');
          },
          error: (err: HttpErrorResponse) => Swal.fire('Error', `Unable to save KPI: ${err.message}`, 'error'),
          complete: () => this.resetForm(),
        });
      }
    });
  }

  deleteKpi(id: number): void {
    Swal.fire({
      title: 'Delete KPI',
      text: 'Are you sure you want to delete this KPI?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.indicateurService.deleteKpi(id).subscribe({
          next: () => {
            this.loadKpis();
            Swal.fire('Success', 'KPI deleted successfully!', 'success');
          },
          error: (err: HttpErrorResponse) => Swal.fire('Error', `Unable to delete KPI: ${err.message}`, 'error'),
        });
      }
    });
  }

  addReport(): void {
    this.selectedReport = {
      title: '',
      content: '',
      dateCreation: new Date().toISOString().split('T')[0],
      createdBy: this.currentUser,
      impactLevel: 'Medium',
      statut: 'DRAFT',
      indicators: [],
      performanceScore: 0,
      tauxConformite: 0,
      tendances: '',
    };
    this.selectedKpiIds = [];
    this.isEditingReport = true;
  }

  editReport(report: Report): void {
    this.selectedReport = { ...report };
    if (report.indicators) {
      this.selectedKpiIds = report.indicators.map(ind => ind.idIndicateur!).filter(id => id !== undefined);
    }
    this.isEditingReport = true;
  }

  saveReport(): void {
    if (!this.validateReportForm()) return;

    Swal.fire({
      title: this.selectedReport?.id ? 'Edit Report' : 'Add Report',
      text: 'Do you want to save this report?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.isConfirmed && this.selectedReport) {
        this.selectedReport.indicatorIds = this.selectedKpiIds;
        this.selectedReport.indicators = [];
        this.selectedReport.performanceScore = this.calculatePerformanceScore();
        this.selectedReport.tauxConformite = this.calculateConformanceRate();
        this.selectedReport.tendances = this.calculateTrends();

        const action = this.selectedReport.id
          ? this.indicateurService.updateReport(this.selectedReport)
          : this.indicateurService.createReport(this.selectedReport);
        action.subscribe({
          next: () => {
            this.loadReports();
            Swal.fire('Success', 'Report saved successfully!', 'success');
          },
          error: (err: HttpErrorResponse) => Swal.fire('Error', `Unable to save report: ${err.message}`, 'error'),
          complete: () => this.resetReportForm(),
        });
      }
    });
  }

  deleteReport(id: number): void {
    Swal.fire({
      title: 'Delete Report',
      text: 'Are you sure you want to delete this report?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.indicateurService.deleteReport(id).subscribe({
          next: () => {
            this.loadReports();
            Swal.fire('Success', 'Report deleted successfully!', 'success');
          },
          error: (err: HttpErrorResponse) => Swal.fire('Error', `Unable to delete report: ${err.message}`, 'error'),
        });
      }
    });
  }

  viewReport(report: Report): void {
    Swal.fire({
      title: report.title,
      html: `
        <p><strong>Creation Date:</strong> ${report.dateCreation ? new Date(report.dateCreation).toLocaleDateString() : 'N/A'}</p>
        <p><strong>Created by:</strong> ${report.createdBy || 'N/A'}</p>
        <p><strong>Status:</strong> ${report.statut || 'N/A'}</p>
        <p><strong>Content:</strong> ${(report.content || 'N/A').replace(/\n/g, '<br>')}</p>
        <p><strong>Performance Score:</strong> ${report.performanceScore || 'N/A'}</p>
        <p><strong>Conformance Rate:</strong> ${report.tauxConformite || 'N/A'}%</p>
        <p><strong>Trends:</strong> ${(report.tendances || 'N/A').replace(/\n/g, '<br>')}</p>
      `,
      icon: 'info',
      showCloseButton: true,
      showCancelButton: true,
      cancelButtonText: 'Close',
      showConfirmButton: true,
      confirmButtonText: 'Download PDF',
    }).then((result) => {
      if (result.isConfirmed) {
        this.downloadPDF(report);
      }
    });
  }

  downloadPDF(report: Report): void {
    Swal.fire({
      title: 'Download Report',
      text: `Do you want to download the report "${report.title}" as a PDF?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.isConfirmed) {
        const doc = new jsPDF();
        const logoPath = 'assets/images/cropped-coconsultlogo_flood2__3_.png';

        // Add logo if available
        if (logoPath) {
          try {
            const img = new Image();
            img.src = logoPath;
            img.onload = () => {
              doc.addImage(img, 'PNG', 10, 10, 30, 30);
              this.addReportContentToPDF(doc, report);
            };
            img.onerror = () => {
              console.warn('Logo not found, generating PDF without logo.');
              this.addReportContentToPDF(doc, report);
            };
          } catch (e) {
            console.warn('Error loading logo:', e);
            this.addReportContentToPDF(doc, report);
          }
        } else {
          this.addReportContentToPDF(doc, report);
        }
      }
    });
  }

  validateKpiForm(): boolean {
    if (!this.selectedKpi?.code || !this.selectedKpi.libelle || !this.selectedKpi.frequence || !this.selectedKpi.unite || this.selectedKpi.cible === undefined) {
      Swal.fire('Error', 'All mandatory fields (Code, Label, Frequency, Unit, Target) must be filled.', 'error');
      return false;
    }
    return true;
  }

  validateReportForm(): boolean {
    if (!this.selectedReport?.title || !this.selectedReport.content) {
      Swal.fire('Error', 'The report title and content are required.', 'error');
      return false;
    }
    if (this.selectedKpiIds.length === 0) {
      Swal.fire('Error', 'Please select at least one KPI for the report.', 'error');
      return false;
    }
    return true;
  }

  resetForm(): void {
    this.selectedKpi = null;
    this.isEditing = false;
  }

  resetReportForm(): void {
    this.selectedReport = null;
    this.isEditingReport = false;
    this.selectedKpiIds = [];
  }

  handleFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      if (fileExtension === 'csv') {
        this.uploadKpisFromFile(file, 'csv');
      } else if (fileExtension === 'pdf') {
        this.uploadKpisFromFile(file, 'pdf');
      } else {
        Swal.fire('Error', 'Only CSV and PDF files are supported.', 'error');
      }
    }
  }

  uploadKpisFromFile(file: File, type: 'csv' | 'pdf'): void {
    const uploadObservable: Observable<Kpi[]> = type === 'csv'
      ? this.indicateurService.uploadCsvIndicators(file)
      : this.indicateurService.uploadPdfIndicators(file);

    uploadObservable.subscribe({
      next: (savedKpis: Kpi[]) => {
        this.kpis = [...this.kpis, ...savedKpis];
        this.updateCharts();
        this.updateAreaChart();
        this.updateFrequencyChart();
        this.updateTargetChart();
        Swal.fire('Success', 'KPIs uploaded successfully!', 'success');
      },
      error: (err: HttpErrorResponse) => Swal.fire('Error', `Unable to upload KPIs: ${err.message}`, 'error'),
    });
  }

  generateReport(): void {
    if (!this.reportTitle.trim()) {
      Swal.fire('Error', 'The report title is required.', 'error');
      return;
    }

    Swal.fire({
      title: 'Generate Report',
      text: 'Do you want to generate this report as a PDF?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.isConfirmed) {
        this.indicateurService.generatePeriodicReport(this.selectedPeriod).subscribe({
          next: (reportContent: string) => {
            const currentUser = this.currentUser;
            const currentDate = new Date().toISOString().split('T')[0];
            const logoPath = 'assets/images/cropped-coconsultlogo_flood2__3_.png';

            const newReport: Report = {
              title: this.reportTitle,
              content: `Report Period: ${this.selectedPeriod}\nDate: ${currentDate}\nUser: ${currentUser}\nLogo: ${logoPath}\n${reportContent}`,
              dateCreation: currentDate,
              createdBy: currentUser,
              impactLevel: 'Medium',
              statut: 'FINAL',
              indicators: [],
              indicatorIds: this.selectedKpiIds,
              performanceScore: this.calculatePerformanceScore(),
              tauxConformite: this.calculateConformanceRate(),
              tendances: this.calculateTrends(),
            };

            this.indicateurService.createReport(newReport).subscribe({
              next: () => {
                this.loadReports();

                const doc = new jsPDF();

                if (logoPath) {
                  try {
                    const img = new Image();
                    img.src = logoPath;
                    img.onload = () => {
                      doc.addImage(img, 'PNG', 10, 10, 30, 30);
                      this.addReportContentToPDF(doc, newReport);
                    };
                    img.onerror = () => {
                      console.warn('Logo not found, generating PDF without logo.');
                      this.addReportContentToPDF(doc, newReport);
                    };
                  } catch (e) {
                    console.warn('Error loading logo:', e);
                    this.addReportContentToPDF(doc, newReport);
                  }
                } else {
                  this.addReportContentToPDF(doc, newReport);
                }
              },
              error: (err: HttpErrorResponse) => Swal.fire('Error', `Unable to create report: ${err.message}`, 'error'),
            });
          },
          error: (err: HttpErrorResponse) => Swal.fire('Error', `Unable to generate report: ${err.message}`, 'error'),
        });
      }
    });
  }

  private addReportContentToPDF(doc: jsPDF, report: Report): void {
    let yPosition = 50;

    doc.setFontSize(18);
    doc.text(report.title, 20, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.text(`Period: ${this.selectedPeriod}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Date: ${report.dateCreation}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Created by: ${report.createdBy}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Status: ${report.statut}`, 20, yPosition);
    yPosition += 10;

    const kpiData = this.kpis
      .filter(kpi => report.indicatorIds?.includes(kpi.idIndicateur!))
      .map(kpi => [
        kpi.code,
        kpi.libelle,
        kpi.cible?.toString() || 'N/A',
        kpi.currentValue?.toString() || 'N/A',
        kpi.unite,
        kpi.frequence,
      ]);

    if (kpiData.length > 0) {
      doc.setFontSize(14);
      doc.text('Indicators', 20, yPosition);
      yPosition += 8;

      autoTable(doc, {
        startY: yPosition,
        head: [['Code', 'Label', 'Target', 'Current Value', 'Unit', 'Frequency']],
        body: kpiData,
        theme: 'striped',
        headStyles: { fillColor: [33, 150, 243] },
        margin: { top: 10, left: 20, right: 20 },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 10;
    }

    doc.setFontSize(14);
    doc.text('Performance Metrics', 20, yPosition);
    yPosition += 8;
    doc.setFontSize(12);
    doc.text(`Performance Score: ${report.performanceScore?.toFixed(2) || 'N/A'}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Conformance Rate: ${report.tauxConformite?.toFixed(2) || 'N/A'}%`, 20, yPosition);
    yPosition += 8;
    doc.text(`Trends:`, 20, yPosition);
    yPosition += 8;

    const trendsLines = report.tendances?.split('\n') || ['No data available'];
    trendsLines.forEach(line => {
      doc.text(line, 20, yPosition);
      yPosition += 8;
    });

    const chartsToInclude = ['column_chart', 'line_chart', 'apex_area2', 'frequency_chart', 'target_chart'];
    this.addChartsToPDF(doc, chartsToInclude, yPosition, () => {
      doc.save(`${report.title}.pdf`);
    });
  }

  private addChartsToPDF(doc: jsPDF, chartIds: string[], yPosition: number, callback: () => void): void {
    let currentY = yPosition;
    let chartsProcessed = 0;

    if (chartIds.length === 0) {
      callback();
      return;
    }

    chartIds.forEach(chartId => {
      const chartElement = document.getElementById(chartId);
      if (chartElement) {
        html2canvas(chartElement, { scale: 2 }).then(canvas => {
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = 160;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          if (currentY + imgHeight + 20 > doc.internal.pageSize.height) {
            doc.addPage();
            currentY = 20;
          }

          doc.setFontSize(14);
          doc.text(`Chart: ${chartId.replace('_chart', '').replace('apex_area2', 'Area Chart')}`, 20, currentY);
          currentY += 8;
          doc.addImage(imgData, 'PNG', 20, currentY, imgWidth, imgHeight);
          currentY += imgHeight + 10;

          chartsProcessed++;
          if (chartsProcessed === chartIds.length) {
            callback();
          }
        }).catch(err => {
          console.warn(`Error capturing chart ${chartId}:`, err);
          chartsProcessed++;
          if (chartsProcessed === chartIds.length) {
            callback();
          }
        });
      } else {
        console.warn(`Chart element ${chartId} not found.`);
        chartsProcessed++;
        if (chartsProcessed === chartIds.length) {
          callback();
        }
      }
    });
  }

  private calculatePerformanceScore(): number | undefined {
    if (this.kpis.length === 0) return undefined;
    const totalPerformance = this.kpis.reduce((sum, kpi) => sum + (kpi.currentValue || 0), 0);
    return totalPerformance / this.kpis.length;
  }

  private calculateConformanceRate(): number | undefined {
    if (this.kpis.length === 0) return undefined;
    const conformingKpis = this.kpis.filter(kpi => (kpi.currentValue || 0) >= (kpi.cible || 0)).length;
    return (conformingKpis / this.kpis.length) * 100;
  }

  private calculateTrends(): string {
    if (this.kpis.length === 0) return 'No data available';
    const trends = this.kpis.map(kpi => {
      const diff = (kpi.currentValue || 0) - (kpi.cible || 0);
      return `${kpi.code}: ${diff > 0 ? 'Above' : diff < 0 ? 'Below' : 'At target'} (${diff.toFixed(2)} ${kpi.unite})`;
    });
    return trends.join('\n');
  }
}
