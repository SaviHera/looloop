import { onRequest } from "firebase-functions/v2/https";

/**
 * Hello World API endpoint
 * Access via: /api/hello
 */
export const api = onRequest((request, response) => {
  const name = request.query.name || "World";
  
  response.json({
    message: `Hello, ${name}!`,
    timestamp: new Date().toISOString(),
    method: request.method,
    path: request.path
  });
});

