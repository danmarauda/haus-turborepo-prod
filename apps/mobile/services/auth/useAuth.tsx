// Convex Auth integration for React Native with Google OAuth
import React, {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useState,
  useMemo,
} from 'react';
import { useRouter } from 'expo-router';
import { toast } from 'sonner-native';
import Purchases from 'react-native-purchases';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { Platform } from 'react-native';

import { useConvexAuth, useMutation, useQuery } from 'convex/react';
import { useAuthActions } from '@convex-dev/auth/react';
import { api } from '@v1/backend/convex/_generated/api';

// Complete any pending WebBrowser sessions
WebBrowser.maybeCompleteAuthSession();

type AuthState = {
  isAuthenticated: boolean;
  isLoading: boolean;
};

type AuthContextActions = {
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

type AuthContextValue = AuthState & AuthContextActions & {
  user: typeof api.users.getUser._returnType | undefined | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (process.env.NODE_ENV !== 'production') {
    if (!context) {
      throw new Error('useAuth must be used within an AuthProvider');
    }
  }
  
  return context!;
}

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Convex Auth hooks
  const { isLoading: isConvexLoading, isAuthenticated } = useConvexAuth();
  const { signIn, signOut } = useAuthActions();
  
  // Convex mutations
  const linkRevenueCatMutation = useMutation(api.users.linkRevenueCatAccount);
  
  // Get user data when authenticated
  const user = useQuery(
    api.users.getUser,
    isAuthenticated ? {} : 'skip'
  );

  // Create redirect URI for OAuth
  const redirectTo = useMemo(() => makeRedirectUri({
    scheme: 'haus',
    path: 'auth/callback',
  }), []);

  // Link RevenueCat after successful authentication
  const linkRevenueCat = async () => {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const revenueCatId = customerInfo.originalAppUserId;

      if (revenueCatId) {
        await linkRevenueCatMutation({ revenueCatId });
        console.log('RevenueCat account linked:', revenueCatId);
      }
    } catch (error) {
      console.error('Failed to link RevenueCat account:', error);
      // Don't throw - linking failure shouldn't block auth
    }
  };

  // Handle authentication state changes
  useEffect(() => {
    if (!isConvexLoading) {
      setIsInitialized(true);
      
      // If user just became authenticated, link RevenueCat
      if (isAuthenticated) {
        linkRevenueCat();
      }
    }
  }, [isConvexLoading, isAuthenticated]);

  const actions = useMemo(
    () => ({
      signInWithGoogle: async () => {
        try {
          // For web, the OAuth flow happens in the same window
          if (Platform.OS === 'web') {
            await signIn('google', { redirectTo });
            return;
          }

          // For native platforms, we use the expo-web-browser flow
          // Step 1: Get the OAuth URL from Convex Auth
          const { redirect } = await signIn('google', { redirectTo });
          
          if (!redirect) {
            throw new Error('Failed to get OAuth redirect URL');
          }

          // Step 2: Open the OAuth URL in a web browser
          const result = await WebBrowser.openAuthSessionAsync(
            redirect.toString(),
            redirectTo
          );

          // Step 3: Handle the result
          if (result.type === 'success') {
            const { url } = result;
            const code = new URL(url).searchParams.get('code');
            
            if (code) {
              // Complete the OAuth flow with the code
              await signIn('google', { code, redirectTo });
              toast.success('Welcome!');
              router.replace('/(tabs)/' as any);
            } else {
              throw new Error('No authorization code received');
            }
          } else if (result.type === 'cancel') {
            console.log('User cancelled OAuth flow');
          } else {
            console.log('OAuth flow result:', result);
          }
        } catch (error) {
          console.error('Sign in error:', error);
          toast.error(error instanceof Error ? error.message : 'Sign in failed');
          throw error;
        }
      },

      signOut: async () => {
        try {
          // Use Convex Auth signOut function
          await signOut();
          
          toast.success('Signed out successfully');
          router.replace('/(auth)/login' as any);
        } catch (error) {
          console.error('Sign out error:', error);
          toast.error('Failed to sign out');
        }
      },
    }),
    [router, signIn, signOut, redirectTo]
  );

  const value = useMemo(
    () => ({
      isAuthenticated,
      isLoading: isConvexLoading || !isInitialized,
      user,
      ...actions,
    }),
    [isAuthenticated, isConvexLoading, isInitialized, user, actions]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
