// This file is a conceptual implementation of route protection as requested.
// In this Vite + Express architecture, protection is handled in server.ts for API routes
// and via ProtectedRoute components in the React frontend.

export const protectedRoutes = ['/vault', '/dashboard'];

export function isProtectedRoute(path: string) {
  return protectedRoutes.some(route => path.startsWith(route));
}
