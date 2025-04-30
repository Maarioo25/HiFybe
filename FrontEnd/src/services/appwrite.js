import { Client, Account } from 'appwrite';

const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT);

export const account = new Account(client);

export const authService = {
  loginWithGoogle: () =>
    account.createOAuth2Session(
      'google',
      'http://localhost:5137',
      'http://localhost:5137/auth'
    ),
  login: async (email, password) => {
    // Redirigir el login manual a userService del api.js
    const { userService } = await import('./api');
    return userService.login(email, password);
  },
  getCurrentUser: () =>
    account.get().catch(() => null),
};
