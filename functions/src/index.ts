import { onRequest } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin
initializeApp();
const db = getFirestore();

// Sample user data (fallback if Firestore is empty)
const sampleUsers = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", role: "Developer", avatar: "👩‍💻" },
  { id: 2, name: "Bob Smith", email: "bob@example.com", role: "Designer", avatar: "👨‍🎨" },
  { id: 3, name: "Carol Williams", email: "carol@example.com", role: "Manager", avatar: "👩‍💼" },
  { id: 4, name: "David Brown", email: "david@example.com", role: "DevOps", avatar: "👨‍🔧" },
  { id: 5, name: "Eva Martinez", email: "eva@example.com", role: "Data Scientist", avatar: "👩‍🔬" },
  { id: 6, name: "Frank Lee", email: "frank@example.com", role: "QA Engineer", avatar: "🧑‍💻" },
  { id: 7, name: "Grace Kim", email: "grace@example.com", role: "Product Owner", avatar: "👩‍🏫" },
  { id: 8, name: "Henry Chen", email: "henry@example.com", role: "Architect", avatar: "👨‍🏭" },
];

/**
 * API endpoint with Firestore integration
 * Access via: /api, /api/random-user, /api/users, /api/add-user
 */
export const api = onRequest(async (request, response) => {
  // Enable CORS
  response.set("Access-Control-Allow-Origin", "*");
  response.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.set("Access-Control-Allow-Headers", "Content-Type");

  if (request.method === "OPTIONS") {
    response.status(204).send("");
    return;
  }

  const path = request.path;

  try {
    // Get all users from Firestore
    if (path === "/users" || path === "/api/users") {
      const snapshot = await db.collection("users").orderBy("createdAt", "desc").get();
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      response.json({ success: true, users, count: users.length });
      return;
    }

    // Add a user to Firestore
    if ((path === "/add-user" || path === "/api/add-user") && request.method === "POST") {
      const { name, email, role, avatar } = request.body;
      
      if (!name || !email || !role) {
        response.status(400).json({ success: false, error: "Missing required fields" });
        return;
      }

      const docRef = await db.collection("users").add({
        name,
        email,
        role,
        avatar: avatar || "👤",
        createdAt: new Date()
      });
      
      response.json({ success: true, id: docRef.id, message: "User added successfully" });
      return;
    }

    // Random user from Firestore (or fallback to sample data)
    if (path === "/random-user" || path === "/api/random-user") {
      const snapshot = await db.collection("users").get();
      
      let randomUser;
      if (snapshot.empty) {
        // Fallback to sample data if Firestore is empty
        randomUser = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];
      } else {
        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        randomUser = users[Math.floor(Math.random() * users.length)];
      }
      
      response.json({
        success: true,
        user: randomUser,
        source: snapshot.empty ? "sample" : "firestore",
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Default hello endpoint
    const name = request.query.name || "World";
    response.json({
      message: `Hello, ${name}!`,
      timestamp: new Date().toISOString(),
      method: request.method,
      path: request.path,
      firestore: "connected"
    });
  } catch (error) {
    console.error("API Error:", error);
    response.status(500).json({ 
      success: false, 
      error: "Internal server error",
      message: String(error)
    });
  }
});

