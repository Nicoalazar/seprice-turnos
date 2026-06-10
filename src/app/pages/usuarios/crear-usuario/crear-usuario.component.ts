import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { UsuariosService } from '../../../core/services/usuarios.service';
import { RolUsuario } from '../../../core/interfaces/usuario.d';

interface Persona {
  id: string;
  nombre: string;
  apellido: string;
  tipo: 'MEDICO' | 'ADMINISTRATIVO';
  usuarioId?: string;
  especialidad?: string;
  matricula?: string;
}

@Component({
  selector: 'app-crear-usuario',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatListModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatSnackBarModule
  ],
  templateUrl: './crear-usuario.component.html',
  styleUrls: ['./crear-usuario.component.css']
})
export class CrearUsuarioComponent implements OnInit {
  searchForm!: FormGroup;
  usuarioForm!: FormGroup;
  personas: Persona[] = [];
  personaSeleccionada: Persona | null = null;
  cargando = false;
  guardando = false;
  busquedaRealizada = false;

  roles: RolUsuario[] = ['ADMIN', 'MEDICO'];

  constructor(
    private fb: FormBuilder,
    private usuariosService: UsuariosService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      criterio: ['', [Validators.required, Validators.minLength(2)]]
    });

    this.usuarioForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rol: ['MEDICO', Validators.required]
    });
  }

  async buscar(): Promise<void> {
    if (this.searchForm.invalid) return;

    this.cargando = true;
    this.busquedaRealizada = true;
    const criterio = this.searchForm.get('criterio')?.value;

    try {
      this.personas = await this.usuariosService.buscarPersonas(criterio);
      if (this.personas.length === 0) {
        this.snackBar.open('No se encontraron personas', 'Cerrar', { duration: 3000 });
      }
    } catch (error) {
      this.snackBar.open('Error al buscar personas', 'Cerrar', { duration: 3000 });
    } finally {
      this.cargando = false;
    }
  }

  seleccionarPersona(persona: Persona): void {
    if (persona.usuarioId) {
      this.snackBar.open('Esta persona ya tiene una cuenta', 'Cerrar', { duration: 3000 });
      return;
    }
    this.personaSeleccionada = persona;
  }

  async guardar(): Promise<void> {
    if (!this.personaSeleccionada || this.usuarioForm.invalid) return;

    this.guardando = true;
    const { email, password, rol } = this.usuarioForm.value;

    try {
      const resultado = await this.usuariosService.crearUsuario(
        email,
        password,
        rol,
        this.personaSeleccionada.id,
        this.personaSeleccionada.tipo
      );

      if (resultado.exito) {
        this.snackBar.open('Usuario creado correctamente', 'Cerrar', { duration: 3000 });
        setTimeout(() => this.router.navigate(['/dashboard']), 1000);
      } else {
        this.snackBar.open(`Error: ${resultado.error}`, 'Cerrar', { duration: 3000 });
      }
    } catch (error) {
      this.snackBar.open('Error al guardar el usuario', 'Cerrar', { duration: 3000 });
    } finally {
      this.guardando = false;
    }
  }

  cancelar(): void {
    this.personaSeleccionada = null;
    this.usuarioForm.reset();
  }

  volver(): void {
    this.router.navigate(['/dashboard']);
  }

  obtenerNombreCompleto(persona: Persona): string {
    return `${persona.nombre} ${persona.apellido}`;
  }

  obtenerSubtexto(persona: Persona): string {
    if (persona.tipo === 'MEDICO') {
      return `${persona.especialidad} - Mat. ${persona.matricula}`;
    }
    return 'Personal Administrativo';
  }
}
