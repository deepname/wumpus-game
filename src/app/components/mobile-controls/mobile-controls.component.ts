import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-mobile-controls',
  standalone: true,
  templateUrl: './mobile-controls.component.html',
  styleUrls: ['./mobile-controls.component.scss']
})
export class MobileControlsComponent {
  @Output() move = new EventEmitter<'up' | 'down' | 'left' | 'right'>();
  @Output() shoot = new EventEmitter<void>();
}
