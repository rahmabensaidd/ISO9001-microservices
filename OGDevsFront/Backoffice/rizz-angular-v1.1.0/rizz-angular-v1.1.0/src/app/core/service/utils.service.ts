import { Injectable } from '@angular/core'

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  constructor() {}

  dividePercentage(percentage: any) {
    const percent: any = percentage / 3
    const value = parseInt(percent)
    return value
  }
}
