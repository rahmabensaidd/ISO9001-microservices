// calendar-event.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Training } from './training.service';
import { Interview } from './interview.service';
import { EventInput } from '@fullcalendar/core';

export interface CalendarEvent {
  title: string;
  start: string;
  end?: string;
  type: 'TRAINING' | 'INTERVIEW';
  id: string; // Changé de number | undefined à string
}

@Injectable({
  providedIn: 'root',
})
export class CalendarEventService {
  private eventsSubject = new BehaviorSubject<CalendarEvent[]>([]);
  events$: Observable<CalendarEvent[]> = this.eventsSubject.asObservable();

  constructor() {}

  addTrainingEvent(training: Training): void {
    const currentEvents = this.eventsSubject.value;
    const newEvent: CalendarEvent = {
      title: training.trainingName,
      start: training.scheduledDate,
      end: new Date(new Date(training.scheduledDate).getTime() + training.duration * 60 * 60 * 1000).toISOString(),
      type: 'TRAINING',
      id: String(training.trainingId), // Convertir number en string
    };
    this.eventsSubject.next([...currentEvents.filter(e => e.id !== newEvent.id), newEvent]);
  }

  addInterviewEvent(interview: Interview): void {
    const currentEvents = this.eventsSubject.value;
    const newEvent: CalendarEvent = {
      title: interview.name,
      start: interview.interviewDate,
      end: new Date(new Date(interview.interviewDate).getTime() + 60 * 60 * 1000).toISOString(),
      type: 'INTERVIEW',
      id: String(interview.idInterview), // Convertir number en string
    };
    this.eventsSubject.next([...currentEvents.filter(e => e.id !== newEvent.id), newEvent]);
  }

  updateEvent(updatedEvent: CalendarEvent): void {
    const currentEvents = this.eventsSubject.value.map((event) =>
      event.id === updatedEvent.id && event.type === updatedEvent.type ? updatedEvent : event
    );
    this.eventsSubject.next(currentEvents);
  }

  removeEvent(id: string, type: 'TRAINING' | 'INTERVIEW'): void {
    const currentEvents = this.eventsSubject.value.filter((event) => !(event.id === id && event.type === type));
    this.eventsSubject.next(currentEvents);
  }

  getEvents(): EventInput[] {
    return this.eventsSubject.value.map(event => ({
      ...event,
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end,
    }));
  }
}
