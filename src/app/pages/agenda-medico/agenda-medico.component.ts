import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-agenda-medico',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './agenda-medico.component.html',
  styleUrls: ['./agenda-medico.component.css']
})
export class AgendaMedicoComponent {
  private router = inject(Router);

  volverAlDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
