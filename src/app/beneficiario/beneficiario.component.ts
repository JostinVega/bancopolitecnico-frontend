import { Component, OnInit } from '@angular/core';
import { ContactService } from '../services/contact.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-beneficiario',
  templateUrl: './beneficiario.component.html',
  styleUrls: ['./beneficiario.component.css']
})
export class BeneficiarioComponent implements OnInit {
  showModal = false;
  searchTerm: string = '';
  contacts: any[] = [];
  filteredContacts: any[] = [];
  
  selectedContactIndex: number | null = null;
  selectedContact: any = null;
  searchQuery: string = '';

  cuentaNombre: string | undefined;
  numeroCuenta: string | undefined;
  tipoCuenta: string | undefined;
  saldo: number | undefined;
  amount: number | undefined;
  usuario: string | undefined;
  numeroIdentidad: string | undefined;
  saldoAntesBeneficiario: number | undefined;
  tipoCuentaBeneficiario: string | undefined;

  constructor(private contactService: ContactService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.cuentaNombre = params['cuentaNombre'];
      this.numeroCuenta = params['numeroCuenta'];
      this.tipoCuenta = params['tipoCuenta'];
      this.saldo = params['saldo'];
      this.amount = params['amount'];
      this.usuario = params['usuario'];
      this.numeroIdentidad = params['numeroIdentidad'];
      console.log('Received params:', params);
      this.loadContacts();
    });
  }

  loadContacts(): void {
    if (this.numeroIdentidad) {
      this.contactService.getContacts(this.numeroIdentidad).subscribe(response => {
        const data = response.contactos;
        if (Array.isArray(data)) {
          this.contacts = data;
          this.filteredContacts = this.contacts.map((contact: any) => ({
            ...contact,
            initials: contact.nombre ? contact.nombre.charAt(0) : '',  // Asegurarse de que nombre no sea undefined
            tipoCuenta: '' // Inicializamos tipoCuenta
          }));

          // Llamamos a getAccountType para cada contacto
          this.filteredContacts.forEach(async (contact) => {
            if (contact.numeroCuenta) {
              try {
                contact.tipoCuenta = await this.getAccountType(contact.numeroCuenta);
              } catch (error) {
                console.error('Error al obtener el tipo de cuenta para', contact.numeroCuenta, error);
              }
            }
          });
          this.sortContacts();
          console.log('Contacts loaded:', this.contacts);
        } else {
          console.error('Los datos recibidos no son un array:', data);
        }
      });
    } else {
      console.error('Número de identidad no definido');
    }
  }

    async getAccountType(accountNumber: string): Promise<string> {
      return new Promise((resolve, reject) => {
        this.contactService.checkAccountExists(accountNumber).subscribe(
          data => {
            if (data.exists && data.cuenta && data.cuenta.tipoCuenta) {
              resolve(data.cuenta.tipoCuenta);
            } else {
              resolve('Tipo de cuenta no encontrado'); // Manejo de caso donde no se encuentra el tipo de cuenta
            }
          },
          error => reject(error)
        );
      });
    }

  filterContacts(): void {
    if (this.searchTerm) {
      this.filteredContacts = this.contacts.filter(contact => 
        contact.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        contact.numeroCuenta.includes(this.searchTerm)
      );
    } else {
      this.filteredContacts = [...this.contacts];
    }
    this.sortContacts();
  }

  sortContacts(): void {
    this.filteredContacts.sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) {
        return -1;
      } else if (!a.isFavorite && b.isFavorite) {
        return 1;
      } else {
        return a.nombre.localeCompare(b.nombre);
      }
    });
  }

  /*selectContact(contact: any): void {
    this.selectedContact = contact;
    console.log('Selected contact:', contact);
  }*/

    /*selectContact(contact: any): void {
      this.selectedContact = contact;
      console.log('Selected contact:', contact);
      this.contactService.checkAccountExists(contact.numeroCuenta).subscribe(
        data => {
          if (data.exists && data.cuenta && data.cuenta.saldo) {
            this.saldoAntesBeneficiario = data.cuenta.saldo;
            console.log('Saldo antes del beneficiario:', this.saldoAntesBeneficiario);
          } else {
            console.error('No se pudo obtener el saldo de la cuenta');
          }
        },
        error => {
          console.error('Error al verificar la cuenta:', error);
        }
      );
    }*/

      selectContact(contact: any): void {
        this.selectedContact = contact;
        console.log('Selected contact:', contact);
        this.contactService.checkAccountExists(contact.numeroCuenta).subscribe(
          data => {
            if (data.exists && data.cuenta) {
              if (data.cuenta.saldo) {
                this.saldoAntesBeneficiario = data.cuenta.saldo;
                console.log('Saldo antes del beneficiario:', this.saldoAntesBeneficiario);
              }
              if (data.cuenta.tipoCuenta) {
                this.tipoCuentaBeneficiario = data.cuenta.tipoCuenta;
                console.log('Tipo de cuenta del beneficiario:', this.tipoCuentaBeneficiario);
              }
            } else {
              console.error('No se pudo obtener la información de la cuenta');
            }
          },
          error => {
            console.error('Error al verificar la cuenta:', error);
          }
        );
      }

  navigateToAgregarBeneficiario(): void {
    this.router.navigate(['/agregar-beneficiario'], {
      queryParams: {
        cuentaNombre: this.cuentaNombre,
        numeroCuenta: this.numeroCuenta,
        tipoCuenta: this.tipoCuenta,
        saldo: this.saldo,
        amount: this.amount,
        usuario: this.usuario,
        numeroIdentidad: this.numeroIdentidad
      }
    });
  }

  navigateToConfirmarTransferencia(): void {
    if (this.selectedContact) {
      this.router.navigate(['/agregar-comentario'], {
        queryParams: {
          cuentaNombre: this.cuentaNombre,
          numeroCuenta: this.numeroCuenta,
          tipoCuenta: this.tipoCuenta,
          saldo: this.saldo,
          amount: this.amount,
          usuario: this.usuario,
          numeroIdentidad: this.numeroIdentidad,
          contactName: this.selectedContact.nombre,
          contactNumber: this.selectedContact.numeroCuenta,
          saldoAntesBeneficiario: this.saldoAntesBeneficiario,
          tipoCuentaBeneficiario: this.tipoCuentaBeneficiario
        }
      });
    }
  }

  goBack(): void {
    window.history.back();
  }

  toggleMenu(index: number, event: Event): void {
    event.stopPropagation();
    if (this.selectedContactIndex === index) {
      this.selectedContactIndex = null;
    } else {
      this.selectedContactIndex = index;
    }
  }

  deleteContact(contact: any, index: number): void {
    this.contactService.deleteContactByNumeroCuenta(contact.numeroCuenta).subscribe(
      response => {
        this.contacts.splice(index, 1);
        this.filterContacts();
        this.selectedContactIndex = null;
      },
      error => {
        console.error('Error al eliminar el contacto:', error);
      }
    );
  }

  addFavorite(contact: any): void {
    const newIsFavorite = !contact.isFavorite;
    this.contactService.updateIsFavoriteByNumeroCuenta(contact.numeroCuenta, newIsFavorite).subscribe(
      response => {
        contact.isFavorite = newIsFavorite;
      },
      error => {
        console.error('Error al actualizar el estado de favorito:', error);
      }
    );
  }

  goToBeneficiario(): void {
    this.router.navigate(['/beneficiario']);
  }

  
}
