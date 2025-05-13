import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game.service';
import { TranslationService } from '../../services/translation.service';
import { TranslateModule } from '@ngx-translate/core';
import { ControlsConfig } from '../../models/controls.model';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, FormsModule],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  boardWidth = 10;
  boardHeight = 10;
  controls: ControlsConfig = {
    up: 'ArrowUp',
    down: 'ArrowDown',
    left: 'ArrowLeft',
    right: 'ArrowRight',
    shoot: 'Space'
  };

  showFog = true;
  private _boardSizeValid = true;

  availableLanguages: { code: string, name: string }[];
  selectedLanguage: string;

  constructor(
    private router: Router,
    private gameService: GameService,
    private translationService: TranslationService
  ) {
    this.availableLanguages = this.translationService.getAvailableLanguages();
    this.selectedLanguage = this.translationService.getCurrentLang();
  }

  ngOnInit(): void {
    this.validateBoardSize();
  }

  onLanguageChange(lang: string): void {
    this.translationService.setLanguage(lang);
  }

  validateBoardSize(): void {
    this._boardSizeValid = 
      this.boardWidth >= 5 && 
      this.boardWidth <= 20 && 
      this.boardHeight >= 5 && 
      this.boardHeight <= 20;
  }

  startGame(): void {
    if (this._boardSizeValid) {
      this.gameService.initializeGame(
        this.boardWidth,
        this.boardHeight,
        this.showFog,
        this.controls
      );
      this.router.navigate(['/game']);
    }
  }

  get boardSizeValid(): boolean {
    return this._boardSizeValid;
  }

  updateControl(control: string, event: KeyboardEvent): void {
    const validControl = control as keyof typeof this.controls;
    event.preventDefault();
    this.controls[validControl] = event.code;
  }
}
