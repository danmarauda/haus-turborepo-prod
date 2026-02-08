import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, Pressable, Alert, ScrollView, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
  FadeInDown,
  FadeOutDown,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { X, Mic, Bell, CheckCircle2, ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { prefs } from '@/lib/storage';

const ONBOARDING_COMPLETE_KEY = 'onboarding_complete';

// Animation configuration
const ANIMATION_DURATION = 300;
const easing = Easing.inOut(Easing.ease);

type OnboardingStep = 1 | 2 | 3 | 4 | 5;

interface StepConfig {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const stepConfigs: Record<OnboardingStep, StepConfig> = {
  1: {
    title: 'Welcome to HAUS',
    description: 'Your AI-powered property intelligence platform for Australian real estate. Find your dream home with voice search and smart recommendations.',
    icon: null,
  },
  2: {
    title: 'Voice Search',
    description: 'Search properties naturally. Just say "Show me 3 bedroom houses in Bondi under $2 million" and let AI do the work.',
    icon: null,
  },
  3: {
    title: 'Property Alerts',
    description: 'Get instant notifications when properties matching your criteria hit the market. Never miss your dream home again.',
    icon: null,
  },
  4: {
    title: 'Enable Notifications',
    description: 'Stay updated with price changes, new listings, and market insights tailored to your preferences.',
    icon: null,
  },
  5: {
    title: 'All Set!',
    description: 'You\'re ready to find your perfect property. Let\'s get started!',
    icon: null,
  },
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function OnboardingScreen() {
  const { isDark, themeVars } = useTheme();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  // Animation values
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  // Check if onboarding is already completed
  useEffect(() => {
    const checkOnboardingStatus = () => {
      const isComplete = prefs.getBoolean(ONBOARDING_COMPLETE_KEY, false);
      if (isComplete) {
        router.replace('/(tabs)');
      }
    };
    checkOnboardingStatus();
  }, []);

  // Animate step changes
  const animateStepChange = useCallback((callback: () => void) => {
    opacity.value = withSequence(
      withTiming(0, { duration: ANIMATION_DURATION, easing }),
      withTiming(1, { duration: ANIMATION_DURATION, easing })
    );
    translateY.value = withSequence(
      withTiming(-20, { duration: ANIMATION_DURATION, easing }),
      withTiming(0, { duration: ANIMATION_DURATION, easing })
    );
    scale.value = withSequence(
      withTiming(0.95, { duration: ANIMATION_DURATION, easing }),
      withTiming(1, { duration: ANIMATION_DURATION, easing })
    );
    setTimeout(callback, ANIMATION_DURATION);
  }, [opacity, translateY, scale]);

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  // Navigation handlers
  const handleNext = () => {
    if (currentStep < 5) {
      animateStepChange(() => setCurrentStep((prev) => (prev + 1) as OnboardingStep));
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      animateStepChange(() => setCurrentStep((prev) => (prev - 1) as OnboardingStep));
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const requestNotificationPermission = async (): Promise<boolean> => {
    try {
      // This would use expo-notifications in production
      // For now, simulate the permission request
      await new Promise(resolve => setTimeout(resolve, 500));
      return true;
    } catch {
      return false;
    }
  };

  const handleEnableNotifications = async () => {
    setIsCompleting(true);
    try {
      const granted = await requestNotificationPermission();
      if (granted) {
        setNotificationsEnabled(true);
        animateStepChange(() => setCurrentStep(5));
      } else {
        Alert.alert(
          'Permission Denied',
          'You can enable notifications later in Settings.',
          [
            { text: 'OK', onPress: () => animateStepChange(() => setCurrentStep(5)) },
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      Alert.alert(
        'Error',
        'Failed to request notification permission. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsCompleting(false);
    }
  };

  const handleDisableNotifications = () => {
    setNotificationsEnabled(false);
    animateStepChange(() => setCurrentStep(5));
  };

  const completeOnboarding = () => {
    prefs.set(ONBOARDING_COMPLETE_KEY, true);
    router.replace('/(tabs)');
  };

  const renderStepContent = () => {
    const config = stepConfigs[currentStep];

    switch (currentStep) {
      case 1:
        return (
          <Animated.View
            entering={FadeInDown.delay(100).springify()}
            style={styles.stepContent}
          >
            <View style={styles.iconContainer}>
              <Animated.View
                entering={FadeInDown.springify()}
                style={[styles.welcomeIcon, { backgroundColor: isDark ? 'rgba(255,107,53,0.2)' : 'rgba(255,107,53,0.1)' }]}
              >
                <Text style={[styles.emoji, { fontSize: 60 }]}>🏠</Text>
              </Animated.View>
            </View>

            <Animated.Text
              entering={FadeInDown.delay(200).springify()}
              style={[styles.title, { color: isDark ? '#fff' : '#000' }]}
            >
              {config.title}
            </Animated.Text>

            <Animated.Text
              entering={FadeInDown.delay(300).springify()}
              style={[styles.description, { color: isDark ? '#9CA3AF' : '#6B7280' }]}
            >
              {config.description}
            </Animated.Text>

            <Animated.View
              entering={FadeInDown.delay(400).springify()}
              style={styles.featureList}
            >
              {[
                'AI-powered property search',
                'Voice-activated navigation',
                'Real-time market insights',
                'Personalized recommendations',
              ].map((feature, index) => (
                <Animated.View
                  key={index}
                  entering={FadeInDown.delay(500 + index * 100).springify()}
                  style={styles.featureItem}
                >
                  <CheckCircle2 size={20} color="#FF6B35" />
                  <Text style={[styles.featureText, { color: isDark ? '#E5E7EB' : '#374151' }]}>
                    {feature}
                  </Text>
                </Animated.View>
              ))}
            </Animated.View>
          </Animated.View>
        );

      case 2:
        return (
          <Animated.View
            entering={FadeInDown.springify()}
            style={styles.stepContent}
          >
            <View style={styles.iconContainer}>
              <Animated.View
                entering={FadeInDown.springify()}
                style={[styles.voiceIcon, { backgroundColor: isDark ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.1)' }]}
              >
                <Mic size={60} color="#3B82F6" strokeWidth={2} />
              </Animated.View>
            </View>

            <Animated.Text
              entering={FadeInDown.delay(100).springify()}
              style={[styles.title, { color: isDark ? '#fff' : '#000' }]}
            >
              {config.title}
            </Animated.Text>

            <Animated.Text
              entering={FadeInDown.delay(200).springify()}
              style={[styles.description, { color: isDark ? '#9CA3AF' : '#6B7280' }]}
            >
              {config.description}
            </Animated.Text>

            <Animated.View
              entering={FadeInDown.delay(300).springify()}
              style={styles.demoBox}
            >
              <View style={[styles.voiceDemo, { backgroundColor: isDark ? '#1F2937' : '#F3F4F6' }]}>
                <Mic size={24} color="#9CA3AF" />
                <Text style={[styles.demoText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                  "Show me 3 bedroom houses in Bondi..."
                </Text>
              </View>

              <View style={[styles.resultPreview, { backgroundColor: isDark ? '#1F2937' : '#F9FAFB' }]}>
                <View style={styles.resultLine} />
                <View style={[styles.resultLine, { width: '70%' }]} />
                <View style={[styles.resultLine, { width: '40%' }]} />
              </View>
            </Animated.View>
          </Animated.View>
        );

      case 3:
        return (
          <Animated.View
            entering={FadeInDown.springify()}
            style={styles.stepContent}
          >
            <View style={styles.iconContainer}>
              <Animated.View
                entering={FadeInDown.springify()}
                style={[styles.alertIcon, { backgroundColor: isDark ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.1)' }]}
              >
                <Bell size={60} color="#10B981" strokeWidth={2} />
              </Animated.View>
            </View>

            <Animated.Text
              entering={FadeInDown.delay(100).springify()}
              style={[styles.title, { color: isDark ? '#fff' : '#000' }]}
            >
              {config.title}
            </Animated.Text>

            <Animated.Text
              entering={FadeInDown.delay(200).springify()}
              style={[styles.description, { color: isDark ? '#9CA3AF' : '#6B7280' }]}
            >
              {config.description}
            </Animated.Text>

            <Animated.View
              entering={FadeInDown.delay(300).springify()}
              style={styles.alertList}
            >
              {[
                { icon: '💰', title: 'Price drops', desc: 'Get notified when prices change' },
                { icon: '🆕', title: 'New listings', desc: 'Be first to see new properties' },
                { icon: '📊', title: 'Market updates', desc: 'Weekly market insights' },
              ].map((alert, index) => (
                <Animated.View
                  key={index}
                  entering={FadeInDown.delay(400 + index * 100).springify()}
                  style={[styles.alertItem, { backgroundColor: isDark ? '#1F2937' : '#F9FAFB' }]}
                >
                  <Text style={styles.alertEmoji}>{alert.icon}</Text>
                  <View style={styles.alertContent}>
                    <Text style={[styles.alertTitle, { color: isDark ? '#fff' : '#000' }]}>
                      {alert.title}
                    </Text>
                    <Text style={[styles.alertDesc, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                      {alert.desc}
                    </Text>
                  </View>
                </Animated.View>
              ))}
            </Animated.View>
          </Animated.View>
        );

      case 4:
        return (
          <Animated.View
            entering={FadeInDown.springify()}
            style={styles.stepContent}
          >
            <View style={styles.iconContainer}>
              <Animated.View
                entering={FadeInDown.springify()}
                style={[styles.permissionIcon, { backgroundColor: isDark ? 'rgba(245,158,11,0.2)' : 'rgba(245,158,11,0.1)' }]}
              >
                <Bell size={60} color="#F59E0B" strokeWidth={2} />
              </Animated.View>
            </View>

            <Animated.Text
              entering={FadeInDown.delay(100).springify()}
              style={[styles.title, { color: isDark ? '#fff' : '#000' }]}
            >
              {config.title}
            </Animated.Text>

            <Animated.Text
              entering={FadeInDown.delay(200).springify()}
              style={[styles.description, { color: isDark ? '#9CA3AF' : '#6B7280' }]}
            >
              {config.description}
            </Animated.Text>

            <Animated.View
              entering={FadeInDown.delay(300).springify()}
              style={styles.permissionContent}
            >
              <Pressable
                onPress={handleEnableNotifications}
                style={[styles.permissionOption, { backgroundColor: isDark ? '#1F2937' : '#F9FAFB' }]}
              >
                <View style={styles.permissionIconLeft}>
                  <Bell size={24} color="#10B981" />
                </View>
                <View style={styles.permissionText}>
                  <Text style={[styles.permissionTitle, { color: isDark ? '#fff' : '#000' }]}>
                    Enable Notifications
                  </Text>
                  <Text style={[styles.permissionDesc, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                    Get instant property alerts
                  </Text>
                </View>
                <ChevronRight size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
              </Pressable>

              <Pressable
                onPress={handleDisableNotifications}
                style={[styles.permissionOption, { backgroundColor: isDark ? '#1F2937' : '#F9FAFB' }]}
              >
                <View style={styles.permissionIconLeft}>
                  <X size={24} color="#9CA3AF" />
                </View>
                <View style={styles.permissionText}>
                  <Text style={[styles.permissionTitle, { color: isDark ? '#fff' : '#000' }]}>
                    Skip for Now
                  </Text>
                  <Text style={[styles.permissionDesc, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                    Enable later in Settings
                  </Text>
                </View>
                <ChevronRight size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
              </Pressable>
            </Animated.View>
          </Animated.View>
        );

      case 5:
        return (
          <Animated.View
            entering={FadeInDown.springify()}
            style={styles.stepContent}
          >
            <View style={styles.iconContainer}>
              <Animated.View
                entering={FadeInDown.springify()}
                style={styles.completeIcon}
              >
                <CheckCircle2 size={80} color="#10B981" strokeWidth={3} />
              </Animated.View>
            </View>

            <Animated.Text
              entering={FadeInDown.delay(100).springify()}
              style={[styles.title, { color: isDark ? '#fff' : '#000' }]}
            >
              {config.title}
            </Animated.Text>

            <Animated.Text
              entering={FadeInDown.delay(200).springify()}
              style={[styles.description, { color: isDark ? '#9CA3AF' : '#6B7280' }]}
            >
              {config.description}
            </Animated.Text>

            <Animated.View
              entering={FadeInDown.delay(300).springify()}
              style={styles.readyList}
            >
              {[
                '✨ Smart voice search activated',
                notificationsEnabled ? '🔔 Notifications enabled' : '🔕 Notifications disabled',
                '🎯 Personalized experience ready',
              ].map((item, index) => (
                <Animated.Text
                  key={index}
                  entering={FadeInDown.delay(400 + index * 100).springify()}
                  style={[styles.readyItem, { color: isDark ? '#E5E7EB' : '#374151' }]}
                >
                  {item}
                </Animated.Text>
              ))}
            </Animated.View>
          </Animated.View>
        );

      default:
        return null;
    }
  };

  const renderNavigationButtons = () => {
    if (currentStep === 4) {
      return null; // Step 4 has custom buttons in content
    }

    const isLastStep = currentStep === 5;

    return (
      <Animated.View style={[styles.navigation, { borderTopColor: isDark ? '#374151' : '#E5E7EB' }, buttonAnimatedStyle]}>
        {/* Progress dots */}
        <View style={styles.progressContainer}>
          {[1, 2, 3, 4, 5].map((step) => (
            <View
              key={step}
              style={[
                styles.progressDot,
                currentStep === step && styles.progressDotActive,
                currentStep > step && styles.progressDotComplete,
                {
                  backgroundColor: currentStep >= step
                    ? '#FF6B35'
                    : isDark ? '#374151' : '#E5E7EB',
                },
              ]}
            />
          ))}
        </View>

        <View style={styles.buttonContainer}>
          {currentStep > 1 && (
            <Pressable
              onPress={handleBack}
              style={[styles.button, styles.backButton, { backgroundColor: isDark ? '#1F2937' : '#F3F4F6' }]}
            >
              <Text style={[styles.backButtonText, { color: isDark ? '#E5E7EB' : '#374151' }]}>
                Back
              </Text>
            </Pressable>
          )}

          {!isLastStep ? (
            <>
              <Pressable
                onPress={handleSkip}
                style={styles.skipButton}
              >
                <Text style={[styles.skipButtonText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                  Skip
                </Text>
              </Pressable>

              <Pressable
                onPress={handleNext}
                style={[styles.button, styles.nextButton, { backgroundColor: '#FF6B35' }]}
              >
                <Text style={styles.nextButtonText}>Next</Text>
                <ChevronRight size={20} color="#fff" />
              </Pressable>
            </>
          ) : (
            <Pressable
              onPress={completeOnboarding}
              style={[styles.button, styles.completeButton, { backgroundColor: '#FF6B35' }]}
            >
              <Text style={styles.completeButtonText}>Get Started</Text>
              <ChevronRight size={20} color="#fff" />
            </Pressable>
          )}
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      {/* Skip button - always visible except on last step */}
      {currentStep < 5 && currentStep !== 4 && (
        <Pressable onPress={handleSkip} style={styles.skipTopButton}>
          <X size={24} color={isDark ? '#9CA3AF' : '#6B7280'} />
        </Pressable>
      )}

      {/* Main content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={contentAnimatedStyle}>
          {renderStepContent()}
        </Animated.View>
      </ScrollView>

      {/* Navigation */}
      {renderNavigationButtons()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipTopButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  stepContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400,
  },
  iconContainer: {
    marginBottom: 32,
  },
  welcomeIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeIcon: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  featureList: {
    width: '100%',
    gap: 16,
    marginTop: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    fontWeight: '500',
  },
  demoBox: {
    width: '100%',
    gap: 16,
    marginTop: 24,
  },
  voiceDemo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
  },
  demoText: {
    fontSize: 14,
    fontStyle: 'italic',
    flex: 1,
  },
  resultPreview: {
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  resultLine: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    width: '100%',
  },
  alertList: {
    width: '100%',
    gap: 12,
    marginTop: 24,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: 12,
  },
  alertEmoji: {
    fontSize: 32,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  alertDesc: {
    fontSize: 14,
  },
  permissionContent: {
    width: '100%',
    gap: 12,
    marginTop: 24,
  },
  permissionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: 12,
  },
  permissionIconLeft: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionText: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  permissionDesc: {
    fontSize: 14,
  },
  readyList: {
    width: '100%',
    gap: 12,
    marginTop: 24,
  },
  readyItem: {
    fontSize: 16,
    textAlign: 'center',
  },
  navigation: {
    borderTopWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  progressDotActive: {
    width: 24,
  },
  progressDotComplete: {},
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  backButton: {
    flex: 1,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 2,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  completeButton: {
    flex: 1,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  skipButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
