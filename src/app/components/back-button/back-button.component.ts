import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-back-button',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <button mat-fab (click)="goBack()" class="back-button" title="Volver atrás">
      <mat-icon>arrow_back</mat-icon>
    </button>
  `,
  styleUrl: './back-button.component.css'
})
export class BackButtonComponent {
  private location = inject(Location);

  goBack(): void {
    this.location.back();
  }
}
