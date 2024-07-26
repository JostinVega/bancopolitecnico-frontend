import { Component, OnInit, Renderer2, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AccountService } from '../services/account.service';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit, AfterViewInit {
  currentIndex: number = 0;
  totalCards: number = 0;
  accounts: any[] = [];
  usuario: string | undefined;
  nombre_completo: string | undefined;
  showBalance: boolean = false; 

  constructor(
    private renderer: Renderer2,
    private router: Router,
    private route: ActivatedRoute,
    private accountService: AccountService
  ) {}

  ngOnInit(): void {
    window.addEventListener('resize', this.updateNavigation.bind(this));
    this.route.queryParams.subscribe(params => {
      this.usuario = params['usuario'];
      if (this.usuario) {
        this.fetchAccounts(this.usuario);
        this.fetchNombreCompleto(this.usuario); 
      } else {
        console.error('No usuario passed in queryParams');
      }
    });
  }

  ngAfterViewInit(): void {
    this.totalCards = document.querySelectorAll('.account-card').length;
    this.updateNavigation();
  }

  fetchAccounts(usuario?: string): void {
    if (usuario) {
      this.accountService.getUserAccounts(usuario).subscribe(
        data => {
          this.accounts = data.cuentas;
          this.totalCards = this.accounts.length;
          this.updateNavigation();
        },
        error => {
          console.error('Error fetching accounts:', error);
        }
      );
    } else {
      console.error('No logged-in user');
    }
  }

  fetchNombreCompleto(usuario: string): void {
    this.accountService.getNombreCompleto(usuario).subscribe(
      data => {
        this.nombre_completo = data.nombre_completo;
      },
      error => {
        console.error('Error fetching nombre_completo:', error);
      }
    );
  }

  updateNavigation(): void {
    const accountCardsWrapper = document.getElementById('accountCardsWrapper');

    if (!accountCardsWrapper) {
      return;
    }

    /*const cardWidth = accountCardsWrapper.children[0]?.clientWidth;*/

    const cardWidth = accountCardsWrapper.clientWidth; // Cambiado para obtener el ancho del contenedor
    const offset = -this.currentIndex * cardWidth;
    this.renderer.setStyle(accountCardsWrapper, 'transform', `translateX(${offset}px)`);
  }

  prevCard(): void {
    if (this.currentIndex > 0) {
        this.currentIndex--;
        this.updateNavigation();
    }
  }

  nextCard(): void {
      if (this.currentIndex < this.totalCards - 1) {
          this.currentIndex++;
          this.updateNavigation();
      }
  }
 
  navigateToTransfer(): void {
 
      this.router.navigate(['/transferencia'], { queryParams: { usuario: this.usuario } });
    
  }

  navigateToNewAccount(): void {
    this.router.navigate(['/verificar-crear-cuenta'], { queryParams: { usuario: this.usuario, numeroIdentidad: this.getNumeroIdentidad() } });
  }

  getNumeroIdentidad(): string | undefined {
    if (this.accounts.length > 0) {
      return this.accounts[0].numeroIdentidad;
    }
    return undefined;
  }

  navigateToChangePassword(): void {
    const numeroIdentidad = this.getNumeroIdentidad();
    if (numeroIdentidad) {
      this.router.navigate(['/change-password'], { queryParams: { numeroIdentidad, usuario: this.usuario} });
    } else {
      console.error('Numero de Identidad no disponible');
    }
  }

  toggleBalanceVisibility(): void { // Agrega esta función
    this.showBalance = !this.showBalance;
  }

  navigateToHistorialTransacciones(): void {
    const numeroIdentidad = this.getNumeroIdentidad();
    if (this.usuario && numeroIdentidad) {
      console.log('Navegando a historial-transacciones con:', {
        usuario: this.usuario,
        numeroIdentidad: numeroIdentidad
      });
      this.router.navigate(['/historial-transacciones'], {
        queryParams: {
          usuario: this.usuario,
          numeroIdentidad: numeroIdentidad
        }
      });
    } else {
      console.error('Usuario o Numero de Identidad no disponible');
    }
  }
}