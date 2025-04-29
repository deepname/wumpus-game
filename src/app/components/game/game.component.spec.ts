import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { GameComponent } from './game.component';
import { GameService } from '../../services/game.service';
import { GameState } from '../../models/game.models';
import { RangePipe } from '../../pipes/range.pipe';

describe('GameComponent', () => {
  let component: GameComponent;
  let fixture: ComponentFixture<GameComponent>;
  let gameService: GameService;
  let mockGameState: BehaviorSubject<GameState>;

  beforeEach(async () => {
    const initialState: GameState = {
      hunter: { x: 0, y: 0 },
      wumpus: [{ x: 2, y: 2 }],
      pits: [{ x: 1, y: 1 }],
      arrows: 3,
      isGameOver: false,
      message: '',
      boardSize: { width: 3, height: 3 }
    };

    mockGameState = new BehaviorSubject<GameState>(initialState);

    const mockGameService = {
      getGameState: () => mockGameState.asObservable(),
      moveHunter: jasmine.createSpy('moveHunter'),
      shootArrow: jasmine.createSpy('shootArrow')
    };

    await TestBed.configureTestingModule({
      imports: [GameComponent, RouterTestingModule, RangePipe],
      providers: [
        { provide: GameService, useValue: mockGameService }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GameComponent);
    component = fixture.componentInstance;
    gameService = TestBed.inject(GameService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle keyboard events for movement', () => {
    const event = new KeyboardEvent('keydown', { code: 'ArrowRight' });
    component.handleKeyboardEvent(event);
    expect(gameService.moveHunter).toHaveBeenCalledWith('right');
  });

  it('should handle keyboard events for shooting', () => {
    component.shootMode = true;
    const event = new KeyboardEvent('keydown', { code: 'ArrowRight' });
    component.handleKeyboardEvent(event);
    expect(gameService.shootArrow).toHaveBeenCalledWith('right');
  });

  it('should update game state from service', (done) => {
    mockGameState.pipe(take(1)).subscribe(state => {
      const newState: GameState = {
        ...state,
        message: 'Test message',
        isGameOver: true
      };
      mockGameState.next(newState);
      fixture.detectChanges();

      const messageElement = fixture.nativeElement.querySelector('.message');
      expect(messageElement.textContent).toContain('Test message');
      done();
    });
  });
});
