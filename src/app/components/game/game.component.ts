import { Component, HostListener, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { GameService } from '../../services/game.service';
import { GameState } from '../../models/game.models';
import { RangePipe } from '../../pipes/range.pipe';
import { MobileControlsComponent } from '../mobile-controls/mobile-controls.component';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, RouterModule, RangePipe, MobileControlsComponent],
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit, AfterViewInit {
  gameState$!: Observable<GameState>;
  shootMode = false;
  visited = new Set<string>();
  showFog = true;
  isMobile = false;

  @ViewChild('gameBoard', { static: false }) gameBoardRef!: ElementRef<HTMLDivElement>;
  hunterPosition = { x: 0, y: 0 };

  constructor(
    private gameService: GameService
  ) {}

  ngOnInit(): void {
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    this.gameState$ = this.gameService.getGameState();
    this.showFog = this.gameService.getShowFog();
    this.gameState$.subscribe(state => {
      // Marcar como visitada la casilla actual y las adyacentes ortogonales
      this.visited.add(`${state.hunter.x},${state.hunter.y}`);
      const adj = [
        { x: state.hunter.x - 1, y: state.hunter.y },
        { x: state.hunter.x + 1, y: state.hunter.y },
        { x: state.hunter.x, y: state.hunter.y - 1 },
        { x: state.hunter.x, y: state.hunter.y + 1 }
      ];
      adj.forEach(pos => {
        if (
          pos.x >= 0 && pos.x < state.boardSize.width &&
          pos.y >= 0 && pos.y < state.boardSize.height
        ) {
          this.visited.add(`${pos.x},${pos.y}`);
        }
      });
      // Si el juego termina, marcar todas como visitadas
      if (state.isGameOver) {
        for (let x = 0; x < state.boardSize.width; x++) {
          for (let y = 0; y < state.boardSize.height; y++) {
            this.visited.add(`${x},${y}`);
          }
        }
      }
      this.hunterPosition = { x: state.hunter.x, y: state.hunter.y };
      this.centerGameBoard();
    });
  }

  ngAfterViewInit(): void {
    this.centerGameBoard();
  }

  centerGameBoard(): void {
    if (this.gameBoardRef) {
      const gameBoard = this.gameBoardRef.nativeElement as HTMLElement;
      // Busca la primera celda para obtener el tamaño
      const firstRow = gameBoard.querySelector('.row');
      if (!firstRow) return;
      const firstCell = firstRow.querySelector('.cell') as HTMLElement;
      if (!firstCell) return;
      const cellWidth = firstCell.offsetWidth;
      const cellHeight = firstCell.offsetHeight;
      const centerX = this.hunterPosition.x * cellWidth + cellWidth / 2;
      const centerY = this.hunterPosition.y * cellHeight + cellHeight / 2;
      gameBoard.scrollLeft = centerX - gameBoard.offsetWidth / 2;
      gameBoard.scrollTop = centerY - gameBoard.offsetHeight / 2;
    }
  }

  isCellVisible(x: number, y: number, state: GameState): boolean {
    // Siempre visible si el juego terminó
    if (state.isGameOver) return true;
    // Siempre visible si está visitada
    if (this.visited.has(`${x},${y}`)) return true;
    // Siempre visible si es la posición actual
    if (state.hunter.x === x && state.hunter.y === y) return true;
    // Adyacentes ortogonales
    const adj = [
      { x: state.hunter.x - 1, y: state.hunter.y },
      { x: state.hunter.x + 1, y: state.hunter.y },
      { x: state.hunter.x, y: state.hunter.y - 1 },
      { x: state.hunter.x, y: state.hunter.y + 1 }
    ];
    return adj.some(pos => pos.x === x && pos.y === y);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    let currentState: GameState | undefined;
    this.gameState$.subscribe(state => currentState = state);

    if (currentState?.isGameOver) return;

    if (event.code === 'Space') {
      // Toggle shoot mode
      this.shootMode = !this.shootMode;
      return;
    }

    if (this.shootMode) {
      switch (event.code) {
        case 'ArrowUp':
          this.gameService.shootArrow('up');
          break;
        case 'ArrowDown':
          this.gameService.shootArrow('down');
          break;
        case 'ArrowLeft':
          this.gameService.shootArrow('left');
          break;
        case 'ArrowRight':
          this.gameService.shootArrow('right');
          break;
      }
      this.shootMode = false;
    } else {
      switch (event.code) {
        case 'ArrowUp':
          this.gameService.moveHunter('up');
          break;
        case 'ArrowDown':
          this.gameService.moveHunter('down');
          break;
        case 'ArrowLeft':
          this.gameService.moveHunter('left');
          break;
        case 'ArrowRight':
          this.gameService.moveHunter('right');
          break;
      }
    }
  }

  getCellContent(x: number, y: number, state: GameState): string {
    if (state.hunter.x === x && state.hunter.y === y) {
      return '🏹';
    } else if (state.wumpus.some(w => w.x === x && w.y === y)) {
      return '👾';
    } else if (state.pits.some(p => p.x === x && p.y === y)) {
      return '⚫';
    } else if (!state.hasGold && state.gold.x === x && state.gold.y === y) {
      return '💰';
    }
    return this.getAdjacentEffects(x, y, state);
  }

  getAdjacentEffects(x: number, y: number, state: GameState): string {
    const adj = [
      { x: x - 1, y },
      { x: x + 1, y },
      { x, y: y - 1 },
      { x, y: y + 1 }
    ];
    let stench = false;
    let breeze = false;
    for (const pos of adj) {
      if (state.wumpus.some(w => w.x === pos.x && w.y === pos.y)) stench = true;
      if (state.pits.some(p => p.x === pos.x && p.y === pos.y)) breeze = true;
    }
    if (stench && breeze) return '💨🌀';
    if (stench) return '💨';
    if (breeze) return '🌀';
    return ' ';
  }

  generateBoard(state: GameState): string[][] {
    const board: string[][] = [];
    const width = state.boardSize.width;
    const height = state.boardSize.height;

    for (let y = 0; y < height; y++) {
      board[y] = [];
      for (let x = 0; x < width; x++) {
        if (state.hunter.x === x && state.hunter.y === y) {
          board[y][x] = 'H';
        } else if (state.wumpus.some(w => w.x === x && w.y === y)) {
          board[y][x] = 'W';
        } else if (state.pits.some(p => p.x === x && p.y === y)) {
          board[y][x] = 'P';
        } else {
          board[y][x] = '.';
        }
      }
    }
    return board;
  }

  // Manejar eventos de los controles móviles
  onMobileMove(dir: 'up' | 'down' | 'left' | 'right') {
    if (this.shootMode) {
      this.gameService.shootArrow(dir);
      this.shootMode = false;
    } else {
      this.gameService.moveHunter(dir);
    }
  }
  onMobileShoot() {
    this.shootMode = !this.shootMode;
  }
}
