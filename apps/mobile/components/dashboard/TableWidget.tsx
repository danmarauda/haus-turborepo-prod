import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';
import Colors from '@/constants/colors';

const { width: screenWidth } = Dimensions.get('window');

interface TableColumn {
  key: string;
  title: string;
  width?: number;
}

interface TableWidgetProps {
  title: string;
  columns: TableColumn[];
  data: Record<string, any>[];
  maxHeight?: number;
}

export default function TableWidget({ title, columns, data, maxHeight = 300 }: TableWidgetProps) {
  const { theme } = useTheme();
  const colors = Colors[theme];

  const isMobile = screenWidth < 768;
  const adjustedMaxHeight = isMobile ? Math.min(maxHeight, 250) : maxHeight;

  // Mobile card layout for better readability
  const renderMobileCards = () => (
    <ScrollView style={{ maxHeight: adjustedMaxHeight }}>
      {data.map((row, index) => (
        <View key={index} style={[styles.mobileCard, { backgroundColor: colors.background }]}>
          {columns.map((column) => (
            <View key={column.key} style={styles.mobileCardRow}>
              <Text style={[styles.mobileCardLabel, { color: colors.text }]}>
                {column.title}:
              </Text>
              <Text style={[styles.mobileCardValue, { color: colors.text }]}>
                {row[column.key]}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );

  // Desktop/tablet table layout
  const renderTable = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View>
        {/* Header */}
        <View style={[styles.tableHeader, { backgroundColor: colors.background }]}>
          {columns.map((column) => (
            <Text
              key={column.key}
              style={[
                styles.headerCell,
                { color: colors.text, width: column.width || 100 }
              ]}
            >
              {column.title}
            </Text>
          ))}
        </View>
        
        {/* Data */}
        <ScrollView style={{ maxHeight: adjustedMaxHeight }}>
          {data.map((row, index) => (
            <View
              key={index}
              style={[
                styles.tableRow,
                { backgroundColor: index % 2 === 0 ? colors.card : 'transparent' }
              ]}
            >
              {columns.map((column) => (
                <Text
                  key={column.key}
                  style={[
                    styles.dataCell,
                    { color: colors.text, width: column.width || 100 }
                  ]}
                >
                  {row[column.key]}
                </Text>
              ))}
            </View>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {isMobile ? renderMobileCards() : renderTable()}
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
  // Mobile card styles
  mobileCard: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  mobileCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  mobileCardLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
    flex: 1,
  },
  mobileCardValue: {
    fontSize: 12,
    flex: 1,
    textAlign: 'right',
  },
  // Table styles
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  headerCell: {
    fontSize: 14,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  dataCell: {
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 4,
  },
});