import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirestoreService, TestData } from './services/firestore.service';
import { Subscription } from 'rxjs';

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
export class AppComponent implements OnInit, OnDestroy {
  title = 'looloop';
  
  private http = inject(HttpClient);
  private firestoreService = inject(FirestoreService);
  private dataSubscription?: Subscription;
  
  // API data
  apiUser = signal<User | null>(null);
  apiLoading = signal(false);
  apiError = signal<string | null>(null);

  // Firestore data
  testData = signal<TestData[]>([]);
  firestoreLoading = signal(false);
  firestoreError = signal<string | null>(null);
  dataCount = signal<number>(0);
  
  // Form data
  newMessage = signal('');
  newValue = signal(0);

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.dataSubscription?.unsubscribe();
  }

  // Load data from Firestore (real-time)
  loadData(): void {
    this.firestoreLoading.set(true);
    this.firestoreError.set(null);

    this.dataSubscription = this.firestoreService.getData().subscribe({
      next: (data) => {
        this.testData.set(data);
        this.dataCount.set(data.length);
        this.firestoreLoading.set(false);
      },
      error: (err: any) => {
        console.error('❌ Firestore Error:', err);
        this.firestoreError.set(`Failed to load data: ${err?.message || 'Unknown error'}`);
        this.firestoreLoading.set(false);
      }
    });
  }

  // Save data to Firestore
  async saveData(): Promise<void> {
    const message = this.newMessage().trim();
    const value = this.newValue();

    if (!message) {
      this.firestoreError.set('Please enter a message');
      return;
    }

    this.firestoreLoading.set(true);
    this.firestoreError.set(null);

    try {
      await this.firestoreService.saveData(message, value);
      // Reset form
      this.newMessage.set('');
      this.newValue.set(0);
      // Data will update automatically via real-time listener
    } catch (err: any) {
      console.error('❌ Save error:', err);
      this.firestoreError.set(`Failed to save: ${err?.message || 'Unknown error'}`);
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
}
