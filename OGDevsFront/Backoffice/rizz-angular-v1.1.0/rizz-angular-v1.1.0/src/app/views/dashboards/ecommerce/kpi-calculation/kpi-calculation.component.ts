import { Component, ChangeDetectionStrategy, OnInit, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, of } from 'rxjs';
import { catchError, debounceTime, finalize, tap } from 'rxjs/operators';
import { PredictionKpiService, Kpi, PredictionResponse } from '@/app/services/PredictionKpiService';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import Swal from 'sweetalert2';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexPlotOptions,
  ApexYAxis,
  ApexTooltip,
  ApexGrid,
  ChartComponent
} from 'ng-apexcharts';
import { FindKpiPipe } from '@views/dashboards/ecommerce/kpi-calculation/find-kpi.pipe';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  colors: string[];
  tooltip: ApexTooltip;
  grid: ApexGrid;
};

@Component({
  selector: 'app-kpi-calculation',
  templateUrl: './kpi-calculation.component.html',
  styleUrls: ['./kpi-calculation.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FindKpiPipe,
    NgApexchartsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KpiCalculationComponent implements OnInit {
  @ViewChild('chart') chart: ChartComponent | undefined;
  uploadForm: FormGroup;
  predictions: PredictionResponse[] = [];
  kpis: Kpi[] = [];
  error = '';
  success = '';
  loading = false;
  selectedKpiId: number | null = null;

  lineChart: ChartOptions = {
    series: [],
    chart: {
      type: 'line',
      height: 400,
      zoom: { enabled: true },
      toolbar: { show: true },
      background: '#ffffff', // White background for chart
    },
    xaxis: {
      type: 'datetime',
      title: { text: 'Date' },
      labels: { format: 'MMM yyyy' },
      categories: [],
    },
    yaxis: {
      title: { text: 'Value' },
      labels: { formatter: (val) => val.toFixed(2) },
    },
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      bar: { horizontal: false }, // Default plotOptions (adjust if needed)
    },
    colors: ['#008FFB', '#00E396', '#FF4560'],
    tooltip: {
      enabled: true,
      x: { format: 'dd MMM yyyy' },
    },
    grid: {
      borderColor: '#e7e7e7',
    },
  };

  private uploadSubject = new Subject<File>();

  constructor(
    private predictionKpiService: PredictionKpiService,
    private fb: FormBuilder
  ) {
    this.uploadForm = this.fb.group({
      file: [null, Validators.required],
    });

    this.uploadSubject.pipe(debounceTime(500)).subscribe((file) => {
      this.performFileUpload(file);
    });
  }

  ngOnInit() {}

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (!this.predictionKpiService.isSupportedFile(file)) {
        this.error = 'Only CSV and PDF files are supported.';
        this.uploadForm.get('file')?.setErrors({ invalidFileType: true });
        Swal.fire('Error', this.error, 'error');
        return;
      }
      if (file.size === 0) {
        this.error = 'The selected file is empty.';
        this.uploadForm.get('file')?.setErrors({ emptyFile: true });
        Swal.fire('Error', this.error, 'error');
        return;
      }
      this.uploadForm.patchValue({ file });
      this.uploadForm.get('file')?.updateValueAndValidity();
      this.error = '';
      this.uploadSubject.next(file);
    }
  }

  uploadFile(): void {
    if (this.uploadForm.invalid) {
      this.error = 'Please select a valid CSV or PDF file.';
      Swal.fire('Error', this.error, 'error');
      return;
    }
    const file: File = this.uploadForm.get('file')?.value;
    if (!file) {
      this.error = 'No file selected.';
      Swal.fire('Error', this.error, 'error');
      return;
    }
    this.uploadSubject.next(file);
  }

  onKpiChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedKpiId = select.value ? Number(select.value) : null;
    this.updateChart();
  }

  private performFileUpload(file: File): void {
    this.loading = true;
    this.error = '';
    this.success = '';

    this.predictionKpiService.uploadCsv(file).pipe(
      tap((response: { predictions: PredictionResponse[], kpis: Kpi[] }) => {
        this.predictions = response.predictions;
        this.kpis = response.kpis;
        this.success = 'File uploaded and predictions generated successfully!';
        Swal.fire('Success', this.success, 'success');
        this.updateChart();
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        this.uploadForm.get('file')?.setValue(null, { emitEvent: false });
      }),
      catchError((err: HttpErrorResponse) => {
        this.error = err.error?.detail || 'Error uploading file.';
        Swal.fire('Error', this.error, 'error');
        this.predictions = [];
        this.kpis = [];
        this.updateChart();
        return of({ predictions: [], kpis: [] });
      }),
      finalize(() => {
        this.loading = false;
      })
    ).subscribe();
  }

  private updateChart(): void {
    if (!this.predictions.length || !this.kpis.length) {
      this.lineChart.series = [];
      this.lineChart.xaxis = { ...this.lineChart.xaxis, categories: [] };
      return;
    }

    const filteredPredictions = this.selectedKpiId
      ? this.predictions.filter(p => p.indicatorId === this.selectedKpiId)
      : this.predictions;

    if (!filteredPredictions.length) {
      this.lineChart.series = [];
      this.lineChart.xaxis = { ...this.lineChart.xaxis, categories: [] };
      return;
    }

    const kpiMap = new Map(this.kpis.map(kpi => [kpi.idIndicateur, kpi]));
    const dates: string[] = [];
    const calculatedValues: number[] = [];
    const predictedValues: number[] = [];
    const targetValues: number[] = [];

    filteredPredictions.forEach(pred => {
      dates.push(pred.date);
      calculatedValues.push(pred.calculatedValue);
      predictedValues.push(pred.predictedValue);
      const kpi = kpiMap.get(pred.indicatorId);
      targetValues.push(kpi ? kpi.cible : 0);
    });

    if (!dates.length) {
      this.lineChart.series = [];
      this.lineChart.xaxis = { ...this.lineChart.xaxis, categories: [] };
      return;
    }

    this.lineChart.series = [
      { name: 'Calculated Value', data: calculatedValues },
      { name: 'Predicted Value', data: predictedValues },
      { name: 'Target', data: targetValues },
    ];

    this.lineChart.xaxis = {
      ...this.lineChart.xaxis,
      categories: dates,
    };

    if (this.chart) {
      this.chart.updateOptions({
        series: this.lineChart.series,
        xaxis: this.lineChart.xaxis,
      });
    }
  }

  downloadCsvTemplate(): void {
    const template = `indicator_id,indicator_name,unite,cible,date,calculatedValue\n1,Ventes,eur,100000,2023-01-01,95000\n1,Ventes,eur,100000,2023-02-01,98000\n1,Ventes,eur,100000,2023-03-01,99000`;
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kpi_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  downloadPredictionsAsCsv(): void {
    if (!this.predictions.length || !this.kpis.length) {
      Swal.fire('Error', 'No predictions available to download.', 'error');
      return;
    }

    const kpiMap = new Map(this.kpis.map(kpi => [kpi.idIndicateur, kpi]));
    const headers = [
      'indicator_id',
      'indicator_name',
      'unite',
      'cible',
      'date',
      'calculatedValue',
      'predictedValue',
      'mae',
      'rmse'
    ];

    const rows = this.predictions.map(pred => {
      const kpi = kpiMap.get(pred.indicatorId);
      return [
        pred.indicatorId,
        kpi ? `"${kpi.name.replace(/"/g, '""')}"` : '',
        kpi ? kpi.unite : '',
        kpi ? kpi.cible : 0,
        pred.date,
        pred.calculatedValue,
        pred.predictedValue,
        pred.mae,
        pred.rmse
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kpi_predictions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
