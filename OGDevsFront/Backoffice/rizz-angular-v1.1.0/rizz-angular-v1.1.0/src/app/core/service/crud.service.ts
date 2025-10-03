import { Injectable } from '@angular/core'
import { Observable, of } from 'rxjs'

import { defaultEvents } from '@/app/store/calendar/data'
import type { EventInput } from '@fullcalendar/core'
import {
  kanbanSectionsData,
  kanbanTasksData,
  type KanbanSectionType,
  type KanbanTaskType,
} from '@/app/store/kanban/data'

@Injectable({ providedIn: 'root' })
export class CrudService {
  constructor() {}

  /***
   * Get
   */
  fetchCalendarEvents(): Observable<EventInput[]> {
    return of(defaultEvents)
  }

  addCalendarEvents(newData: EventInput): Observable<EventInput[]> {
    let newEvents = [...defaultEvents, newData] // Create a new array by spreading defaultEvents and adding newData
    return of(newEvents)
  }

  updateCalendarEvents(updatedData: EventInput): Observable<EventInput[]> {
    const index = defaultEvents.findIndex((item) => item.id === updatedData.id)
    let updatedEvents = defaultEvents.slice()
    if (index !== -1) {
      updatedEvents[index] = updatedData
    }
    return of(updatedEvents)
  }

  deleteCalendarEvents(id: string): Observable<EventInput[]> {
    return of(defaultEvents.filter((item) => item.id !== id))
  }

  // Kanban Tasks
  fetchBoard(): Observable<KanbanSectionType[]> {
    return of(kanbanSectionsData)
  }

  addKanbanBoard(newData: KanbanSectionType): Observable<KanbanSectionType[]> {
    let newTasks = [...kanbanSectionsData, newData] // Create a new array by spreading defaultEvents and adding newData
    return of(newTasks)
  }

  deleteKanbanBoard(id: string): Observable<KanbanSectionType[]> {
    return of(kanbanSectionsData.filter((item) => item.id !== id))
  }

  fetchTask(): Observable<KanbanTaskType[]> {
    return of(kanbanTasksData)
  }

  addKanbanTask(newData: KanbanTaskType): Observable<KanbanTaskType[]> {
    let newTasks = [...kanbanTasksData, newData] // Create a new array by spreading defaultEvents and adding newData
    return of(newTasks)
  }

  updatekanbantask(updatedData: KanbanTaskType): Observable<KanbanTaskType[]> {
    const index = kanbanTasksData.findIndex(
      (item) => item.id === updatedData.id
    )
    let updatedEvents = kanbanTasksData.slice()
    if (index !== -1) {
      updatedEvents[index] = updatedData
    }
    return of(updatedEvents)
  }
}
