import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config'; // Your appConfig import
// import "@angular/compiler";
// UNCOMMENT THIS LINE:
bootstrapApplication(AppComponent, appConfig) // <--- THIS IS THE CORRECT WAY
  .catch((err) => console.error(err))