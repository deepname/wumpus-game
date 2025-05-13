import { Component } from '@angular/core';
import { TranslationService } from '../../services/translation.service';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  constructor(public translationService: TranslationService) {}

  setLanguage(lang: string) {
    this.translationService.setLanguage(lang);
  }

  get languages() {
    return this.translationService.getAvailableLanguages();
  }

  get currentLang() {
    return this.translationService.getCurrentLang();
  }
}
