import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface TestData {
  id?: string;
  message: string;
  timestamp: Date;
  value: number;
}

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  private firestore = inject(Firestore);
  private collectionName = 'testData';

  // Save data to Firestore
  async saveData(message: string, value: number): Promise<string> {
    try {
      const testDataRef = collection(this.firestore, this.collectionName);
      const docRef = await addDoc(testDataRef, {
        message,
        value,
        timestamp: new Date()
      });
      console.log('✅ Data saved with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error saving data:', error);
      throw error;
    }
  }

  // Get all data from Firestore
  getData(): Observable<TestData[]> {
    try {
      const testDataRef = collection(this.firestore, this.collectionName);
      const q = query(testDataRef, orderBy('timestamp', 'desc'), limit(10));
      return collectionData(q, { idField: 'id' }) as Observable<TestData[]>;
    } catch (error) {
      console.error('❌ Error getting data:', error);
      throw error;
    }
  }

  // Get data count (for testing)
  async getDataCount(): Promise<number> {
    try {
      const testDataRef = collection(this.firestore, this.collectionName);
      const snapshot = await getDocs(testDataRef);
      return snapshot.size;
    } catch (error) {
      console.error('❌ Error getting count:', error);
      throw error;
    }
  }
}

