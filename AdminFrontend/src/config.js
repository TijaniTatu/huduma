// Central API base URL for the Huduma admin server.
// Override per-environment with a VITE_API_URL entry in a .env file.
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
