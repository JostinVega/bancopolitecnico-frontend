
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RegistroService } from '../services/informacion-registro.service';
import { Router } from '@angular/router';
import { AbstractControl, ValidatorFn } from '@angular/forms';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent implements OnInit {
  registrationForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private registroService: RegistroService,
    private router: Router
  ) {
    this.registrationForm = this.fb.group({
      numeroIdentidad: ['', [
        Validators.required,
        Validators.pattern(/^(01|02|03|04|05|06|07|08|09|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|30|)\d{8}$/) 
      ]],
      nombre_completo: ['', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z\s]*$/) // Solo permite letras y espacios
      ]],
      correo_electronico: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@(gmail\.com|outlook\.com|hotmail\.com|epn\.edu\.ec)$/)
      ]],
      numero_telefono: ['', [
        Validators.required,
        Validators.pattern(/^09\d{8}$/) // Empieza con '09' y exactamente 10 dígitos
      ]],
      fecha_nacimiento: ['', [
        Validators.required,
        this.mayorDeEdadValidator()
      ]]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.registrationForm.valid) {
      const formValues = this.registrationForm.value;
      const telefono = formValues.numero_telefono;

      // Formatear el número de teléfono
      if (telefono.startsWith('0') && telefono.length === 10) {
        formValues.numero_telefono = '+593' + telefono.slice(1);
      }

      this.registroService.setRegistrationData('step1', formValues);
      this.router.navigate(['/verificar']);
    }
  }

  goBack(): void {
    // Navigate back logic
    window.history.back();
  }

  onInputChange(event: Event): void {
    // Manejar el evento de cambio de entrada
    const inputElement = event.target as HTMLInputElement;
    let inputValue = inputElement.value.replace(/[^\d]/g, ''); // Eliminar caracteres no numéricos
    inputValue = inputValue.slice(0, 10); // Limitar a 10 caracteres
    this.registrationForm.get('numeroIdentidad')?.setValue(inputValue, { emitEvent: false }); // Establecer el valor limpiado de nuevo en el formulario sin desencadenar otro evento de cambio
  }

  onInputChangePhone(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    let inputValue = inputElement.value.replace(/[^\d]/g, ''); // Eliminar caracteres no numéricos
    inputValue = inputValue.slice(0, 10); // Limitar a 10 caracteres
    this.registrationForm.get('numero_telefono')?.setValue(inputValue, { emitEvent: false }); // Establecer el valor limpiado de nuevo en el formulario sin desencadenar otro evento de cambio
  }

  onInputChangeName(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    let inputValue = inputElement.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, ''); // Eliminar caracteres que no sean letras o espacios
    this.registrationForm.get('nombre_completo')?.setValue(inputValue, { emitEvent: false }); // Establecer el valor limpiado de nuevo en el formulario sin desencadenar otro evento de cambio
  }

  private mayorDeEdadValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const fechaNacimiento = new Date(control.value);
      const hoy = new Date();
      let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
      const mes = hoy.getMonth() - fechaNacimiento.getMonth();
      if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
        edad--;
      }
      return edad >= 18 ? null : { 'menorDeEdad': true };
    };
  }
}

