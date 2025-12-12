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
import { map } from 'rxjs/operators';
import { Timestamp } from 'firebase/firestore';

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
      return collectionData(q, { idField: 'id' }).pipe(
        map((data: any[]) => 
          data.map(item => ({
            ...item,
            timestamp: this.convertTimestamp(item.timestamp)
          }))
        )
      ) as Observable<TestData[]>;
    } catch (error) {
      console.error('❌ Error getting data:', error);
      throw error;
    }
  }

  // Convert Firestore Timestamp to JavaScript Date
  private convertTimestamp(timestamp: any): Date {
    if (timestamp instanceof Date) {
      return timestamp;
    }
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }
    if (timestamp && timestamp.seconds) {
      return new Date(timestamp.seconds * 1000);
    }
    return new Date(timestamp || Date.now());
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

