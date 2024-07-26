import { Component, OnInit } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { AccountService } from '../services/account.service';
import { ActivatedRoute } from '@angular/router';

interface Transaction {
  date: string;
  amount: number;
  beneficiary: string;
  type: string;
  description: string;
  balanceBefore: number;
  balanceAfter: number;
  account: string;
  accountType: string;
  receiptNumber: string;
  selected?: boolean;
}

@Component({
  selector: 'app-historial-transacciones',
  templateUrl: './historial-transacciones.component.html',
  styleUrls: ['./historial-transacciones.component.css']
})
export class HistorialTransaccionesComponent implements OnInit {
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  accounts: string[] = []; // Datos de ejemplo de cuentas
  searchAccount: string = '';
  searchAccountType: string = '';
  searchDateFrom: string = '';
  searchDateTo: string = '';
  searchType: string = '';
  usuario: string = '';
  numeroIdentidad: string = '';
  numeroCuenta: string = '';

  constructor(private route: ActivatedRoute, private accountService: AccountService) {}

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {
      this.usuario = params['usuario'];
      this.numeroIdentidad = params['numeroIdentidad'];
      console.log('Parametros recibidos:', {
        usuario: this.usuario,
        numeroIdentidad: this.numeroIdentidad
      });
      if (this.usuario) {
        this.fetchAccounts(this.usuario);
      } else {
        console.error('Numero de Identidad no disponible');
      }
    });

    
    
    this.filteredTransactions = this.transactions;
    //this.filterTransactions();
  }

  filterTransactions() {

    // Primero obtenemos el numeroCuenta basado en el cuentaNombre seleccionado
    /*if (this.searchAccount) {
      this.getNumeroCuenta(this.searchAccount);
    }
    */
    /*this.filteredTransactions = this.transactions.filter(transaction => {
      const matchesAccount = this.searchAccount ? transaction.account === this.searchAccount : false;
      const matchesAccountType = this.searchAccountType ? transaction.accountType === this.searchAccountType : true;
      const matchesDateFrom = this.searchDateFrom ? new Date(transaction.date) >= new Date(this.searchDateFrom) : true;
      const matchesDateTo = this.searchDateTo ? new Date(transaction.date) <= new Date(this.searchDateTo) : true;
      const matchesType = this.searchType ? transaction.type === this.searchType : true;
      return matchesAccount && matchesAccountType && matchesDateFrom && matchesDateTo && matchesType;
    });*/

    this.filteredTransactions = this.transactions.filter(transaction => {
      const matchesAccount = this.numeroCuenta ? transaction.account === this.numeroCuenta : true;
      const matchesAccountType = this.searchAccountType ? transaction.accountType === this.searchAccountType : true;
      const matchesDateFrom = this.searchDateFrom ? new Date(transaction.date) >= new Date(this.searchDateFrom) : true;
      const matchesDateTo = this.searchDateTo ? new Date(transaction.date) <= new Date(this.searchDateTo) : true;
      const matchesType = this.searchType ? transaction.type === this.searchType : true;
      return matchesAccount && matchesAccountType && matchesDateFrom && matchesDateTo && matchesType;
    });

  }

  fetchAccounts(usuario: string): void {
    this.accountService.getUserAccounts(usuario).subscribe(
      data => {
        console.log('Cuentas recibidas:', data);
        this.accounts = data.cuentas.map((account: any) => account.cuentaNombre);
      },
      error => {
        console.error('Error fetching accounts:', error);
      }
    );
  }

  onAccountChange(cuentaNombre: string): void {
    this.getNumeroCuenta(cuentaNombre);
  }

  getNumeroCuenta(cuentaNombre: string): void {
    this.accountService.getNumeroCuenta(cuentaNombre).subscribe(
      data => {
        this.numeroCuenta = data.numeroCuenta;
        console.log('Numero de Cuenta recibido:', data.numeroCuenta);
        //this.filterTransactions();
        this.getTransferencias(this.numeroCuenta);
      },
      error => {
        console.error('Error fetching numeroCuenta:', error);
      }
    );
  }

  getTransferencias(numeroCuenta: string): void {
    this.accountService.getTransferenciasByCuentaOrigen(numeroCuenta).subscribe(
      data => {
        console.log('Transferencias recibidas:', data.transferencias);
        this.transactions = data.transferencias.map((trans: any) => ({
          date: trans.fecha,
          amount: trans.monto,
          beneficiary: trans.cuenta_destino.nombre_completo,
          type: trans.cuenta_origen.tipoTransaccion,
          description: trans.comentario || '',
          balanceBefore: trans.cuenta_origen.saldoAntes,
          balanceAfter: trans.cuenta_origen.saldoDespues,
          account: trans.cuenta_origen.numero_cuenta,
          accountType: trans.cuenta_origen.tipoCuenta,  //PREGUNTAR A MAMOY
          receiptNumber: trans.numero_comprobante_transferencia
        }));
        this.filterTransactions();  // Filtrar transacciones después de obtenerlas
      },
      error => {
        console.error('Error fetching transferencias:', error);
      }
    );
  }

  sortTransactions(order: 'asc' | 'desc') {
    this.filteredTransactions.sort((a, b) => {
      if (order === 'asc') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      } else {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });
  }

  toggleAll(event: any) {
    const checked = event.target.checked;
    this.filteredTransactions.forEach(transaction => (transaction.selected = checked));
  }

  downloadTransactionAsPDF(transaction: Transaction) {
    const doc = new jsPDF();
    const head = [['Fecha', 'Monto', 'Beneficiario', 'Tipo de Cuenta', 'Tipo de Transacción', 'Descripción', 'Saldo Antes', 'Saldo Después', 'Número de Comprobante']];
    const body = [[
      transaction.date,
      (transaction.type === 'ingreso' ? '+' : '-') + transaction.amount,
      transaction.beneficiary,
      transaction.accountType,
      transaction.type,
      transaction.description,
      transaction.balanceBefore,
      transaction.balanceAfter,
      transaction.receiptNumber
    ]];

    autoTable(doc, {
      head: head,
      body: body,
    });

    doc.save(`transaccion_${transaction.date}.pdf`);
  }

  downloadTransactionAsPNG(transaction: Transaction) {
    const doc = new jsPDF();
    const head = [['Fecha', 'Monto', 'Beneficiario', 'Tipo de Cuenta', 'Tipo de Transacción', 'Descripción', 'Saldo Antes', 'Saldo Después', 'Número de Comprobante']];
    const body = [[
      transaction.date,
      (transaction.type === 'ingreso' ? '+' : '-') + transaction.amount,
      transaction.beneficiary,
      transaction.accountType,
      transaction.type,
      transaction.description,
      transaction.balanceBefore,
      transaction.balanceAfter,
      transaction.receiptNumber
    ]];

    autoTable(doc, {
      head: head,
      body: body,
    });

    doc.save(`transaccion_${transaction.date}.png`);
  }

  downloadSelectedAsPDF() {
    const selectedTransactions = this.filteredTransactions.filter(transaction => transaction.selected);
    if (selectedTransactions.length === 0) {
      alert('Por favor, seleccione al menos una transacción para descargar.');
      return;
    }
  
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: 'a4'
    });
  
    const head = [['Fecha', 'Monto', 'Beneficiario', 'Tipo de Cuenta', 'Tipo de Transacción', 'Descripción', 'Saldo Antes', 'Saldo Después', 'Número de Comprobante']];
    const body = selectedTransactions.map(transaction => [
      transaction.date,
      (transaction.type === 'ingreso' ? '+' : '-') + "$" + transaction.amount.toFixed(2),
      transaction.beneficiary,
      transaction.accountType,
      transaction.type,
      transaction.description,
      "$" + transaction.balanceBefore.toFixed(2),
      "$" + transaction.balanceAfter.toFixed(2),
      transaction.receiptNumber
    ]);
  
    autoTable(doc, {
      head: head,
      body: body,
      styles: { 
        fontSize: 10, 
        halign: 'center', 
        valign: 'middle',
        cellPadding: 5,
        overflow: 'linebreak',
      },
      headStyles: { 
        fillColor: [32, 110, 169],
        textColor: [255, 255, 255], 
        fontSize: 12 
      },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 60 },
        2: { cellWidth: 90 },
        3: { cellWidth: 70 },
        4: { cellWidth: 90 },
        5: { cellWidth: 100 },
        6: { cellWidth: 70 },
        7: { cellWidth: 70 },
        8: { cellWidth: 100 }
      },
      margin: { top: 20, left: 20, right: 20, bottom: 20 },
      theme: 'grid',
    });
  
    doc.save('transacciones.pdf');
  }
  
  downloadSelectedAsExcel() {
    const selectedTransactions = this.filteredTransactions.filter(transaction => transaction.selected);
    if (selectedTransactions.length === 0) {
      alert('Por favor, seleccione al menos una transacción para descargar.');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(selectedTransactions.map(transaction => ({
      Fecha: transaction.date,
      Monto: (transaction.type === 'ingreso' ? '+' : '-') + transaction.amount,
      Beneficiario: transaction.beneficiary,
      'Tipo de Cuenta': transaction.accountType,
      'Tipo de Transacción': transaction.type,
      Descripción: transaction.description,
      'Saldo Antes': transaction.balanceBefore,
      'Saldo Después': transaction.balanceAfter,
      'Número de Comprobante': transaction.receiptNumber
    })));

    const workbook = { Sheets: { 'Transacciones': worksheet }, SheetNames: ['Transacciones'] };
    XLSX.writeFile(workbook, 'transacciones.xlsx');
  }

  showAlert() {
    alert('Los comprobantes aún no están disponibles.');
  }
}