import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CodigoService } from '../services/codigo.service';
import { TransferService } from '../services/transfer.service';
import { ComprobanteService } from '../services/comprobante.service';
import { AccountService } from '../services/account.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-verificar-transferencia',
  templateUrl: './verificar-transferencia.component.html',
  styleUrls: ['./verificar-transferencia.component.css']
})
export class VerificarTransferenciaComponent implements OnInit {
  cuentaNombre: string | undefined;
  numeroCuenta: string | undefined;
  tipoCuenta: string | undefined;
  saldo: number | undefined;
  amount: number | undefined;
  usuario: string | undefined;
  numeroIdentidad: string | undefined;
  contactName: string | undefined;
  contactNumber: string | undefined;
  comment: string | undefined;
  saldoAntesBeneficiario: number | undefined;
  tipoCuentaBeneficiario: string | undefined;
  correo_electronico: string | undefined;
  numero_telefono: string | undefined;

  digits: string[] = ['', '', '', '', ''];
  enteredCode: string = '';
  message: string = '';

  constructor(
    private route: ActivatedRoute, 
    private router: Router, 
    private http: HttpClient, 
    private transferService: TransferService,
    private codigoService: CodigoService,
    private comprobanteService: ComprobanteService,
    private accountService: AccountService) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.cuentaNombre = params['cuentaNombre'];
      this.numeroCuenta = params['numeroCuenta'];
      this.tipoCuenta = params['tipoCuenta'];
      this.saldo = parseFloat(params['saldo']);
      this.amount = parseFloat(params['amount']);
      this.usuario = params['usuario'];
      this.numeroIdentidad = params['numeroIdentidad'];
      this.contactName = params['contactName'];
      this.contactNumber = params['contactNumber'];
      this.comment = params['comment'];
      this.saldoAntesBeneficiario = parseFloat(params['saldoAntesBeneficiario']);
      this.tipoCuentaBeneficiario = params['tipoCuentaBeneficiario'];
      console.log('Usuario: ', this.usuario);
      if (this.usuario) {6
        this.obtenerInformacionUsuario(this.usuario);
      }

    });
    this.sendCode();
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

  sendCode() {
    this.enteredCode = this.digits.join('');
    if (this.numeroIdentidad) {
      console.log(this.numeroIdentidad);
      this.codigoService.sendSecurityCode(this.numeroIdentidad).subscribe(
        (response: any) => {
          this.message = response.message;
        },
        (error: any) => {
          this.message = error.error.message;
        }
      );
    } else {
      this.message = 'Número de identidad no definido.';
    }
  }

  async onSubmit(): Promise<void> {
    if (this.numeroIdentidad) {
      try {
        const response = await firstValueFrom(this.codigoService.verifySecurityCode(this.enteredCode));
        this.message = response.message;
        if (this.amount && this.saldo && this.amount <= this.saldo) {
          const saldoDespuesOrigen = this.saldo - this.amount;
          const saldoAntesDestino = this.saldoAntesBeneficiario!;
          const saldoDespuesDestino = saldoAntesDestino + this.amount;

          // Actualiza saldo cuenta de origen
          await firstValueFrom(this.transferService.updateAccountBalance(this.numeroCuenta!, saldoDespuesOrigen));

          // Actualiza saldo cuenta de destino
          await firstValueFrom(this.transferService.updateAccountBalance(this.contactNumber!, saldoDespuesDestino));

          // Guarda transferencia y comprobante
          const transferData = {
            numero_comprobante_transferencia: this.generateComprobanteNumber(),
            monto: this.amount,
            fecha: new Date(),
            cuenta_origen: {
              nombre_completo: this.cuentaNombre,
              numero_cuenta: this.numeroCuenta,
              tipoCuenta: this.tipoCuenta,
              tipoTransaccion: 'Egreso',
              saldoAntes: this.saldo,
              saldoDespues: saldoDespuesOrigen
            },
            cuenta_destino: {
              nombre_completo: this.contactName,
              numero_cuenta: this.contactNumber,
              tipoCuenta: this.tipoCuentaBeneficiario,
              tipoTransaccion: 'Ingreso',
              saldoAntes: saldoAntesDestino,
              saldoDespues: saldoDespuesDestino
            },
            comentario: this.comment,
            numero_cuenta: this.numeroCuenta,
            id_comprobante_transferencia: this.generateComprobanteID()
          };

          await firstValueFrom(this.transferService.saveTransfer(transferData));
          await firstValueFrom(this.comprobanteService.saveComprobante({
            id_comprobante_transferencia: transferData.id_comprobante_transferencia,
            fecha_emision: new Date(),
            archivo_comprobante_transferencia: 'comprobante.pdf',
            numero_comprobante_transferencia: transferData.numero_comprobante_transferencia
          }));

          // Navega a comprobar-transferencia con los datos actuales
          this.router.navigate(['/comprobante-transferencia'], {
            queryParams: {
              cuentaNombre: this.cuentaNombre,
              numeroCuenta: this.numeroCuenta,
              tipoCuenta: this.tipoCuenta,
              saldo: saldoDespuesOrigen,
              amount: this.amount,
              usuario: this.usuario,
              numeroIdentidad: this.numeroIdentidad,
              contactName: this.contactName,
              contactNumber: this.contactNumber,
              comment: this.comment,
              numero_comprobante_transferencia: transferData.numero_comprobante_transferencia,
              id_comprobante_transferencia: transferData.id_comprobante_transferencia,
              fecha: new Date(),
              saldoAntesBeneficiario: this.saldoAntesBeneficiario,
              tipoCuentaBeneficiario: this.tipoCuentaBeneficiario
            }
          });
        } else {
          alert('El monto de la transferencia no puede ser mayor que el saldo de la cuenta.');
        }
      } catch (error) {
        this.message = 'Error al confirmar la transferencia.';
        console.error('Error al confirmar la transferencia', error);
      }
    } else {
      this.message = 'Número de identidad no definido.';
    }
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
    this.route.queryParams.subscribe(params => {
      this.router.navigate(['/confirmar-transferencia'], { queryParams: params });
    });
  }

  resendCode(): void {
    if (this.numeroIdentidad) {
      this.codigoService.sendSecurityCode(this.numeroIdentidad).subscribe(
        (response: any) => {
          this.message = response.message;
        },
        (error: any) => {
          this.message = error.error.message;
        }
      );
    } else {
      this.message = 'Número de identidad no definido.';
    }
  }

  generateComprobanteNumber(): string {
    return 'CT-' + Math.floor(Math.random() * 1000000);
  }

  generateComprobanteID(): string {
    return 'ID-' + Math.floor(Math.random() * 1000000);
  }
}
