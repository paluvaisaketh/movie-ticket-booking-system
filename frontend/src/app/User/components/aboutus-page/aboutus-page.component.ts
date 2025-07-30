// about-us.component.ts
import { Component, OnInit, AfterViewInit, HostListener } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LayoutComponent } from '../../../Core/layout/layout.component';
@Component({
  imports:[LayoutComponent,RouterLink],
  selector: 'app-about-us',
  templateUrl: './aboutus-page.component.html',
  styleUrls: ['./aboutus-page.component.css']
})
export class AboutusPageComponent implements OnInit, AfterViewInit {
  isLoggedIn: boolean = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.checkLoginStatus();
  }

  ngAfterViewInit(): void {
    this.setupCountUpAnimation();
    this.setupCardHoverEffects();
  }

  private checkLoginStatus(): void {
    const loggedIn = localStorage.getItem('isLoggedIn');
    this.isLoggedIn = loggedIn === 'true';
  }

  private setupCountUpAnimation(): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.target.classList.contains('count-up')) {
          this.animateNumber(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('.count-up').forEach(el => {
      observer.observe(el);
    });
  }

  private animateNumber(element: Element): void {
    const text = element.textContent?.trim() || '';
    const match = text.match(/^(\d+)([^\d]*)/);
    
    if (!match) return;
    
    const number = parseInt(match[1]);
    const suffix = match[2] || '';
    const duration = 2000;
    const startTime = performance.now();
    
    const updateNumber = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentValue = Math.floor(progress * number);
      
      element.textContent = currentValue + suffix;
      
      if (progress < 1) {
        requestAnimationFrame(updateNumber);
      }
    };
    
    requestAnimationFrame(updateNumber);
  }

  private setupCardHoverEffects(): void {
    const cards = document.querySelectorAll('.shadow-lg');
    cards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        (card as HTMLElement).style.transform = 'translateY(-5px)';
      });
      card.addEventListener('mouseleave', () => {
        (card as HTMLElement).style.transform = 'translateY(0)';
      });
    });
  }

  logout(): void {
    localStorage.removeItem('isLoggedIn');
    this.isLoggedIn = false;
    this.router.navigate(['/']);
  }
}