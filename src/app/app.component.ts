import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar: string;
}

interface ApiResponse {
  success: boolean;
  user: User;
  timestamp: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'looloop';
  
  user = signal<User | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  fetchRandomUser(): void {
    this.loading.set(true);
    this.error.set(null);

    this.http.get<ApiResponse>('/api/random-user').subscribe({
      next: (response) => {
        this.user.set(response.user);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to fetch user. Is the backend running?');
        this.loading.set(false);
        console.error('API Error:', err);
      }
    });
  }
}
