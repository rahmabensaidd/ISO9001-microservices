import { Pipe, PipeTransform } from '@angular/core';
import { Kpi } from '@/app/services/PredictionKpiService';

@Pipe({ name: 'findKpi', standalone: true })
export class FindKpiPipe implements PipeTransform {
  /**
   * Finds a KPI by indicatorId and returns its name or cible value.
   * @param kpis Array of Kpi objects.
   * @param indicatorId The ID of the KPI to find.
   * @param field Optional field to return ('cible' for cible value, undefined for name).
   * @returns KPI name (string) or cible (number), or default ('' for name, 0 for cible).
   */
  transform(kpis: Kpi[], indicatorId: number, field?: 'cible'): string | number {
    const kpi = kpis.find(kpi => kpi.idIndicateur === indicatorId);
    if (!kpi) return field === 'cible' ? 0 : '';
    return field === 'cible' ? kpi.cible : kpi.name;
  }
}
