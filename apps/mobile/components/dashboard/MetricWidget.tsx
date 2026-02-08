import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react-native';
import { useTheme } from '@/providers/ThemeProvider';
import Colors from '@/constants/colors';

const { width: screenWidth } = Dimensions.get('window');

interface MetricWidgetProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  subtitle?: string;
  icon?: React.ReactNode;
}

export default function MetricWidget({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  subtitle,
  icon 
}: MetricWidgetProps) {
  const { theme } = useTheme();
  const colors = Colors[theme];

  const getTrendIcon = () => {
    const iconSize = screenWidth < 768 ? 16 : 20;
    switch (changeType) {
      case 'increase':
        return <TrendingUp size={iconSize} color={colors.success} />;
      case 'decrease':
        return <TrendingDown size={iconSize} color={colors.error} />;
      default:
        return <Minus size={iconSize} color={colors.text} />;
    }
  };

  const getTrendColor = () => {
    switch (changeType) {
      case 'increase':
        return colors.success;
      case 'decrease':
        return colors.error;
      default:
        return colors.text;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
      </View>
      
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
      
      {(change !== undefined || subtitle) && (
        <View style={styles.footer}>
          {change !== undefined && (
            <View style={styles.changeContainer}>
              {getTrendIcon()}
              <Text style={[styles.change, { color: getTrendColor() }]}>
                {Math.abs(change)}%
              </Text>
            </View>
          )}
          {subtitle && (
            <Text style={[styles.subtitle, { color: colors.text }]}>{subtitle}</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: screenWidth < 768 ? 12 : 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    minHeight: screenWidth < 768 ? 100 : 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: screenWidth < 768 ? 12 : 14,
    fontWeight: '500' as const,
    flex: 1,
  },
  iconContainer: {
    marginLeft: 8,
  },
  value: {
    fontSize: screenWidth < 768 ? 20 : 24,
    fontWeight: 'bold' as const,
    marginBottom: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  change: {
    fontSize: screenWidth < 768 ? 11 : 12,
    fontWeight: '600' as const,
    marginLeft: 4,
  },
  subtitle: {
    fontSize: screenWidth < 768 ? 10 : 11,
    opacity: 0.7,
  },
});