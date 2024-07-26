import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TransferService } from '../services/transfer.service';
import { ComprobanteService } from '../services/comprobante.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-confirmar-transferencia',
  templateUrl: './confirmar-transferencia.component.html',
  styleUrls: ['./confirmar-transferencia.component.css']
})
export class ConfirmarTransferenciaComponent implements OnInit {
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private transferService: TransferService,
    private comprobanteService: ComprobanteService
  ) { }

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
    });
  }

    async confirmTransfer(): Promise<void> {
      if (this.amount && this.saldo && this.amount <= this.saldo) {
        try {
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
  
          // Navega a verificar-transferencia con los datos actuales
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
        } catch (error) {
          console.error('Error al confirmar la transferencia', error);
        }
      } else {
        alert('El monto de la transferencia no puede ser mayor que el saldo de la cuenta.');
      }
    }

    navigateToVerificarTransferencia(): void {
      this.router.navigate(['/verificar-transferencia'], {
        queryParams: {
          cuentaNombre: this.cuentaNombre,
          numeroCuenta: this.numeroCuenta,
          tipoCuenta: this.tipoCuenta,
          saldo: this.saldo,
          amount: this.amount,
          usuario: this.usuario,
          numeroIdentidad: this.numeroIdentidad,
          contactName: this.contactName,
          contactNumber: this.contactNumber,
          comment: this.comment,
          saldoAntesBeneficiario: this.saldoAntesBeneficiario,
          tipoCuentaBeneficiario: this.tipoCuentaBeneficiario
        }
      });
    }

  generateComprobanteNumber(): string {
    return 'CT-' + Math.floor(Math.random() * 1000000);
  }

  generateComprobanteID(): string {
    return 'ID-' + Math.floor(Math.random() * 1000000);
  }

  cancelTransfer(): void {
    this.router.navigate(['/']);
  }

  goBack(): void {
    this.router.navigate(['/agregar-comentario']);
  }
}
