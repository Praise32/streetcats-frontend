import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/interceptors/auth.interceptor';
import { importProvidersFrom } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';

bootstrapApplication(AppComponent, {
  providers: [
    ...appConfig.providers,
    provideHttpClient(withInterceptors([authInterceptor])),
    importProvidersFrom(MarkdownModule.forRoot())
  ]
}).catch((err) => console.error(err));