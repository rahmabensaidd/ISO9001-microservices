import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { NgbDropdownModule, NgbPaginationModule, NgbModalModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CurrencyService, ExchangeRate } from "@/app/services/currency.service";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    NgApexchartsModule,
    NgSelectModule,
    NgbDropdownModule,
    NgbPaginationModule,
    NgbModalModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  exchangeRates: ExchangeRate[] = [];
  filteredRates: ExchangeRate[] = [];
  searchTerm: string = '';
  conversionHistory: any[] = [];
  ratesLoaded: boolean = false;
  currenciesLoaded: boolean = false;

  // Conversion
  amount: number = 1.0;
  fromCurrency: string = '';
  toCurrency: string = '';
  convertedAmount: number | null = null;
  conversionRate: string = '';
  inverseRate: string = '';
  availableCurrencies: string[] = [];

  // Pagination pour le tableau
  currentPage: number = 1;
  pageSize: number = 5;
  totalItems: number = 0;

  // Débouncing pour la recherche
  private searchSubject = new Subject<string>();
  private searchSubscription: Subscription | null = null;

  // Configuration du graphique ApexCharts
  chartOptions: any = {
    series: [{ name: 'Exchange Rates', data: [] }],
    chart: {
      height: 350,
      type: 'bar',
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true
        }
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        dataLabels: {
          position: 'top'
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => val.toFixed(2),
      offsetY: -20,
      style: {
        fontSize: '12px',
        colors: ['#304758']
      }
    },
    xaxis: {
      categories: [],
      title: {
        text: 'Currency' // Ajout d'un titre pour clarifier que l'axe X représente les devises
      },
      labels: {
        rotate: -45,
        style: {
          fontSize: '12px'
        },
        formatter: (val: string) => val // Forcer l'affichage des devises telles qu'elles sont dans categories
      }
    },
    yaxis: {
      logarithmic: false, // Désactiver l'échelle logarithmique pour une échelle linéaire
      title: {
        text: 'Exchange Rate (USD Base)'
      },
      labels: {
        formatter: (val: number) => val.toFixed(2)
      },
      min: 0, // Début de l'axe Y à 0
      max: (max: number) => Math.ceil(max * 1.1), // Ajuster dynamiquement le max avec une marge de 10%
      tickAmount: 5 // Nombre de ticks pour une meilleure lisibilité
    },
    title: {
      text: 'Top 10 Exchange Rates (USD Base)',
      align: 'center'
    },
    colors: ['#008FFB'],
    grid: {
      borderColor: '#e7e7e7'
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val.toFixed(2)} USD`
      }
    }
  };

  constructor(private currencyService: CurrencyService, private modalService: NgbModal) {}

  ngOnInit(): void {
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.searchTerm = searchTerm;
      this.filterRates();
    });

    this.checkRates();
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  checkRates(): void {
    this.currencyService.hasRates().subscribe(hasRates => {
      this.ratesLoaded = hasRates;
      if (hasRates) {
        this.loadCurrencies();
        this.loadRates();
      }
    });
  }

  loadCurrencies(): void {
    this.currencyService.getAvailableCurrencies().subscribe(currencies => {
      this.availableCurrencies = currencies;
      this.currenciesLoaded = true;
      if (currencies.length > 0) {
        this.fromCurrency = currencies[0];
        this.toCurrency = currencies[1] || currencies[0];
      }
    }, error => {
      console.error('Erreur lors du chargement des devises:', error);
      this.currenciesLoaded = false;
    });
  }

  loadRates(): void {
    this.currencyService.getExchangeRates().subscribe(rates => {
      this.currencyService.getPreviousRates().subscribe(previousRates => {
        this.exchangeRates = Array.from(rates.entries()).map(([currency, rate]) => {
          const prevRate = previousRates.get(currency) ?? (rates.get(currency) ?? rate);
          console.log(`Currency: ${currency}, Rate: ${rate}, Previous Rate: ${prevRate}`);
          return {
            currency,
            rate,
            previousRate: prevRate
          };
        });
        this.filteredRates = this.exchangeRates;
        this.updatePagination();

        const topRates = this.exchangeRates.slice(0, 10);
        if (topRates.length > 0) {
          this.chartOptions.xaxis.categories = topRates.map(r => r.currency);
          this.chartOptions.series = [{
            name: 'Exchange Rates',
            data: topRates.map(r => r.rate)
          }];
          this.ratesLoaded = true;
        } else {
          this.chartOptions.xaxis.categories = [];
          this.chartOptions.series = [{ name: 'Exchange Rates', data: [] }];
          this.ratesLoaded = false;
        }
      }, error => {
        console.error('Erreur lors de la récupération des taux précédents:', error);
        this.chartOptions.xaxis.categories = [];
        this.chartOptions.series = [{ name: 'Exchange Rates', data: [] }];
        this.ratesLoaded = false;
      });
    }, error => {
      console.error('Erreur lors de la récupération des taux:', error);
      this.chartOptions.xaxis.categories = [];
      this.chartOptions.series = [{ name: 'Exchange Rates', data: [] }];
      this.ratesLoaded = false;
    });
  }

  convertCurrency(modalContent: any): void {
    if (!this.ratesLoaded) {
      this.loadRates();
    }
    const request = { amount: this.amount, fromCurrency: this.fromCurrency, toCurrency: this.toCurrency };
    this.currencyService.convertCurrency(request).subscribe(response => {
      if ('error' in response) {
        alert(response['error']);
      } else {
        this.convertedAmount = response['convertedAmount'] as number;
        this.conversionRate = response['rate'] as string;
        this.inverseRate = response['inverseRate'] as string;
        this.conversionHistory.unshift({
          amount: this.amount,
          fromCurrency: this.fromCurrency,
          toCurrency: this.toCurrency,
          convertedAmount: this.convertedAmount,
          timestamp: new Date().toISOString()
        });
        this.modalService.open(modalContent, { centered: true });
      }
    }, error => {
      console.error('Erreur lors de la conversion:', error);
      alert('Une erreur est survenue lors de la conversion.');
    });
  }

  onSearchChange(searchTerm: string): void {
    this.searchSubject.next(searchTerm);
  }

  filterRates(): void {
    this.filteredRates = this.exchangeRates.filter(rate =>
      rate.currency.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.updatePagination();
    this.currentPage = 1;
  }

  updatePagination(): void {
    this.totalItems = this.filteredRates.length;
  }

  getPaginatedRates(): ExchangeRate[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredRates.slice(startIndex, startIndex + this.pageSize);
  }

  sortRates(key: string, ascending: boolean): void {
    this.filteredRates.sort((a, b) => {
      const valA = a[key as keyof ExchangeRate];
      const valB = b[key as keyof ExchangeRate];
      const tolerance = 0.0001;
      if (typeof valA === 'number' && typeof valB === 'number') {
        if (Math.abs(valA - valB) < tolerance) return 0;
        return ascending ? (valA - valB) : (valB - valA);
      }
      return ascending ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });
    this.updatePagination();
  }

  compareRates(rate: number, previousRate: number): number {
    const tolerance = 0.0001;
    const difference = rate - previousRate;
    if (Math.abs(difference) < tolerance) {
      return 0;
    }
    return difference > 0 ? 1 : -1;
  }
}
