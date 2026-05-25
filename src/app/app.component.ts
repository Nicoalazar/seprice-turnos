import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  // Nico Le doy un contenedor que maneje el scroll de todo el sistema para q scrollee la agenda
  template: `
    <div style="height: 100vh; overflow-y: auto; background-color: #0f0a1e; display: block;">
      <router-outlet />
    </div>
  `
})
export class AppComponent {}


// aca abajo dejo como estaba antes sin contenedor x si queres volver a como estaba originalmente


/* 

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`
})
export class AppComponent {}


*/