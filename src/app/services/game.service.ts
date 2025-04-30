import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GameConfig, GameState, Position } from '../models/game.models';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private readonly MIN_SIZE = 3;
  private readonly MAX_SIZE = 100;
  private readonly DEFAULT_ARROWS = 3;

  private gameState = new BehaviorSubject<GameState>({
    hunter: { x: 0, y: 0 },
    wumpus: [],
    pits: [],
    gold: { x: 0, y: 0 },
    hasGold: false,
    arrows: this.DEFAULT_ARROWS,
    isGameOver: false,
    message: '',
    boardSize: { width: this.MIN_SIZE, height: this.MIN_SIZE }
  });

  private config: GameConfig = {
    boardSize: { width: this.MIN_SIZE, height: this.MIN_SIZE },
    controls: {
      up: 'ArrowUp',
      down: 'ArrowDown',
      left: 'ArrowLeft',
      right: 'ArrowRight',
      shoot: 'Space'
    }
  };

  constructor() { }

  getGameState(): Observable<GameState> {
    return this.gameState.asObservable();
  }

  initializeGame(width: number, height: number): void {
    width = Math.max(this.MIN_SIZE, Math.min(width, this.MAX_SIZE));
    height = Math.max(this.MIN_SIZE, Math.min(height, this.MAX_SIZE));
    
    this.config.boardSize = { width, height };

    // Generar posiciones de wumpus y pits primero
    const wumpus = this.generateWumpusPositions();
    const pits = this.generatePits();
    // Generar posición del oro en una casilla libre
    let gold: Position;
    do {
      gold = this.getRandomPosition();
    } while (
      (gold.x === 0 && gold.y === 0) ||
      wumpus.some(w => w.x === gold.x && w.y === gold.y) ||
      pits.some(p => p.x === gold.x && p.y === gold.y)
    );

    const newState: GameState = {
      hunter: { x: 0, y: 0 },
      wumpus,
      pits,
      gold,
      hasGold: false,
      arrows: this.DEFAULT_ARROWS,
      isGameOver: false,
      message: 'Game started! Hunt the Wumpus and find the gold!',
      boardSize: { width, height }
    };
    
    this.gameState.next(newState);
  }

  updateControls(controls: Partial<GameConfig['controls']>): void {
    this.config.controls = { ...this.config.controls, ...controls };
  }

  private generateWumpusPositions(): Position[] {
    const numWumpus = Math.max(1, Math.floor((this.config.boardSize.width * this.config.boardSize.height) / 20));
    const positions: Position[] = [];
    
    while (positions.length < numWumpus) {
      const pos = this.getRandomPosition();
      // No permitir Wumpus en la casilla de inicio del hunter
      if ((pos.x !== 0 || pos.y !== 0) && !this.isPositionOccupied(pos, positions)) {
        positions.push(pos);
      }
    }
    
    return positions;
  }

  private generatePits(): Position[] {
    const numPits = Math.max(2, Math.floor((this.config.boardSize.width * this.config.boardSize.height) / 10));
    const positions: Position[] = [];
    
    while (positions.length < numPits) {
      const pos = this.getRandomPosition();
      if (!this.isPositionOccupied(pos, positions) && !this.isPositionOccupied(pos, this.gameState.value.wumpus)) {
        positions.push(pos);
      }
    }
    
    return positions;
  }

  private getRandomPosition(): Position {
    return {
      x: Math.floor(Math.random() * this.config.boardSize.width),
      y: Math.floor(Math.random() * this.config.boardSize.height)
    };
  }

  private isPositionOccupied(pos: Position, positions: Position[]): boolean {
    return positions.some(p => p.x === pos.x && p.y === pos.y);
  }

  moveHunter(direction: 'up' | 'down' | 'left' | 'right'): void {
    if (this.gameState.value.isGameOver) return;

    const currentState = this.gameState.value;
    const newPosition = { ...currentState.hunter };

    switch (direction) {
      case 'up':
        if (newPosition.y > 0) newPosition.y--;
        break;
      case 'down':
        if (newPosition.y < this.config.boardSize.height - 1) newPosition.y++;
        break;
      case 'left':
        if (newPosition.x > 0) newPosition.x--;
        break;
      case 'right':
        if (newPosition.x < this.config.boardSize.width - 1) newPosition.x++;
        break;
    }

    let newState = { ...currentState, hunter: newPosition };

    // Si el cazador recoge el oro
    if (!currentState.hasGold && newPosition.x === currentState.gold.x && newPosition.y === currentState.gold.y) {
      newState = { ...newState, hasGold: true, message: 'You picked up the gold! Return to the entrance to win!' };
    }
    // Si el cazador tiene el oro y vuelve a la entrada
    if (newState.hasGold && newPosition.x === 0 && newPosition.y === 0) {
      newState = { ...newState, isGameOver: true, message: 'Congratulations! You escaped with the gold!' };
    }

    // Mantén la lógica de colisiones existente
    this.checkCollisionsWithGold(newState);
  }

  // Nueva función para comprobar colisiones y oro
  private checkCollisionsWithGold(state: GameState): void {
    let newState = { ...state };
    if (this.isPositionOccupied(state.hunter, state.wumpus)) {
      newState = {
        ...newState,
        isGameOver: true,
        message: 'Game Over Hunter! A Wumpus got you!'
      };
    } else if (this.isPositionOccupied(state.hunter, state.pits)) {
      newState = {
        ...newState,
        isGameOver: true,
        message: 'Game Over Hunter! You fell into a pit!'
      };
    }
    this.gameState.next(newState);
  }

  shootArrow(direction: 'up' | 'down' | 'left' | 'right'): void {
    const state = this.gameState.value;
    if (state.isGameOver || state.arrows <= 0) return;

    const arrowPosition = { ...state.hunter };
    let hitWumpus = false;

    while (
      arrowPosition.x >= 0 && 
      arrowPosition.x < this.config.boardSize.width &&
      arrowPosition.y >= 0 && 
      arrowPosition.y < this.config.boardSize.height
    ) {
      switch (direction) {
        case 'up': arrowPosition.y--; break;
        case 'down': arrowPosition.y++; break;
        case 'left': arrowPosition.x--; break;
        case 'right': arrowPosition.x++; break;
      }

      if (this.isPositionOccupied(arrowPosition, state.wumpus)) {
        hitWumpus = true;
        break;
      }
    }

    const newState = {
      ...state,
      arrows: state.arrows - 1,
      wumpus: hitWumpus ? state.wumpus.filter(w => w.x !== arrowPosition.x || w.y !== arrowPosition.y) : state.wumpus,
      message: hitWumpus ? 'You hit a Wumpus!' : 'Arrow missed!'
    };

    if (newState.wumpus.length === 0) {
      newState.isGameOver = true;
      newState.message = 'Congratulations! You won!';
    } else if (newState.arrows === 0 && newState.wumpus.length > 0) {
      newState.isGameOver = true;
      newState.message = 'Game Over! Out of arrows!';
    }

    this.gameState.next(newState);
  }

  private checkCollisions(newPosition: Position): void {
    const state = this.gameState.value;
    let newState = { ...state, hunter: newPosition };

    if (this.isPositionOccupied(newPosition, state.wumpus)) {
      newState = {
        ...newState,
        isGameOver: true,
        message: 'Game Over Hunter! A Wumpus got you!'
      };
    } else if (this.isPositionOccupied(newPosition, state.pits)) {
      newState = {
        ...newState,
        isGameOver: true,
        message: 'Game Over Hunter! You fell into a pit!'
      };
    } else {
      newState.message = this.getNearbyWarnings(newPosition);
    }

    this.gameState.next(newState);
  }

  private getNearbyWarnings(position: Position): string {
    const warnings: string[] = [];
    const adjacentPositions = [
      { x: position.x - 1, y: position.y },
      { x: position.x + 1, y: position.y },
      { x: position.x, y: position.y - 1 },
      { x: position.x, y: position.y + 1 }
    ];

    if (adjacentPositions.some(pos => this.isPositionOccupied(pos, this.gameState.value.wumpus))) {
      warnings.push('You smell something terrible nearby!');
    }
    if (adjacentPositions.some(pos => this.isPositionOccupied(pos, this.gameState.value.pits))) {
      warnings.push('You feel a draft!');
    }

    return warnings.join(' ');
  }
}
