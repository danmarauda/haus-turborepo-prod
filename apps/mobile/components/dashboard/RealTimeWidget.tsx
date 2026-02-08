import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Activity, Wifi, WifiOff } from 'lucide-react-native';
import { useTheme } from '@/providers/ThemeProvider';
import Colors from '@/constants/colors';

const { width: screenWidth } = Dimensions.get('window');

interface RealTimeData {
  label: string;
  value: string | number;
  status?: 'online' | 'offline' | 'warning';
}

interface RealTimeWidgetProps {
  title: string;
  data: RealTimeData[];
  updateInterval?: number;
}

export default function RealTimeWidget({ 
  title, 
  data, 
  updateInterval = 5000 
}: RealTimeWidgetProps) {
  const { theme } = useTheme();
  const colors = Colors[theme];
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      // Simulate connection status
      setIsConnected(Math.random() > 0.1);
    }, updateInterval);

    return () => clearInterval(interval);
  }, [updateInterval]);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'online':
        return colors.success;
      case 'offline':
        return colors.error;
      case 'warning':
        return colors.warning;
      default:
        return colors.text;
    }
  };

  const getStatusIcon = (status?: string) => {
    const iconSize = screenWidth < 768 ? 12 : 14;
    switch (status) {
      case 'online':
        return <Wifi size={iconSize} color={colors.success} />;
      case 'offline':
        return <WifiOff size={iconSize} color={colors.error} />;
      default:
        return <Activity size={iconSize} color={colors.primary} />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <View style={styles.statusContainer}>
          {isConnected ? (
            <Wifi size={screenWidth < 768 ? 16 : 18} color={colors.success} />
          ) : (
            <WifiOff size={screenWidth < 768 ? 16 : 18} color={colors.error} />
          )}
        </View>
      </View>

      <View style={styles.dataContainer}>
        {data.map((item, index) => (
          <View key={index} style={styles.dataItem}>
            <View style={styles.dataHeader}>
              <Text style={[styles.dataLabel, { color: colors.text }]}>
                {item.label}
              </Text>
              {item.status && getStatusIcon(item.status)}
            </View>
            <Text 
              style={[
                styles.dataValue, 
                { color: getStatusColor(item.status) }
              ]}
            >
              {item.value}
            </Text>
          </View>
        ))}
      </View>

      <Text style={[styles.lastUpdate, { color: colors.text }]}>
        Last updated: {lastUpdate.toLocaleTimeString()}
      </Text>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: screenWidth < 768 ? 16 : 18,
    fontWeight: '600' as const,
  },
  statusContainer: {
    padding: 4,
  },
  dataContainer: {
    marginBottom: 12,
  },
  dataItem: {
    marginBottom: screenWidth < 768 ? 8 : 12,
  },
  dataHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  dataLabel: {
    fontSize: screenWidth < 768 ? 12 : 14,
    fontWeight: '500' as const,
  },
  dataValue: {
    fontSize: screenWidth < 768 ? 16 : 18,
    fontWeight: 'bold' as const,
  },
  lastUpdate: {
    fontSize: screenWidth < 768 ? 10 : 11,
    opacity: 0.7,
    textAlign: 'center',
  },
});