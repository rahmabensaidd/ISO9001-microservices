import { Component, OnInit, TemplateRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DataService } from '@/app/services/data.service';
import { Data, TypeData } from '@/app/core/models/data.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-data-management',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    NgbModalModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './data-management.component.html',
  styleUrls: ['./data-management.component.css']
})
export class DataManagementComponent implements OnInit, OnDestroy {
  dataList: Data[] = [];
  dataForm: FormGroup;
  modifyForm: FormGroup;
  submitted: boolean = false;
  selectedDataId?: number;
  typeDataOptions = Object.values(TypeData);
  private dataSubscription: Subscription | null = null;

  constructor(
    private dataService: DataService,
    private modalService: NgbModal,
    private fb: FormBuilder
  ) {
    this.dataForm = this.fb.group({
      datatype: [TypeData.INPUT, [Validators.required]],
      content: ['', [Validators.required]],
      registrationDate: ['', [Validators.required]]
    });
    this.modifyForm = this.fb.group({
      datatype: [TypeData.INPUT, [Validators.required]],
      content: ['', [Validators.required]],
      registrationDate: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }

  // Notification methods translated to English
  private showSuccess(message: string): void {
    Swal.fire({
      title: 'Success!',
      text: message,
      icon: 'success',
      confirmButtonColor: '#5156be'
    });
  }

  private showError(message: string): void {
    Swal.fire({
      title: 'Error!',
      text: message,
      icon: 'error',
      confirmButtonColor: '#5156be'
    });
  }

  private showWarningConfirm(message: string, confirmButtonText: string = 'Yes, delete it!'): Promise<boolean> {
    return Swal.fire({
      title: 'Are you sure?',
      text: message,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: confirmButtonText,
      cancelButtonText: 'No, cancel!'
    }).then((result) => {
      return result.isConfirmed;
    });
  }

  async loadData(): Promise<void> {
    try {
      const dataObservable = this.dataService.getAllData();
      this.dataSubscription = dataObservable.subscribe({
        next: (data: Data[]) => {
          this.dataList = data;
          console.log('Data loaded:', JSON.stringify(this.dataList, null, 2));
        },
        error: (error) => {
          console.error('Error loading data:', error);
          this.showError('Error loading data.');
        }
      });
    } catch (error) {
      console.error('Error initiating loadData:', error);
      this.showError('Error initiating data loading.');
    }
  }

  openAddDataModal(content: TemplateRef<any>): void {
    this.submitted = false;
    this.dataForm.reset({ datatype: TypeData.INPUT, content: '', registrationDate: '' });
    this.modalService.open(content);
  }

  openModifyDataModal(content: TemplateRef<any>, data: Data): void {
    this.submitted = false;
    this.selectedDataId = data.id;
    this.modifyForm.patchValue({
      datatype: data.datatype,
      content: data.content,
      registrationDate: data.registrationDate
    });
    this.modalService.open(content);
  }

  async createData(): Promise<void> {
    this.submitted = true;
    if (this.dataForm.valid) {
      const newData: Data = this.dataForm.value;
      try {
        const dataObservable = this.dataService.addData(newData);
        dataObservable.subscribe({
          next: (data: Data) => {
            this.dataList.push(data);
            console.log('Data created:', data);
            this.modalService.dismissAll();
            this.submitted = false;
            this.showSuccess('Data created successfully!');
          },
          error: (error) => {
            console.error('Error creating data:', error);
            this.showError('Error creating data.');
          }
        });
      } catch (error) {
        console.error('Error initiating createData:', error);
        this.showError('Error initiating data creation.');
      }
    } else {
      this.showError('Please fill all required fields.');
    }
  }

  async modifyData(): Promise<void> {
    this.submitted = true;
    if (this.modifyForm.valid && this.selectedDataId) {
      const updatedData: Data = { id: this.selectedDataId, ...this.modifyForm.value };
      try {
        const dataObservable = this.dataService.updateData(this.selectedDataId, updatedData);
        dataObservable.subscribe({
          next: (data: Data) => {
            console.log('Data updated:', data);
            const index = this.dataList.findIndex(d => d.id === data.id);
            if (index !== -1) {
              this.dataList[index] = data;
            }
            this.modalService.dismissAll();
            this.submitted = false;
            this.showSuccess('Data updated successfully!');
          },
          error: (error) => {
            console.error('Error updating data:', error);
            this.showError('Error updating data.');
          }
        });
      } catch (error) {
        console.error('Error initiating modifyData:', error);
        this.showError('Error initiating data update.');
      }
    } else {
      this.showError('Please fill all required fields.');
    }
  }

  async deleteData(id?: number): Promise<void> {
    if (id) {
      const confirmed = await this.showWarningConfirm(
        'This action cannot be undone!',
        'Yes, delete it!'
      );
      if (confirmed) {
        try {
          const deleteObservable = this.dataService.deleteData(id);
          deleteObservable.subscribe({
            next: () => {
              this.dataList = this.dataList.filter(d => d.id !== id);
              console.log('Data deleted:', id);
              this.showSuccess('Data deleted successfully!');
            },
            error: (error) => {
              console.error('Error deleting data:', error);
              this.showError('Error deleting data.');
            }
          });
        } catch (error) {
          console.error('Error initiating deleteData:', error);
          this.showError('Error initiating data deletion.');
        }
      }
    }
  }

  get form() {
    return this.dataForm.controls;
  }

  get modifyFormControls() {
    return this.modifyForm.controls;
  }
}

export class DataComponent {
}
