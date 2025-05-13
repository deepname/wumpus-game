import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  constructor(private translate: TranslateService) {
    this.translate.addLangs(['en', 'es', 'ca', 'gl', 'eu']);
    const savedLang = localStorage.getItem('selectedLanguage');
    if (savedLang) {
      this.translate.use(savedLang);
    } else {
      const browserLang = this.translate.getBrowserLang();
      const lang = browserLang?.match(/en|es|ca|gl|eu/) ? browserLang : 'en';
      this.setLanguage(lang);
    }
  }

  setLanguage(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('selectedLanguage', lang);
  }

  getCurrentLang(): string {
    return this.translate.currentLang || 'en';
  }

  getAvailableLanguages(): { code: string, name: string }[] {
    return [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Español' },
      { code: 'ca', name: 'Català' },
      { code: 'gl', name: 'Galego' },
      { code: 'eu', name: 'Euskara' }
    ];
  }
}
