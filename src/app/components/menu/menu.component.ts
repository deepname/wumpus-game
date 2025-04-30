import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent {
  boardWidth = 10;
  boardHeight = 10;
  controls = {
    up: 'ArrowUp',
    down: 'ArrowDown',
    left: 'ArrowLeft',
    right: 'ArrowRight',
    shoot: 'Space'
  };

  showFog = true;

  constructor(
    private gameService: GameService,
    private router: Router
  ) {}

  startGame(): void {
    this.gameService.initializeGame(this.boardWidth, this.boardHeight, this.showFog);
    this.gameService.updateControls(this.controls);
    this.router.navigate(['/game']);
  }

  get boardSizeValid(): boolean {
    return this.boardWidth >= 4 && this.boardHeight >= 4;
  }

  updateControl(control: string, event: KeyboardEvent): void {
    const validControl = control as keyof typeof this.controls;
    event.preventDefault();
    this.controls[validControl] = event.code;
  }
}
