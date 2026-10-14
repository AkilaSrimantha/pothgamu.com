// API Configuration for PothGamu
// On localhost: calls backend directly at http://localhost:5000/api
// On remote / ngrok / vercel: uses environment variable or relative /api
export const API_BASE = (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')
  ? (import.meta.env.VITE_API_BASE || '/api')
  : 'http://localhost:5000/api';

