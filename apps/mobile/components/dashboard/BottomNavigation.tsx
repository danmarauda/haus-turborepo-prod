import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { 
  BarChart3, 
  Activity, 
  Map, 
  Calendar, 
  Settings,
  Home
} from 'lucide-react-native';
import { useTheme } from '@/providers/ThemeProvider';
import Colors from '@/constants/colors';


interface BottomNavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
  views: { key: string; title: string }[];
}

export default function BottomNavigation({ 
  currentView, 
  onViewChange, 
  views 
}: BottomNavigationProps) {
  const { theme } = useTheme();
  const colors = Colors[theme];

  const getIcon = (viewKey: string, isActive: boolean) => {
    const iconSize = 22;
    const iconColor = isActive ? colors.primary : colors.tabIconDefault;
    
    switch (viewKey) {
      case 'dashboard':
        return <Home size={iconSize} color={iconColor} />;
      case 'charts':
        return <BarChart3 size={iconSize} color={iconColor} />;
      case 'realtime':
        return <Activity size={iconSize} color={iconColor} />;
      case 'map':
        return <Map size={iconSize} color={iconColor} />;
      case 'schedule':
        return <Calendar size={iconSize} color={iconColor} />;
      case 'settings':
        return <Settings size={iconSize} color={iconColor} />;
      default:
        return <Home size={iconSize} color={iconColor} />;
    }
  };

  return (
    <View style={styles.container} testID="dashboard-bottom-nav">
      <View
        style={[
          styles.navContainer,
          {
            backgroundColor:
              Platform.OS === 'web' ? `${colors.card}F2` : colors.card,
            shadowColor: '#000',
          },
        ]}
      >
        {views.map((view) => {
          const isActive = currentView === view.key;

          return (
            <TouchableOpacity
              key={view.key}
              style={[
                styles.navItem,
                isActive && { backgroundColor: `${colors.primary}20` }
              ]}
              onPress={() => onViewChange(view.key)}
              activeOpacity={0.8}
              testID={`dashboard-bottom-nav-item-${view.key}`}
            >
              {getIcon(view.key, isActive)}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 20,
  },
  navContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 28,
    borderWidth: 0,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 14,
    height: 40,
    width: 40,
  },
});