import { onRequest } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";

// Initialize Firebase Admin
initializeApp();

// Sample user data
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
 * API endpoint
 * Access via: /api, /api/random-user
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
    // Random user from sample data
    if (path === "/random-user" || path === "/api/random-user") {
      const randomUser = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];
      
      response.json({
        success: true,
        user: randomUser,
        source: "sample",
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
      path: request.path
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

