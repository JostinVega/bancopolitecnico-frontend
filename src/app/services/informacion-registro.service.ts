import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RegistroService {
  private apiUrl: string; // Cambia esto si es necesario

  private registrationData: any = {};

  constructor(private http: HttpClient) {
    this.apiUrl = environment.apiUrl;
  }

  setRegistrationData(step: string, data: any): void {
    this.registrationData[step] = data;
  }

  getAllData(): any {
    return this.registrationData;
  }

  registrarUsuario(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/nuevo-usuario`, data);
  }

  setCuenta(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/nueva-cuenta`, data);
  }

  crearCuenta(cuentaData: { 
    numeroIdentidad: string; 
    accountType: string; 
    numeroCuenta: string; 
    cuentaNombre: string; 
    tipoCuenta: string; 
    saldo: string 
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/nueva-cuenta`, cuentaData);
  }
}
