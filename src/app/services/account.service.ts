import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private apiUrl: string;
  

  constructor(private http: HttpClient) { 
    this.apiUrl = environment.apiUrl;
  }

  getUserAccounts(username: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/usuarios/${username}`);
  }

  verifyAccount(accountNumber: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/verificarCuenta/${accountNumber}`);
  }

  getNombreCompleto(usuario: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/nombre-completo/${usuario}`);
  }

  getNumeroCuenta(cuentaNombre: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/getNumeroCuenta/${cuentaNombre}`);
  }

  getTransferenciasByCuentaOrigen(numeroCuenta: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/getTransferenciaByCuentaOrigen/${numeroCuenta}`);
  }

  obtenerUsuario(usuario: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/obtenerInformacionUsuario/${usuario}`);
  }
}
