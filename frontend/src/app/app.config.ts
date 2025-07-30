// frontend/src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter ,withInMemoryScrolling} from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { DatePipe } from '@angular/common'; // <-- Import DatePipe here
import { routes } from './app.routes';
import { authInterceptor } from './Interceptors/auth.interceptor'; // Import the functional interceptor

export const appConfig: ApplicationConfig = {
  providers: [
      provideRouter(
      routes,
      // Add this configuration to restore scroll position to the top
      withInMemoryScrolling({
        scrollPositionRestoration: 'top'
      })
    ),
    provideHttpClient(withInterceptors([
      authInterceptor // Provide the functional interceptor function here
    ])),
    DatePipe
    // ... other providers if you have them (e.g., provideAnimations())
  ]
};