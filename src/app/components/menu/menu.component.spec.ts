import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MenuComponent } from './menu.component';
import { GameService } from '../../services/game.service';

describe('MenuComponent', () => {
  let component: MenuComponent;
  let fixture: ComponentFixture<MenuComponent>;
  let gameService: GameService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuComponent, RouterTestingModule, FormsModule],
      providers: [GameService]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MenuComponent);
    component = fixture.componentInstance;
    gameService = TestBed.inject(GameService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.boardWidth).toBe(4);
    expect(component.boardHeight).toBe(4);
    expect(component.controls).toBeDefined();
    expect(component.controls.up).toBe('ArrowUp');
    expect(component.controls.down).toBe('ArrowDown');
    expect(component.controls.left).toBe('ArrowLeft');
    expect(component.controls.right).toBe('ArrowRight');
    expect(component.controls.shoot).toBe('Space');
  });

  it('should update controls', () => {
    const event = new KeyboardEvent('keydown', { code: 'KeyW' });
    component.updateControl('up', event);
    expect(component.controls.up).toBe('KeyW');
  });

  it('should start game with custom board size', () => {
    component.boardWidth = 5;
    component.boardHeight = 5;
    spyOn(gameService, 'initializeGame');
    component.startGame();
    expect(gameService.initializeGame).toHaveBeenCalledWith(5, 5);
  });

  it('should start game with current configuration', () => {
    spyOn(gameService, 'initializeGame');
    spyOn(gameService, 'updateControls');
    spyOn(router, 'navigate');

    component.startGame();

    expect(gameService.initializeGame).toHaveBeenCalledWith(4, 4);
    expect(gameService.updateControls).toHaveBeenCalledWith(component.controls);
    expect(router.navigate).toHaveBeenCalledWith(['/game']);
  });
});
