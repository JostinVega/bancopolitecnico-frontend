import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ContactService } from '../services/contact.service';
import { AccountService } from '../services/account.service';

@Component({
  selector: 'app-agregar-beneficiario',
  templateUrl: './agregar-beneficiario.component.html',
  styleUrls: ['./agregar-beneficiario.component.css']
})
export class AgregarBeneficiarioComponent implements OnInit {
  beneficiary = {
    name: '',
    accountNumber: '',
    saveToContacts: false,
    saveAsFavorite: false
  };

  errorMessage: string = '';
  successMessage: string = '';
  nameExistsError: string = '';
  accountNumberExistsError: string = '';

  cuentaNombre: string | undefined;
  numeroCuenta: string | undefined;
  tipoCuenta: string | undefined;
  saldo: number | undefined;
  amount: number | undefined;
  usuario: string | undefined;
  numeroIdentidad: string | undefined;

  constructor(
    private router: Router,
    private contactService: ContactService,
    private route: ActivatedRoute,
    private accountService: AccountService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.cuentaNombre = params['cuentaNombre'];
      this.numeroCuenta = params['numeroCuenta'];
      this.tipoCuenta = params['tipoCuenta'];
      this.saldo = params['saldo'];
      this.amount = params['amount'];
      this.usuario = params['usuario'];
      this.numeroIdentidad = params['numeroIdentidad'];
    });
  }

  /*confirmBeneficiary(): void {
    if (this.isAccountNumberValid() && this.isBeneficiaryNameValid()) {
      this.accountService.verifyAccount(this.beneficiary.accountNumber).subscribe(
        response => {
          if (response.exists) {
            const tipoCuenta = response.cuenta.tipoCuenta;
            const contacto = {
              numero_identidad: this.numeroIdentidad,
              nombre: this.beneficiary.name,
              numeroCuenta: this.beneficiary.accountNumber,
              tipoCuenta: tipoCuenta,
              isFavorite: this.beneficiary.saveAsFavorite
            };
            this.contactService.addContact(contacto).subscribe(
              response => {
                this.successMessage = 'Beneficiario agregado con éxito.';
                this.errorMessage = '';
                // Redirigir a la interfaz de beneficiario después de 2 segundos
                setTimeout(() => {
                  this.router.navigate(['/beneficiario'], {
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
                }, 2000); // Puedes ajustar el tiempo de espera según sea necesario
              },
              err => {
                console.error('Error al agregar beneficiario:', err);
                this.errorMessage = 'Error al agregar beneficiario. Por favor, intente de nuevo.';
                this.successMessage = '';
              }
            );
          } else {
            this.errorMessage = 'El número de cuenta ingresado no existe.';
            this.successMessage = '';
          }
        },
        error => {
          console.error('Error al verificar la cuenta:', error);
          this.errorMessage = 'Error al verificar la cuenta. Por favor, intente de nuevo.';
          this.successMessage = '';
        }
      );
    } else {
      this.errorMessage = 'Ingrese un número de cuenta válido y un nombre válido.';
      this.successMessage = '';
    }
  }*/

    confirmBeneficiary(): void {
      if (this.isAccountNumberValid() && this.isBeneficiaryNameValid()) {
          // Verificar si la cuenta existe en la base de datos de cuentas
          this.accountService.verifyAccount(this.beneficiary.accountNumber).subscribe(
              accountResponse => {
                  if (accountResponse.exists) {
                      // Verificar si el nombre completo ya existe en contactos
                      this.contactService.checkContactExistsByName(this.beneficiary.name).subscribe(
                          nameResponse => {
                              if (nameResponse.exists) {
                                  this.nameExistsError = 'El nombre completo ya está en uso.';
                                  this.errorMessage = '';
                              } else {
                                  this.nameExistsError = ''; // Limpiar error de nombre si no existe
                                  // Verificar si el número de cuenta ya existe en contactos
                                  this.contactService.checkContactExistsByAccountNumber(this.beneficiary.accountNumber).subscribe(
                                      accountNumberResponse => {
                                          if (accountNumberResponse.exists) {
                                              this.accountNumberExistsError = 'El número de cuenta ya está en uso.';
                                              this.errorMessage = '';
                                          } else {
                                              this.accountNumberExistsError = ''; // Limpiar error de número de cuenta si no existe
                                              // Si todas las verificaciones son exitosas, agregar el beneficiario
                                              this.addBeneficiary();
                                          }
                                      },
                                      error => {
                                          if (error.status === 404) {
                                              this.accountNumberExistsError = ''; // Limpiar error de número de cuenta si no existe
                                              // Si la cuenta no está en contactos, agregar el beneficiario
                                              this.addBeneficiary();
                                          } else {
                                              console.error('Error al verificar el número de cuenta en contactos:', error);
                                              this.errorMessage = 'Error al verificar el número de cuenta en contactos. Por favor, intente de nuevo.';
                                          }
                                      }
                                  );
                              }
                          },
                          error => {
                              if (error.status === 404) {
                                  this.nameExistsError = ''; // Limpiar error de nombre si no existe
                                  // Verificar si el número de cuenta ya existe en contactos
                                  this.contactService.checkContactExistsByAccountNumber(this.beneficiary.accountNumber).subscribe(
                                      accountNumberResponse => {
                                          if (accountNumberResponse.exists) {
                                              this.accountNumberExistsError = 'El número de cuenta ya está en uso.';
                                              this.errorMessage = '';
                                          } else {
                                              this.accountNumberExistsError = ''; // Limpiar error de número de cuenta si no existe
                                              // Si todas las verificaciones son exitosas, agregar el beneficiario
                                              this.addBeneficiary();
                                          }
                                      },
                                      accountNumberError => {
                                          if (accountNumberError.status === 404) {
                                              this.accountNumberExistsError = ''; // Limpiar error de número de cuenta si no existe
                                              // Si la cuenta no está en contactos, agregar el beneficiario
                                              this.addBeneficiary();
                                          } else {
                                              console.error('Error al verificar el número de cuenta en contactos:', accountNumberError);
                                              this.errorMessage = 'Error al verificar el número de cuenta en contactos. Por favor, intente de nuevo.';
                                          }
                                      }
                                  );
                              } else {
                                  console.error('Error al verificar el nombre:', error);
                                  this.errorMessage = 'Error al verificar el nombre. Por favor, intente de nuevo.';
                              }
                          }
                      );
                  } else {
                      this.errorMessage = 'El número de cuenta ingresado no existe.';
                      this.successMessage = '';
                  }
              },
              error => {
                  console.error('Error al verificar la cuenta:', error);
                  this.errorMessage = 'La cuenta ingresada no existe.';
              }
          );
      } else {
          this.errorMessage = 'Ingrese un número de cuenta válido y un nombre válido.';
          this.successMessage = '';
      }
  }
  
  addBeneficiary(): void {
      const contacto = {
          numero_identidad: this.numeroIdentidad,
          nombre: this.beneficiary.name,
          numeroCuenta: this.beneficiary.accountNumber,
          isFavorite: this.beneficiary.saveAsFavorite
      };
      this.contactService.addContact(contacto).subscribe(
          response => {
              this.successMessage = 'Beneficiario agregado con éxito.';
              this.errorMessage = '';
              // Redirigir a la interfaz de beneficiario después de 2 segundos
              setTimeout(() => {
                  this.router.navigate(['/beneficiario'], {
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
              }, 2000); // Puedes ajustar el tiempo de espera según sea necesario
          },
          err => {
              console.error('Error al agregar beneficiario:', err);
              this.errorMessage = 'Error al agregar beneficiario. Por favor, intente de nuevo.';
              this.successMessage = '';
          }
      );
  }
  
  isAccountNumberValid(): boolean {
      return /^\d{10}$/.test(this.beneficiary.accountNumber);
  }
  
  isBeneficiaryNameValid(): boolean {
      return /^[a-zA-Z\s]+$/.test(this.beneficiary.name);
  }
  
      
  /*isAccountNumberValid(): boolean {
    return /^\d{10}$/.test(this.beneficiary.accountNumber);
  }

  isBeneficiaryNameValid(): boolean {
    return /^[a-zA-Z\s]+$/.test(this.beneficiary.name);
  }*/

  goToBeneficiario(): void {
    this.router.navigate(['/beneficiario'], {
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

  goNext(): void {
    console.log('Ir a la siguiente pantalla');
  }

  goBack(): void {
    this.router.navigate(['/beneficiario'], {
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

  onAccountNumberChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/\D/g, '').substring(0, 10);
    this.beneficiary.accountNumber = input.value;
  }

  onNameChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^a-zA-Z\s]/g, '');
    this.beneficiary.name = input.value;
  }
}
