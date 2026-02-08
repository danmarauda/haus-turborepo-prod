import React from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { useTheme } from '@/providers/ThemeProvider';
import Colors from '@/constants/colors';

const { width: screenWidth } = Dimensions.get('window');

interface ChartWidgetProps {
  title: string;
  type: 'line' | 'bar' | 'pie';
  data: any;
  height?: number;
}

export default function ChartWidget({ title, type, data, height }: ChartWidgetProps) {
  const { theme } = useTheme();
  const colors = Colors[theme];
  
  // Responsive width calculation
  const getChartWidth = () => {
    if (screenWidth < 768) {
      return screenWidth - 32; // Mobile: full width minus padding
    } else if (screenWidth < 1024) {
      return screenWidth * 0.45; // Tablet: 45% width
    }
    return 400; // Desktop: fixed width
  };

  // Responsive height calculation
  const getChartHeight = () => {
    if (screenWidth < 768) {
      return height ? Math.min(height, 200) : 180; // Mobile: max 200px
    }
    return height || 220; // Tablet/Desktop: default or custom height
  };

  const chartConfig = {
    backgroundColor: colors.card,
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(51, 102, 255, ${opacity})`,
    labelColor: (opacity = 1) => colors.text,
    style: {
      borderRadius: 16,
    },
    propsForLabels: {
      fontSize: screenWidth < 768 ? 10 : 12,
    },
  };

  const renderChart = () => {
    const chartWidth = getChartWidth();
    const chartHeight = getChartHeight();

    // Web compatibility: Show fallback UI for charts on web
    if (Platform.OS === 'web') {
      return (
        <View style={[styles.chartPlaceholder, { width: chartWidth, height: chartHeight, backgroundColor: colors.card }]}>
          <Text style={[styles.placeholderText, { color: colors.text }]}>
            📊 {title}
          </Text>
          <Text style={[styles.placeholderSubtext, { color: colors.text }]}>
            Charts optimized for mobile
          </Text>
          {data && type === 'pie' && Array.isArray(data) && (
            <View style={styles.webFallbackData}>
              {data.slice(0, 3).map((item: any, index: number) => (
                <Text key={index} style={[styles.webDataItem, { color: colors.text }]}>
                  {item.name}: {item.value}%
                </Text>
              ))}
            </View>
          )}
          {data && (type === 'line' || type === 'bar') && data.datasets && (
            <View style={styles.webFallbackData}>
              <Text style={[styles.webDataItem, { color: colors.text }]}>
                Data points: {data.datasets[0]?.data?.length || 0}
              </Text>
            </View>
          )}
        </View>
      );
    }

    // Validate data before rendering
    if (!data) {
      return (
        <View style={[styles.chartPlaceholder, { width: chartWidth, height: chartHeight }]}>
          <Text style={[styles.placeholderText, { color: colors.text }]}>
            No data available
          </Text>
        </View>
      );
    }

    try {
      switch (type) {
        case 'line':
          return (
            <LineChart
              data={data}
              width={chartWidth}
              height={chartHeight}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          );
        case 'bar':
          return (
            <BarChart
              data={data}
              width={chartWidth}
              height={chartHeight}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={chartConfig}
              style={styles.chart}
            />
          );
        case 'pie':
          return (
            <PieChart
              data={data}
              width={chartWidth}
              height={chartHeight}
              chartConfig={chartConfig}
              accessor="value"
              backgroundColor="transparent"
              paddingLeft="15"
              style={styles.chart}
            />
          );
        default:
          return (
            <View style={[styles.chartPlaceholder, { width: chartWidth, height: chartHeight }]}>
              <Text style={[styles.placeholderText, { color: colors.text }]}>
                Unsupported chart type
              </Text>
            </View>
          );
      }
    } catch (error) {
      console.error('Chart rendering error:', error);
      return (
        <View style={[styles.chartPlaceholder, { width: chartWidth, height: chartHeight }]}>
          <Text style={[styles.placeholderText, { color: colors.text }]}>
            Chart unavailable
          </Text>
          <Text style={[styles.placeholderSubtext, { color: colors.text }]}>
            {__DEV__ ? (error instanceof Error ? error.message : String(error)) : 'Please try again'}
          </Text>
        </View>
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <View style={styles.chartContainer}>
        {renderChart()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: screenWidth < 768 ? 16 : 18,
    fontWeight: '600' as const,
    marginBottom: 12,
  },
  chartContainer: {
    alignItems: 'center',
  },
  chart: {
    borderRadius: 8,
  },
  chartPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center' as const,
  },
  placeholderSubtext: {
    fontSize: 12,
    opacity: 0.5,
    textAlign: 'center' as const,
    marginTop: 4,
  },
  webFallbackData: {
    marginTop: 12,
    alignItems: 'center' as const,
  },
  webDataItem: {
    fontSize: 12,
    opacity: 0.7,
    marginVertical: 2,
  },
});