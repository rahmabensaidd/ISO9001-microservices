import { CommonModule } from '@angular/common'
import { Component, Input } from '@angular/core'
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap'

@Component({
    selector: 'card-title',
    imports: [CommonModule, NgbDropdownModule],
    template: `
        <div class="card-header">
            <div class="row align-items-center">
                <div class="col">
                    <h4 class="card-title">{{ title }}</h4>
                </div>
                <!--end col-->
                <div class="col-auto">
                    <div ngbDropdown class="dropdown">
                        <a
                                ngbDropdownToggle
                                class="btn bt btn-light dropdown-toggle"
                                data-bs-toggle="dropdown"
                                aria-haspopup="true"
                                aria-expanded="false"
                        >
                            <i class="icofont-calendar fs-5 me-1"></i> {{
                                selected
                            }}<i class="las la-angle-down ms-1"></i>
                        </a>
                        <div ngbDropdownMenu class="dropdown-menu dropdown-menu-end">
                            <a class="dropdown-item" href="javascript:void(0);">Today</a>
                            <a class="dropdown-item" href="javascript:void(0);">Last Week</a>
                            <a class="dropdown-item" href="javascript:void(0);">Last Month</a>
                            <a class="dropdown-item" href="javascript:void(0);">This Year</a>
                        </div>
                    </div>
                </div>
                <!--end col-->
            </div>
            <!--end row-->
        </div>
        <!--end card-header-->
    `,
    standalone: true,
    styles: ``
})
export class CardTitleComponent {
  @Input() title: string = ''
  @Input() selected: string = ''
}
