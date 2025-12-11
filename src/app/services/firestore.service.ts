import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface User {
  id?: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  createdAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  private firestore = inject(Firestore);
  private usersCollection = 'users';

  // Get all users (real-time)
  getUsers(): Observable<User[]> {
    const usersRef = collection(this.firestore, this.usersCollection);
    const q = query(usersRef, orderBy('createdAt', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<User[]>;
  }

  // Get single user
  getUser(id: string): Observable<User> {
    const userRef = doc(this.firestore, `${this.usersCollection}/${id}`);
    return docData(userRef, { idField: 'id' }) as Observable<User>;
  }

  // Add user
  async addUser(user: Omit<User, 'id' | 'createdAt'>): Promise<string> {
    const usersRef = collection(this.firestore, this.usersCollection);
    const docRef = await addDoc(usersRef, {
      ...user,
      createdAt: new Date()
    });
    return docRef.id;
  }

  // Update user
  async updateUser(id: string, data: Partial<User>): Promise<void> {
    const userRef = doc(this.firestore, `${this.usersCollection}/${id}`);
    await updateDoc(userRef, data);
  }

  // Delete user
  async deleteUser(id: string): Promise<void> {
    const userRef = doc(this.firestore, `${this.usersCollection}/${id}`);
    await deleteDoc(userRef);
  }

  // Seed sample data (for testing)
  async seedSampleData(): Promise<void> {
    const usersRef = collection(this.firestore, this.usersCollection);
    const snapshot = await getDocs(usersRef);
    
    // Only seed if collection is empty
    if (snapshot.empty) {
      const sampleUsers: Omit<User, 'id' | 'createdAt'>[] = [
        { name: 'Alice Johnson', email: 'alice@example.com', role: 'Developer', avatar: '👩‍💻' },
        { name: 'Bob Smith', email: 'bob@example.com', role: 'Designer', avatar: '👨‍🎨' },
        { name: 'Carol Williams', email: 'carol@example.com', role: 'Manager', avatar: '👩‍💼' },
        { name: 'David Brown', email: 'david@example.com', role: 'DevOps', avatar: '👨‍🔧' },
        { name: 'Eva Martinez', email: 'eva@example.com', role: 'Data Scientist', avatar: '👩‍🔬' },
      ];

      for (const user of sampleUsers) {
        await this.addUser(user);
      }
      console.log('✅ Sample data seeded to Firestore!');
    } else {
      console.log('ℹ️ Firestore already has data, skipping seed.');
    }
  }
}

