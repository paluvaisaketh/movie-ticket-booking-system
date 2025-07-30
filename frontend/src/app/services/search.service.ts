// frontend/src/app/services/search.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private searchTermSource = new BehaviorSubject<string>('');
  currentSearchTerm = this.searchTermSource.asObservable();

  constructor() { }

  changeSearchTerm(term: string) {
    this.searchTermSource.next(term);
  }
}