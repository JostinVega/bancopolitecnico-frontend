import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as bcrypt from 'bcryptjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-reset',
  templateUrl: './reset.component.html',
  styleUrls: ['./reset.component.css']
})
export class ResetComponent {
  newPassword: string = '';
  confirmPassword: string = '';
  cedula: string = '';
  private apiUrl: string;

  constructor(private route: ActivatedRoute, 
    private router: Router, 
    private http: HttpClient,
    ) {
      this.apiUrl = environment.apiUrl;
    }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.cedula = params['cedula'];
      console.log('Cédula recibida:', this.cedula);
    });
  }

  goBack() {
    this.router.navigate(['/previous-route']);
  }

  changePassword() {
    if (this.newPassword !== this.confirmPassword) {
      alert('Las contraseñas no coinciden. Por favor, inténtelo de nuevo.');
      return;
    }

    if (!this.isPasswordValid(this.newPassword)) {
      alert('La contraseña no cumple con los requisitos de seguridad.');
      return;
    }

    this.updatePassword(this.cedula, this.newPassword)
      .then(() => {
        console.log('Password changed successfully.');
        this.router.navigate(['/confirm-reset']);
      })
      .catch(error => {
        console.error('Error changing password:', error);
        alert('Error al cambiar la contraseña. Por favor, inténtelo de nuevo.');
      });
  }

  isPasswordValid(password: string): boolean {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  async updatePassword(numeroIdentidad: string, password: string): Promise<void> {

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const response = await this.http.put(`${this.apiUrl}/actualizar-contrasena/${numeroIdentidad}`, { contrasena: hashedPassword }).toPromise();
      console.log('Response:', response);
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
    try {
      const response = await this.http.put(`${this.apiUrl}/update-contrasena/${numeroIdentidad}`, { contrasena: hashedPassword }).toPromise();
      console.log('Response:', response);
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }
  
}
