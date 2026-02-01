/**
 * Memory Quick Summary - React Native
 *
 * Compact badge showing memory stats with expand button
 * Matches the web MemoryQuickSummary component
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Brain, ChevronRight } from 'lucide-react-native';
import type { MemoryQuickSummaryProps } from './types';
import { useThemeColor } from '../../hooks/useThemeColor';

export function MemoryQuickSummary({
  suburbPreferences,
  facts,
  onShowFullContext,
}: MemoryQuickSummaryProps) {
  const bgColor = useThemeColor({}, 'background-secondary');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'text-secondary');
  const accentColor = useThemeColor({}, 'tint');

  const topSuburbs = suburbPreferences
    .filter((p) => p.preferenceScore > 30)
    .sort((a, b) => b.preferenceScore - a.preferenceScore)
    .slice(0, 3);

  const hasContent = topSuburbs.length > 0 || facts.length > 0;

  if (!hasContent) {
    return null;
  }

  return (
    <TouchableOpacity
      onPress={onShowFullContext}
      activeOpacity={0.7}
      style={[
        styles.container,
        { backgroundColor: bgColor, borderColor },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.left}>
          <View style={[styles.iconContainer, { backgroundColor: `${accentColor}15` }]}>
            <Brain size={16} color={accentColor} />
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: textColor }]}>Memory Active</Text>
            <Text style={[styles.subtitle, { color: subtextColor }]}>
              {topSuburbs.length > 0
                ? `${topSuburbs.length} preferred suburbs, ${facts.length} facts learned`
                : `${facts.length} facts learned`}
            </Text>
          </View>
        </View>
        <ChevronRight size={18} color={subtextColor} />
      </View>

      {topSuburbs.length > 0 && (
        <View style={styles.chipsContainer}>
          {topSuburbs.slice(0, 3).map((pref) => (
            <View
              key={`${pref.suburbName}-${pref.state}`}
              style={[
                styles.chip,
                {
                  backgroundColor: pref.preferenceScore > 70
                    ? 'rgba(34, 197, 94, 0.15)'
                    : 'rgba(234, 179, 8, 0.15)',
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color: pref.preferenceScore > 70 ? '#22c55e' : '#eab308',
                  },
                ]}
              >
                {pref.suburbName}
              </Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
 borderWidth: 1,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '500',
  },
});
