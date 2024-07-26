import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService } from '../services/usuario.service';

@Component({
  selector: 'app-answer-security-questions',
  templateUrl: './answer-security-questions.component.html',
  styleUrls: ['./answer-security-questions.component.css']
})
export class AnswerSecurityQuestionsComponent implements OnInit {
  cedula: string = '';
  usuario: any;
  questions: string[] = [];
  answers: string[] = [];
  correctAnswers: string[] = [];
  selectedQuestionIndex: number | null = null;
  answer: string = '';
  attempts: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.cedula = params['cedula'];
      this.obtenerUsuarioConLabels();
    });
  }

  obtenerUsuarioConLabels() {
    console.log('Solicitando usuario con cédula:', this.cedula);
    this.usuarioService.getUsuarioWithLabels(this.cedula).subscribe(
      response => {
        console.log('Usuario con labels:', response);
        this.usuario = response;
        this.questions = response.labels || [];
        /*this.answers = new Array(this.questions.length).fill('');*/
        this.correctAnswers = [
          response.answer1,
          response.answer2,
          response.answer3,
          response.answer4,
          response.answer5
        ];
      },
      error => {
        console.error('Error al obtener el usuario con labels:', error);
        this.questions = [];
        /*this.answers = [];*/
        this.correctAnswers = [];
      }
    );
  }
  

  goBack() {
    this.router.navigate(['/previous-route']);
  }

  validateAnswer() {
    if (this.selectedQuestionIndex === null || !this.answer.trim()) {
      alert('Debe seleccionar una pregunta y proporcionar una respuesta');
      return;
    }

    if (this.answer === this.correctAnswers[this.selectedQuestionIndex]) {
      console.log('Respuesta correcta');
      this.router.navigate(['/verify-identity'], { queryParams: { cedula: this.cedula } });
    } else {
      this.attempts++;
      if (this.attempts >= 3) {
        alert('Cuenta bloqueada por demasiados intentos fallidos.');
        this.bloquearCuenta();
      } else {
        alert('Respuesta incorrecta. Intente nuevamente.');
        this.selectedQuestionIndex = null;
        this.answer = '';
      }
    }
  }

  bloquearCuenta() {
    // Implementar la lógica para bloquear la cuenta del usuario aquí.
    console.log('Cuenta bloqueada');
  }

    
}
