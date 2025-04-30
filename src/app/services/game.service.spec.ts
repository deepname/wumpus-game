import { TestBed } from '@angular/core/testing';
import { take } from 'rxjs/operators';
import { GameService } from './game.service';

describe('GameService', () => {
  let service: GameService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize game with valid board size', () => {
    service.initializeGame(5, 5, true);
    service.getGameState().subscribe(state => {
      expect(state.boardSize.width).toBe(5);
      expect(state.boardSize.height).toBe(5);
      expect(state.hunter).toBeDefined();
      expect(state.wumpus.length).toBeGreaterThan(0);
      expect(state.pits.length).toBeGreaterThan(0);
      expect(state.arrows).toBeGreaterThan(0);
      expect(state.gold).toBeDefined();
      expect(state.hasGold).toBeDefined();
      expect(state.isGameOver).toBeFalse();
    });
  });

  it('should limit board size to min and max values', (done) => {
    service.initializeGame(1, 1, true); // Should be adjusted to min size
    service.getGameState().pipe(take(1)).subscribe(state => {
      expect(state.boardSize.width).toBe(3); // Min size
      expect(state.boardSize.height).toBe(3); // Min size
      
      service.initializeGame(150, 150, true); // Should be adjusted to max size
      service.getGameState().pipe(take(1)).subscribe(state => {
        expect(state.boardSize.width).toBe(40); // Max size
        expect(state.boardSize.height).toBe(40); // Max size
        done();
      });
    });
  });

  it('should handle hunter movement within bounds', (done) => {
    service.initializeGame(3, 3, true);
    service.getGameState().pipe(take(1)).subscribe(state => {
      const initialX = state.hunter.x;
      const initialY = state.hunter.y;
      service.moveHunter('right');
      service.getGameState().pipe(take(1)).subscribe(newState => {
        expect(newState.hunter.x).toBe(initialX + 1);
        expect(newState.hunter.y).toBe(initialY);
        done();
      });
    });
  });

  it('should handle arrow shooting', (done) => {
    service.initializeGame(3, 3, true);
    let initialArrows: number;
    service.getGameState().pipe(take(1)).subscribe(state => {
      initialArrows = state.arrows;
      service.shootArrow('right');
      service.getGameState().subscribe(newState => {
        expect(newState.arrows).toBe(initialArrows - 1);
        done();
      });
    });
  });
});
