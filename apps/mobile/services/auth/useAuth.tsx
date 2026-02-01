// JWT-based authentication for React Native with Convex integration
import React, {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
  useMemo,
} from 'react';
import { useRouter, useRootNavigationState } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { toast } from 'sonner-native';
import Purchases from 'react-native-purchases';

import { createToken, verifyToken, isTokenExpired } from './token';
import { convex } from '@/lib/convex';
import { api } from '@/convex/_generated/api';

/**
 * Links RevenueCat account ID to the authenticated user
 * This should be called after sign-in/sign-up to sync subscription status
 */
async function linkRevenueCatAccount(userId: string): Promise<void> {
  try {
    // Get the RevenueCat app user ID
    const customerInfo = await Purchases.getCustomerInfo();
    const revenueCatId = customerInfo.originalAppUserId;

    if (revenueCatId) {
      await convex.mutation(api.users.linkRevenueCatAccount, {
        revenueCatId,
      });
      console.log('RevenueCat account linked:', revenueCatId);
    }
  } catch (error) {
    console.error('Failed to link RevenueCat account:', error);
    // Don't throw - linking failure shouldn't block auth
  }
}

type AuthState = {
  isAuthenticated: boolean;
  token?: string;
  userId?: string;
  email?: string;
};

type SignInProps = {
  email: string;
  password: string;
};

type SignUpProps = {
  email: string;
  password: string;
  name?: string;
};

type AuthContextState = AuthState & {
  isLoading: boolean;
};

type AuthContextActions = {
  signIn: (props: SignInProps) => Promise<void>;
  signUp: (props: SignUpProps) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthStateContext = createContext<AuthContextState | null>(null);
const AuthActionsContext = createContext<AuthContextActions | null>(null);

export function useAuth() {
  const state = useContext(AuthStateContext);
  const actions = useContext(AuthActionsContext);

  if (process.env.NODE_ENV !== 'production') {
    if (!state || !actions) {
      throw new Error('useAuth must be used within an AuthProvider');
    }
  }

  return { ...state, ...actions };
}

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    token: undefined,
    userId: undefined,
    email: undefined,
  });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const navigationState = useRootNavigationState();

  // Load auth state on mount
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync('auth_token');
        const storedUserId = await SecureStore.getItemAsync('user_id');
        const storedEmail = await SecureStore.getItemAsync('user_email');

        if (storedToken && !isTokenExpired(storedToken)) {
          setAuthState({
            isAuthenticated: true,
            token: storedToken,
            userId: storedUserId || undefined,
            email: storedEmail || undefined,
          });
        } else {
          // Clear expired tokens
          await SecureStore.deleteItemAsync('auth_token');
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthState();
  }, []);

  const actions = useMemo(
    () => ({
      signIn: async ({ email, password }: SignInProps) => {
        setIsLoading(true);
        try {
          // Call Convex authentication function
          const result = await convex.mutation(api.auth.signIn, {
            email,
            password,
          });

          if (!result) {
            throw new Error('Authentication failed');
          }

          // Create JWT token
          const token = await createToken({
            userId: result.userId,
            email: result.email,
          });

          // Store securely
          await SecureStore.setItemAsync('auth_token', token);
          await SecureStore.setItemAsync('user_id', result.userId);
          await SecureStore.setItemAsync('user_email', result.email);

          setAuthState({
            isAuthenticated: true,
            token,
            userId: result.userId,
            email: result.email,
          });

          // Link RevenueCat account after sign-in
          await linkRevenueCatAccount(result.userId);

          toast.success('Welcome back!');
          router.replace('/(tabs)');
        } catch (error) {
          console.error('Sign in error:', error);
          toast.error(error instanceof Error ? error.message : 'Invalid credentials');
        } finally {
          setIsLoading(false);
        }
      },

      signUp: async ({ email, password, name }: SignUpProps) => {
        setIsLoading(true);
        try {
          // Call Convex registration function
          const result = await convex.mutation(api.auth.signUp, {
            email,
            password,
            name,
          });

          if (!result) {
            throw new Error('Registration failed');
          }

          // Create JWT token
          const token = await createToken({
            userId: result.userId,
            email: result.email,
          });

          // Store securely
          await SecureStore.setItemAsync('auth_token', token);
          await SecureStore.setItemAsync('user_id', result.userId);
          await SecureStore.setItemAsync('user_email', result.email);

          setAuthState({
            isAuthenticated: true,
            token,
            userId: result.userId,
            email: result.email,
          });

          // Link RevenueCat account after sign-up
          await linkRevenueCatAccount(result.userId);

          toast.success('Account created successfully!');
          router.replace('/(tabs)');
        } catch (error) {
          console.error('Sign up error:', error);
          toast.error(error instanceof Error ? error.message : 'Failed to create account');
        } finally {
          setIsLoading(false);
        }
      },

      signOut: async () => {
        setIsLoading(true);
        try {
          await SecureStore.deleteItemAsync('auth_token');
          await SecureStore.deleteItemAsync('user_id');
          await SecureStore.deleteItemAsync('user_email');

          setAuthState({
            isAuthenticated: false,
            token: undefined,
            userId: undefined,
            email: undefined,
          });

          toast.success('Signed out successfully');
          router.replace('/(auth)');
        } catch (error) {
          console.error('Sign out error:', error);
        } finally {
          setIsLoading(false);
        }
      },
    }),
    [router]
  );

  const state = useMemo(
    () => ({
      ...authState,
      isLoading,
    }),
    [authState, isLoading]
  );

  return (
    <AuthStateContext.Provider value={state}>
      <AuthActionsContext.Provider value={actions}>
        {children}
      </AuthActionsContext.Provider>
    </AuthStateContext.Provider>
  );
};
