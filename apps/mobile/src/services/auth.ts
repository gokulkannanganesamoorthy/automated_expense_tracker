import { signInWithCredential, OAuthProvider, signOut, User, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';

// The actual Google/Apple login flows in React Native Expo require specific libraries:
// - @react-native-google-signin/google-signin (or expo-auth-session)
// - expo-apple-authentication
// Here we define the wrapper functions that our Zustand store can use.

export const authService = {
  /**
   * Signs in a user using an ID token from a provider (Google/Apple)
   */
  async signInWithIdToken(providerId: string, idToken: string, rawNonce?: string): Promise<User> {
    let credential;
    
    if (providerId === 'apple.com') {
      const provider = new OAuthProvider('apple.com');
      credential = provider.credential({
        idToken,
        rawNonce
      });
    } else if (providerId === 'google.com') {
      const provider = new OAuthProvider('google.com'); // Or GoogleAuthProvider.credential(idToken)
      credential = provider.credential({ idToken });
    } else {
      throw new Error(`Unsupported provider: ${providerId}`);
    }

    const result = await signInWithCredential(auth, credential);
    return result.user;
  },

  async signUpWithEmail(email: string, password: string): Promise<User> {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  },

  async signInWithEmail(email: string, password: string): Promise<User> {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  },

  /**
   * Signs out the current user
   */
  async signOutUser(): Promise<void> {
    await signOut(auth);
  },

  /**
   * Returns current user
   */
  getCurrentUser(): User | null {
    return auth.currentUser;
  }
};
