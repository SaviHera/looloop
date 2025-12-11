import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirestoreService, User } from './services/firestore.service';

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
export class AppComponent implements OnInit {
  title = 'looloop';
  
  private firestoreService = inject(FirestoreService);
  private http = inject(HttpClient);
  
  // Firestore data
  users = signal<User[]>([]);
  firestoreLoading = signal(false);
  firestoreError = signal<string | null>(null);
  
  // New user form
  newUser = signal({
    name: '',
    email: '',
    role: '',
    avatar: '👤'
  });
  
  // API data (existing)
  apiUser = signal<User | null>(null);
  apiLoading = signal(false);
  apiError = signal<string | null>(null);

  // Available avatars
  avatars = ['👤', '👩‍💻', '👨‍💻', '👩‍🎨', '👨‍🎨', '👩‍💼', '👨‍💼', '👩‍🔬', '👨‍🔬', '👨‍🔧', '🧑‍💻'];

  ngOnInit(): void {
    this.loadUsers();
  }

  // Load users from Firestore (real-time)
  loadUsers(): void {
    this.firestoreLoading.set(true);
    this.firestoreError.set(null);

    this.firestoreService.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.firestoreLoading.set(false);
      },
      error: (err) => {
        this.firestoreError.set('Failed to load users from Firestore');
        this.firestoreLoading.set(false);
        console.error('Firestore Error:', err);
      }
    });
  }

  // Add new user to Firestore
  async addUser(): Promise<void> {
    const userData = this.newUser();
    if (!userData.name || !userData.email || !userData.role) {
      this.firestoreError.set('Please fill in all fields');
      return;
    }

    this.firestoreLoading.set(true);
    this.firestoreError.set(null);

    try {
      await this.firestoreService.addUser(userData);
      // Reset form
      this.newUser.set({ name: '', email: '', role: '', avatar: '👤' });
    } catch (err) {
      this.firestoreError.set('Failed to add user');
      console.error('Add user error:', err);
    } finally {
      this.firestoreLoading.set(false);
    }
  }

  // Delete user from Firestore
  async deleteUser(id: string): Promise<void> {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await this.firestoreService.deleteUser(id);
    } catch (err) {
      this.firestoreError.set('Failed to delete user');
      console.error('Delete user error:', err);
    }
  }

  // Seed sample data
  async seedData(): Promise<void> {
    this.firestoreLoading.set(true);
    try {
      await this.firestoreService.seedSampleData();
    } catch (err) {
      this.firestoreError.set('Failed to seed data');
      console.error('Seed data error:', err);
    } finally {
      this.firestoreLoading.set(false);
    }
  }

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

  // Update form field
  updateNewUser(field: string, value: string): void {
    this.newUser.update(current => ({ ...current, [field]: value }));
  }
}
