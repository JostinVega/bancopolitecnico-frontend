import { Component, OnInit, Renderer2, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AccountService } from '../services/account.service';

@Component({
  selector: 'app-verificar-inicio',
  templateUrl: './verificar-inicio.component.html',
  styleUrls: ['./verificar-inicio.component.css']
})
export class VerificarInicioComponent {

  digits: string[] = ['', '', '', '', ''];
  usuario: string | undefined;
  correo_electronico: string | undefined;
  numero_telefono: string | undefined;

  constructor(
    private renderer: Renderer2,
    private router: Router,
    private route: ActivatedRoute,
    private accountService: AccountService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.usuario = params['usuario'];
      console.log('Usuario: ', this.usuario);
      if (this.usuario) {6
        this.obtenerInformacionUsuario(this.usuario);
      }
    });
  }

  obtenerInformacionUsuario(usuario: string): void {
    this.accountService.obtenerUsuario(usuario).subscribe(
      data => {
        if (data && data.usuario) {
          this.correo_electronico = data.usuario.correo_electronico;
          this.numero_telefono = data.usuario.numero_telefono;
          console.log('Correo Electrónico: ', this.correo_electronico);
          console.log('Número de Teléfono: ', this.numero_telefono);
        } else {
          console.log('No se encontró la información del usuario.');
        }
      },
      error => {
        console.error('Error al obtener la información del usuario:', error);
      }
    );
  }

  onSubmit(): void {
    // Lógica para manejar la sumisión del formulario
    console.log('Formulario enviado', this.digits.join(''));
    console.log('Navigating with usuario to inicio:', this.usuario);
              this.router.navigate(['/inicio'], { queryParams: { usuario: this.usuario } });
    // Aquí podrías agregar más lógica según lo que necesites al enviar el formulario
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    const input = event.target as HTMLInputElement;
    if (!/^\d$/.test(event.key) && event.key !== 'Backspace' && event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      event.preventDefault();
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      const prevInput = document.getElementById('digit' + (index)) as HTMLInputElement;
      if (prevInput) {
        prevInput.focus();
      }
    } else if (event.key === 'ArrowRight' && index < this.digits.length - 1) {
      const nextInput = document.getElementById('digit' + (index + 2)) as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
      }
    } else if (event.key === 'Backspace' && index > 0 && input.value === '') {
      const prevInput = document.getElementById('digit' + (index)) as HTMLInputElement;
      if (prevInput) {
        prevInput.focus();
      }
    }
  }

  onInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (/^\d$/.test(input.value)) {
      this.digits[index] = input.value;
      if (index < this.digits.length - 1) {
        const nextInput = document.getElementById('digit' + (index + 2)) as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
        }
      }
    } else {
      input.value = '';
    }
  }

  goBack(): void {
    // Lógica para regresar (volver atrás)
    console.log('Volviendo atrás');
    // Aquí podrías agregar más lógica según lo que necesites para regresar
  }

  resendCode(): void {
    // Lógica para reenviar el código de verificación
    alert('Se ha reenviado el código de verificación.');
  }
}

