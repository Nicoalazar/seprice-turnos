import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<main class="app-main"><router-outlet /></main>`,
  styleUrl: './app.component.css'
})
export class AppComponent {}