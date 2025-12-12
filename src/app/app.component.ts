import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface User {
  id?: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  createdAt?: Date;
}

interface ApiResponse {
  success: boolean;
  user: User;
  timestamp: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'looloop';
  
  private http = inject(HttpClient);
  
  // API data
  apiUser = signal<User | null>(null);
  apiLoading = signal(false);
  apiError = signal<string | null>(null);

  // Fetch random user from API (existing functionality)
  fetchRandomUser(): void {
    this.apiLoading.set(true);
    this.apiError.set(null);

    this.http.get<ApiResponse>('/api/random-user').subscribe({
      next: (response) => {
        this.apiUser.set(response.user);
        this.apiLoading.set(false);
      },
      error: (err) => {
        this.apiError.set('Failed to fetch user. Is the backend running?');
        this.apiLoading.set(false);
        console.error('API Error:', err);
      }
    });
  }

}
