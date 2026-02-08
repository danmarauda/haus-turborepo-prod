import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, ScrollView, Platform } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';
import Colors from '@/constants/colors';
import BottomNavigation from './BottomNavigation';

const { width: screenWidth } = Dimensions.get('window');

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
  views: { key: string; title: string; component: React.ReactNode }[];
}

export default function DashboardLayout({ 
  children, 
  currentView, 
  onViewChange, 
  views 
}: DashboardLayoutProps) {
  const { theme } = useTheme();
  const colors = Colors[theme];
  const [activeViewIndex, setActiveViewIndex] = useState(0);
  
  const isMobile = screenWidth < 768;

  const changeView = (direction: 'left' | 'right') => {
    const currentIndex = views.findIndex(view => view.key === currentView);
    let newIndex = currentIndex;
    
    if (direction === 'left' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    } else if (direction === 'right' && currentIndex < views.length - 1) {
      newIndex = currentIndex + 1;
    }
    
    if (newIndex !== currentIndex) {
      onViewChange(views[newIndex].key);
      setActiveViewIndex(newIndex);
    }
  };

  const getGridColumns = () => {
    if (screenWidth < 768) return 1; // Mobile: 1 column
    if (screenWidth < 1024) return 2; // Tablet: 2 columns
    return 3; // Desktop: 3 columns
  };

  const renderContent = () => {
    const currentViewData = views.find(view => view.key === currentView);
    
    if (isMobile && currentViewData) {
      return (
        <View style={styles.mobileContainer}>
          <ScrollView 
            style={styles.scrollContainer}
            contentContainerStyle={[
              styles.contentContainer,
              { paddingBottom: 100 } // Space for bottom navigation
            ]}
            showsVerticalScrollIndicator={false}
          >
            {currentViewData.component}
          </ScrollView>
        </View>
      );
    }

    return (
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={[
          styles.contentContainer,
          { 
            paddingBottom: isMobile ? 100 : 20,
            paddingHorizontal: isMobile ? 16 : 24,
          }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View 
          style={[
            styles.gridContainer,
            { 
              flexDirection: getGridColumns() === 1 ? 'column' : 'row',
              flexWrap: getGridColumns() > 1 ? 'wrap' : 'nowrap',
            }
          ]}
        >
          {children}
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {renderContent()}
      
      {isMobile && (
        <BottomNavigation
          currentView={currentView}
          onViewChange={onViewChange}
          views={views}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mobileContainer: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    padding: screenWidth < 768 ? 16 : 24,
  },
  gridContainer: {
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
});