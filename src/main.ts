import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/interceptors/auth.interceptor';


bootstrapApplication(AppComponent, {
  providers: [
    ...appConfig.providers, // Mantieni i provider di default
    provideHttpClient(withInterceptors([authInterceptor])) // Registra il tuo intercettore
  ]
}).catch((err) => console.error(err));