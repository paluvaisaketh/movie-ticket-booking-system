import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

interface Movie {
  id: string;
  title: string;
  poster: string;
  rating: string;
  language: string;
  genre: string[];
  duration: string;
  synopsis: string;
  formats: string[];
}

@Component({
  imports:[CommonModule],
  selector: 'app-movie-details-dialog',
  templateUrl: './movie-details-dialog.component.html',
  styleUrls: ['./movie-details-dialog.component.css']
})
export class MovieDetailsDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<MovieDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { movie: Movie },
    private router: Router
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }

  onBookNow(): void {
    this.dialogRef.close();
    this.router.navigate(['/movies'], { 
      queryParams: { movieId: this.data.movie.id } 
    });
  }
}