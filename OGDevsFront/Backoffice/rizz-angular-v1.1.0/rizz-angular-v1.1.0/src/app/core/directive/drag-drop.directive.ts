import { Directive, ElementRef, HostListener, Output, EventEmitter } from '@angular/core';

@Directive({
  selector: '[appDropZone]',
  standalone: true,
})
export class DropZoneDirective {
  @Output() dropEvent = new EventEmitter<{ id: number; newStatus: string }>();

  constructor(private el: ElementRef) {
    console.log('DropZoneDirective initialized on:', this.el.nativeElement);
  }

  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent) {
    event.preventDefault(); // Nécessaire pour autoriser le drop
    console.log('Drag over:', this.el.nativeElement);
  }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent) {
    event.preventDefault();

    // Récupère l'ID de la tâche depuis dataTransfer
    const taskId = event.dataTransfer?.getData('text/plain') || 'no-id';
    console.log('Drop event - taskId:', taskId);

    // Récupère le statut de la colonne (newStatus)
    const newStatus = this.el.nativeElement.closest('.task-container')
      ?.querySelector('.task-list')?.textContent?.trim() || '';
    console.log('Drop event - newStatus:', newStatus);

    // Convertit l'ID en number
    const idAsNumber = taskId === 'no-id' ? -1 : parseInt(taskId, 10);

    // Vérifie si l'ID est valide et émet l'événement dropEvent
    if (!isNaN(idAsNumber) && idAsNumber !== -1) {
      this.dropEvent.emit({ id: idAsNumber, newStatus });
      console.log('Drop event emitted:', { id: idAsNumber, newStatus });
    } else {
      console.warn('DropZoneDirective: Invalid taskId on drop:', taskId);
    }
  }
}
