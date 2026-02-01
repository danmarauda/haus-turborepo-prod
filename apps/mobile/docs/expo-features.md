# Expo Features - HAUS Mobile App

This document provides practical examples for using Expo features in the HAUS property intelligence app.

## Table of Contents

1. [expo-notifications](#expo-notifications) - Property alerts
2. [expo-image-picker](#expo-image-picker) - Property photos
3. [expo-haptics](#expo-haptics) - Touch feedback
4. [expo-blur](#expo-blur) - Modal overlays
5. [expo-font](#expo-font) - Custom typography
6. [expo-splash-screen](#expo-splash-screen) - Branded loading
7. [expo-dev-client](#expo-dev-client) - Development tools

---

## expo-notifications

**Purpose:** Request permission and schedule local notifications for property alerts, price drops, and inspection reminders.

### Request Permission

```typescript
import * as Notifications from 'expo-notifications';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Request permissions (call on app start or user action)
async function requestNotificationPermission() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    alert('Failed to get push token for push notification!');
    return false;
  }

  return true;
}
```

### Schedule Property Alert

```typescript
// Schedule notification for property inspection
async function scheduleInspectionReminder(
  propertyAddress: string,
  inspectionTime: Date
) {
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Property Inspection Reminder',
      body: `Inspection for ${propertyAddress} starts in 1 hour`,
      data: { propertyAddress },
      sound: 'default',
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: {
      seconds: 3600, // 1 hour before
      repeats: false,
    },
  });
}

// Schedule price drop alert
async function schedulePriceAlert(
  propertyId: string,
  newPrice: number
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Price Drop Alert! 📉',
      body: `Property ${propertyId} dropped to $${newPrice.toLocaleString()}`,
      data: { propertyId, newPrice },
      sound: 'default',
      categoryIdentifier: 'price-drop',
    },
    trigger: null, // Immediate notification
  });
}
```

### Cancel All Notifications

```typescript
async function clearAllAlerts() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
```

**When to use:**
- Property inspection reminders
- Price drop alerts
- New listing matches
- Application status updates

---

## expo-image-picker

**Purpose:** Pick photos from gallery or camera for property inspections, maintenance reports, or profile pictures.

### Pick Property Photo

```typescript
import * as ImagePicker from 'expo-image-picker';

async function pickPropertyPhoto() {
  // Request permission
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    alert('Sorry, we need camera roll permissions to make this work!');
    return null;
  }

  // Pick image
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });

  if (!result.canceled) {
    return result.assets[0].uri;
  }

  return null;
}

// Usage in Property Inspection Form
function InspectionPhotoUpload() {
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const handlePhotoPick = async () => {
    const uri = await pickPropertyPhoto();
    if (uri) {
      setPhotoUri(uri);
      // Upload to Convex/Supabase here
    }
  };

  return (
    <TouchableOpacity onPress={handlePhotoPick}>
      {photoUri ? (
        <Image source={{ uri: photoUri }} style={{ width: 200, height: 150 }} />
      ) : (
        <View style={styles.placeholder}>
          <Text>Tap to add inspection photo</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
```

### Take Photo with Camera

```typescript
async function takeInspectionPhoto() {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    alert('Camera permission is required!');
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });

  if (!result.canceled) {
    return result.assets[0].uri;
  }

  return null;
}
```

**When to use:**
- Property inspection photos
- Maintenance issue reporting
- Profile avatar upload
- Document uploads (contracts, leases)

---

## expo-haptics

**Purpose:** Provide tactile feedback for user interactions, improving app feel and accessibility.

### Haptic Feedback on Actions

```typescript
import * as Haptics from 'expo-haptics';

// Light feedback for button presses
function handleButtonPress() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  // Your button logic here
}

// Medium feedback for card selection
function handlePropertySelect() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  // Navigate to property details
}

// Heavy feedback for important actions
function handleBidSubmit() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  // Submit bid
}

// Success notification
function handleSaveToFavorites() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  // Add to favorites
}

// Error notification
function handleError() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  // Show error message
}
```

### Property Card Example

```typescript
function PropertyCard({ property }: { property: Property }) {
  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/property/${property.id}`);
  }, [property.id]);

  const handleFavorite = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    toggleFavorite(property.id);
  }, [property.id]);

  return (
    <TouchableOpacity onPress={handlePress}>
      <PropertyInfo property={property} />
      <TouchableOpacity onPress={handleFavorite}>
        <HeartIcon />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
```

**When to use:**
- Button presses (Light impact)
- Card selections (Medium impact)
- Form submissions (Heavy impact)
- Success/error states (Notification feedback)
- Tab bar navigation (Selection feedback)

---

## expo-blur

**Purpose:** Create iOS-style blur effects for modal overlays, sheets, and background elements.

### Modal Overlay with Blur

```typescript
import { BlurView } from 'expo-blur';

function PropertyDetailModal({ visible, onClose, property }) {
  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      {/* Blur overlay background */}
      <BlurView
        intensity={80}
        tint="dark"
        style={styles.blurContainer}
      >
        {/* Modal content */}
        <View style={styles.modalContent}>
          <TouchableOpacity onPress={onClose}>
            <Text>Close</Text>
          </TouchableOpacity>
          <PropertyDetails property={property} />
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
  },
});
```

### Navigation Header Blur

```typescript
function BlurredHeader() {
  const [scrollY] = useState(new Animated.Value(0));

  const blurIntensity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 80],
    extrapolate: 'clamp',
  });

  return (
    <>
      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        {/* Scrollable content */}
      </Animated.ScrollView>

      <BlurView intensity={blurIntensity} tint="light" style={styles.header}>
        <Text style={styles.headerTitle}>HAUS</Text>
      </BlurView>
    </>
  );
}
```

**When to use:**
- Modal backgrounds
- Bottom sheet overlays
- Navigation headers (iOS style)
- Tab bar backgrounds
- Settings panels

---

## expo-font

**Purpose:** Load and use custom fonts for brand consistency (Abel, Inter, JetBrains Mono).

### Load Custom Fonts

```typescript
import { useFonts } from 'expo-font';
import { SplashScreen } from 'expo-splash-screen';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

function AppLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Abel': require('../assets/fonts/Abel-Regular.ttf'),
    'Inter': require('../assets/fonts/Inter-Regular.ttf'),
    'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
    'JetBrainsMono': require('../assets/fonts/JetBrainsMono-Regular.ttf'),
  });

  useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        // Load fonts here
      } catch (e) {
        console.warn(e);
      } finally {
        SplashScreen.hideAsync();
      }
    }

    loadResourcesAndDataAsync();
  }, []);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return <Stack screenOptions={{ contentStyle: { fontFamily: 'Inter' } }} />;
}
```

### Use Custom Fonts in Components

```typescript
// Brand headings with Abel
function HausLogo() {
  return (
    <Text style={{ fontFamily: 'Abel', fontSize: 24, fontWeight: 'normal' }}>
      HAUS
    </Text>
  );
}

// Body text with Inter
function PropertyDescription({ text }: { text: string }) {
  return (
    <Text style={{ fontFamily: 'Inter', fontSize: 16, lineHeight: 24 }}>
      {text}
    </Text>
  );
}

// Data display with JetBrains Mono
function PropertyValue({ value }: { value: string }) {
  return (
    <Text style={{ fontFamily: 'JetBrainsMono', fontSize: 14, color: '#666' }}>
      {value}
    </Text>
  );
}

// Bold text
function SectionHeader({ title }: { title: string }) {
  return (
    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 18, marginBottom: 8 }}>
      {title}
    </Text>
  );
}
```

**When to use:**
- Brand logo (Abel)
- Body text and UI elements (Inter)
- Data displays and numbers (JetBrains Mono)
- Any custom typography needs

**Note:** Fonts should be placed in `assets/fonts/` directory.

---

## expo-splash-screen

**Purpose:** Control the splash screen appearance and hide timing for smooth app loading.

### Custom Splash Screen Setup

```typescript
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

// Prevent auto-hide (in app/_layout.tsx)
SplashScreen.preventAutoHideAsync();

function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Load fonts
        await Font.loadAsync({
          'Abel': require('../assets/fonts/Abel-Regular.ttf'),
          'Inter': require('../assets/fonts/Inter-Regular.ttf'),
        });

        // Load other resources
        await loadAppResources();

        // Artificial delay for smooth transition (optional)
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (e) {
        console.warn('Error loading app:', e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
```

### Splash Screen Configuration

Configure in `app.json`:

```json
{
  "expo": {
    "splash": {
      "image": "./assets/images/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#0a0a0a"
    },
    "android": {
      "splash": {
        "image": "./assets/images/splash.png",
        "resizeMode": "contain",
        "backgroundColor": "#0a0a0a"
      }
    },
    "ios": {
      "splash": {
        "image": "./assets/images/splash.png",
        "resizeMode": "contain",
        "backgroundColor": "#0a0a0a"
      }
    }
  }
}
```

**When to use:**
- Initial app loading
- Font loading delays
- Resource preparation
- Authentication checks before showing app

**Best practice:** Keep splash screen visible until all resources (fonts, images, auth state) are loaded.

---

## expo-dev-client

**Purpose:** Development build with native modules and custom native code. Useful for debugging and testing native features.

### Why Use expo-dev-client?

1. **Native Module Development:** Build and test custom native modules
2. **Faster Refresh:** Instant refresh with native code changes
3. **Full Debugging:** Access to native debugging tools (Flipper, React Native Debugger)
4. **Production-like Environment:** Test in an environment closer to production
5. **Custom Native Code:** Modify iOS/Android native code when needed

### Create Development Build

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS (if not already configured)
eas build:configure

# Create development build for iOS
eas build --profile development --platform ios

# Create development build for Android
eas build --profile development --platform android

# Run on device
eas build --profile development --platform ios --local
```

### Configure in eas.json

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      },
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

### Run Development Build

```bash
# Start development server
bun start

# Scan QR code in Expo Go app (for Expo Go)
# Or open development build app and scan QR
```

### When to Use Development Build vs Expo Go

| Feature | Expo Go | Dev Build |
|---------|---------|-----------|
| **Development speed** | Fast (no build) | Slower (one-time build) |
| **Native modules** | Limited | Full support |
| **Custom native code** | No | Yes |
| **App config changes** | No | Yes |
| **Production testing** | Not accurate | Accurate |

**Use expo-dev-client when:**
- Testing custom native modules (expo-notifications with custom sounds)
- Debugging native-specific issues
- Need production-like testing environment
- Modifying app.json configuration frequently
- Testing on physical devices with actual permissions

**Use Expo Go when:**
- Quick prototyping
- Testing pure JS/TS features
- No custom native modules needed

---

## Summary

| Feature | Use Case | Complexity |
|---------|----------|------------|
| **expo-notifications** | Property alerts, reminders | Medium |
| **expo-image-picker** | Photo uploads | Low |
| **expo-haptics** | Touch feedback | Low |
| **expo-blur** | Modal overlays | Low |
| **expo-font** | Custom typography | Medium |
| **expo-splash-screen** | App loading | Low |
| **expo-dev-client** | Development tools | High |

## Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Notifications Guide](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Expo Image Picker Guide](https://docs.expo.dev/versions/latest/sdk/imagepicker/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
