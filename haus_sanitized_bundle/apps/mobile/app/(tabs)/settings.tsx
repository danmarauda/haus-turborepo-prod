import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import {
  Languages,
  Palette,
  User,
  LogOut,
  Info,
  ChevronRight,
  Moon,
  Sun,
  Smartphone,
} from 'lucide-react-native';
import { useAuth } from '@/services/auth';
import { useTheme } from '@/context/ThemeContext';
import { saveLanguage } from '@/config/i18n';

type ThemeOption = 'light' | 'dark' | 'system';
type LanguageOption = 'en' | 'es' | 'fr' | 'pt';

interface Language {
  code: LanguageOption;
  name: string;
  nativeName: string;
  flag: string;
}

const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
];

const THEMES: { value: ThemeOption; label: string; icon: React.ReactElement }[] = [
  { value: 'light', label: 'Light', icon: <Sun size={20} color="#888" /> },
  { value: 'dark', label: 'Dark', icon: <Moon size={20} color="#888" /> },
  {
    value: 'system',
    label: 'System',
    icon: <Smartphone size={20} color="#888" />,
  },
];

const APP_VERSION = '1.0.0';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { signOut, email, isAuthenticated } = useAuth();
  const { isDark, themeMode, setTheme } = useTheme();

  const currentLanguage = i18n.language as LanguageOption;

  const handleLanguageChange = useCallback(
    async (langCode: LanguageOption) => {
      try {
        await i18n.changeLanguage(langCode);
        await saveLanguage(langCode);
      } catch (error) {
        console.error('Failed to change language:', error);
        Alert.alert('Error', 'Failed to change language');
      }
    },
    [i18n]
  );

  const handleThemeChange = useCallback(
    (theme: ThemeOption) => {
      setTheme(theme);
    },
    [setTheme]
  );

  const handleSignOut = useCallback(() => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            signOut();
          },
        },
      ],
      { userInterfaceStyle: isDark ? 'dark' : 'light' }
    );
  }, [signOut, isDark]);

  const getCurrentLanguage = () => {
    return LANGUAGES.find((lang) => lang.code === currentLanguage) || LANGUAGES[0];
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Account Section */}
        {isAuthenticated && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.card}>
              <Pressable style={styles.settingItem}>
                <View style={styles.settingItemLeft}>
                  <View style={styles.iconContainer}>
                    <User size={20} color="#666" />
                  </View>
                  <View style={styles.settingItemText}>
                    <Text style={styles.settingItemLabel}>Email</Text>
                    <Text style={styles.settingItemValue} numberOfLines={1}>
                      {email ?? 'Loading...'}
                    </Text>
                  </View>
                </View>
              </Pressable>
            </View>
          </View>
        )}

        {/* Language Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Language</Text>
          <View style={styles.card}>
            {LANGUAGES.map((lang, index) => (
              <Pressable
                key={lang.code}
                style={({ pressed }) => [
                  styles.settingItem,
                  index < LANGUAGES.length - 1 && styles.settingItemBorder,
                  pressed && styles.settingItemPressed,
                ]}
                onPress={() => handleLanguageChange(lang.code)}
              >
                <View style={styles.settingItemLeft}>
                  <View style={styles.iconContainer}>
                    <Languages size={20} color="#666" />
                  </View>
                  <Text style={styles.flag}>{lang.flag}</Text>
                  <Text style={styles.languageName}>{lang.nativeName}</Text>
                </View>
                {currentLanguage === lang.code && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Theme Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.card}>
            {THEMES.map((theme, index) => (
              <Pressable
                key={theme.value}
                style={({ pressed }) => [
                  styles.settingItem,
                  index < THEMES.length - 1 && styles.settingItemBorder,
                  pressed && styles.settingItemPressed,
                ]}
                onPress={() => handleThemeChange(theme.value)}
              >
                <View style={styles.settingItemLeft}>
                  <View style={styles.iconContainer}>{theme.icon}</View>
                  <Text style={styles.settingItemLabel}>{theme.label}</Text>
                </View>
                {themeMode === theme.value && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            <Pressable style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <View style={styles.iconContainer}>
                  <Info size={20} color="#666" />
                </View>
                <View style={styles.settingItemText}>
                  <Text style={styles.settingItemLabel}>Version</Text>
                  <Text style={styles.settingItemValue}>{APP_VERSION}</Text>
                </View>
              </View>
            </Pressable>

            <View style={[styles.settingItemBorder, { marginLeft: 16 }]} />

            <Pressable
              style={({ pressed }) => [
                styles.settingItem,
                pressed && styles.settingItemPressed,
              ]}
              onPress={() => {
                // Navigate to privacy policy or open URL
              }}
            >
              <View style={styles.settingItemLeft}>
                <View style={styles.iconContainer}>
                  <Text style={styles.documentIcon}>📄</Text>
                </View>
                <Text style={styles.settingItemLabel}>Privacy Policy</Text>
              </View>
              <ChevronRight size={18} color="#666" />
            </Pressable>

            <View style={[styles.settingItemBorder, { marginLeft: 16 }]} />

            <Pressable
              style={({ pressed }) => [
                styles.settingItem,
                pressed && styles.settingItemPressed,
              ]}
              onPress={() => {
                // Navigate to terms of service or open URL
              }}
            >
              <View style={styles.settingItemLeft}>
                <View style={styles.iconContainer}>
                  <Text style={styles.documentIcon}>📋</Text>
                </View>
                <Text style={styles.settingItemLabel}>Terms of Service</Text>
              </View>
              <ChevronRight size={18} color="#666" />
            </Pressable>
          </View>
        </View>

        {/* Sign Out Section */}
        {isAuthenticated && (
          <View style={styles.section}>
            <Pressable
              style={({ pressed }) => [
                styles.signOutButton,
                pressed && styles.signOutButtonPressed,
              ]}
              onPress={handleSignOut}
            >
              <LogOut size={20} color="#ef4444" />
              <Text style={styles.signOutText}>Sign Out</Text>
            </Pressable>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>HAUS • AI-Native Property Intelligence</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'transparent',
  },
  settingItemPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  settingItemBorder: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingItemText: {
    flex: 1,
  },
  settingItemLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#e5e5e5',
  },
  settingItemValue: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  flag: {
    fontSize: 20,
    marginRight: 12,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#e5e5e5',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  documentIcon: {
    fontSize: 18,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 14,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    gap: 10,
  },
  signOutButtonPressed: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 8,
  },
  footerText: {
    fontSize: 13,
    color: '#444',
  },
});
