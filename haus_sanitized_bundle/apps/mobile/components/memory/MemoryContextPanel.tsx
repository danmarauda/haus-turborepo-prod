/**
 * Memory Context Panel - React Native
 *
 * Full-featured memory UI with tabbed interface matching the web implementation
 * Shows suburb preferences, learned facts, and property interaction history
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SafeAreaView,
} from 'react-native';
import {
  X,
  Brain,
  Heart,
  MapPin,
  History,
  Home,
  TrendingUp,
  Sparkles,
} from 'lucide-react-native';
import type { MemoryContextPanelProps, SuburbPreference, VoiceFact, PropertyInteraction, VoiceMemory } from './types';
import { useThemeColor } from '../../hooks/useThemeColor';

type TabType = 'preferences' | 'facts' | 'history';

export function MemoryContextPanel({
  suburbPreferences,
  facts,
  propertyInteractions,
  memories,
  isLoading = false,
}: MemoryContextPanelProps) {
  const [visible, setVisible] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('preferences');

  const bgColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'background-secondary');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'text-secondary');
  const accentColor = useThemeColor({}, 'tint');

  const hasContent = suburbPreferences.length > 0 || facts.length > 0 || propertyInteractions.length > 0;

  if (!hasContent && !isLoading) {
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return '#22c55e';
    if (score >= 40) return '#0ea5e9';
    if (score >= 0) return '#71717a';
    return '#ef4444';
  };

  const getScoreBg = (score: number) => {
    if (score >= 70) return 'rgba(34, 197, 94, 0.1)';
    if (score >= 40) return 'rgba(14, 165, 233, 0.1)';
    if (score >= 0) return 'rgba(113, 113, 122, 0.1)';
    return 'rgba(239, 68, 68, 0.1)';
  };

  const tabs: { id: TabType; label: string; icon: React.ComponentType<{ size?: number; color?: string }> }[] = [
    { id: 'preferences', label: 'Preferences', icon: Heart },
    { id: 'facts', label: 'Facts', icon: Brain },
    { id: 'history', label: 'History', icon: History },
  ];

  const ActiveIcon = tabs.find((t) => t.id === activeTab)?.icon || Brain;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setVisible(false)}
    >
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: bgColor }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: borderColor }]}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconContainer, { backgroundColor: `${accentColor}15` }]}>
              <ActiveIcon size={18} color={accentColor} />
            </View>
            <View>
              <Text style={[styles.title, { color: textColor }]}>Memory Context</Text>
              <Text style={[styles.subtitle, { color: subtextColor }]}>
                {isLoading ? 'Loading...' : `${suburbPreferences.length} suburbs, ${facts.length} facts`}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => setVisible(false)} style={styles.closeButton}>
            <X size={24} color={subtextColor} />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={[styles.tabsContainer, { borderBottomColor: borderColor }]}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                style={[styles.tab, isActive && { borderBottomColor: accentColor }]}
              >
                <Icon
                  size={18}
                  color={isActive ? accentColor : subtextColor}
                />
                <Text
                  style={[styles.tabLabel, isActive ? { color: accentColor } : { color: subtextColor }]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <View style={styles.loadingDots}>
                <View style={[styles.dot, { backgroundColor: accentColor }]} />
                <View style={[styles.dot, { backgroundColor: accentColor }]} />
                <View style={[styles.dot, { backgroundColor: accentColor }]} />
              </View>
              <Text style={[styles.loadingText, { color: subtextColor }]}>Loading memory...</Text>
            </View>
          ) : (
            <>
              {activeTab === 'preferences' && (
                <PreferencesTab
                  suburbPreferences={suburbPreferences}
                  getScoreColor={getScoreColor}
                  getScoreBg={getScoreBg}
                  textColor={textColor}
                  subtextColor={subtextColor}
                  cardColor={cardColor}
                />
              )}

              {activeTab === 'facts' && (
                <FactsTab
                  facts={facts}
                  textColor={textColor}
                  subtextColor={subtextColor}
                  cardColor={cardColor}
                  accentColor={accentColor}
                />
              )}

              {activeTab === 'history' && (
                <HistoryTab
                  propertyInteractions={propertyInteractions}
                  memories={memories}
                  textColor={textColor}
                  subtextColor={subtextColor}
                  cardColor={cardColor}
                  accentColor={accentColor}
                />
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// Tab Components

function PreferencesTab({
  suburbPreferences,
  getScoreColor,
  getScoreBg,
  textColor,
  subtextColor,
  cardColor,
}: {
  suburbPreferences: SuburbPreference[];
  getScoreColor: (score: number) => string;
  getScoreBg: (score: number) => string;
  textColor: string;
  subtextColor: string;
  cardColor: string;
}) {
  const sortedPrefs = [...suburbPreferences].sort((a, b) => b.preferenceScore - a.preferenceScore);

  if (sortedPrefs.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Heart size={32} color={subtextColor} />
        <Text style={[styles.emptyText, { color: subtextColor }]}>No preferences learned yet</Text>
        <Text style={[styles.emptySubtext, { color: subtextColor }]}>
          Your suburb preferences will appear here as you search
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.tabContent}>
      {sortedPrefs.map((pref) => (
        <View
          key={`${pref.suburbName}-${pref.state}`}
          style={[styles.prefCard, { backgroundColor: cardColor, borderColor: getScoreBg(pref.preferenceScore) }]}
        >
          <View style={styles.prefHeader}>
            <View style={styles.prefLocation}>
              <MapPin size={16} color={subtextColor} />
              <Text style={[styles.prefName, { color: textColor }]}>
                {pref.suburbName}, {pref.state}
              </Text>
            </View>
            <View style={[styles.scoreBadge, { backgroundColor: getScoreBg(pref.preferenceScore) }]}>
              <Text style={[styles.scoreText, { color: getScoreColor(pref.preferenceScore) }]}>
                {pref.preferenceScore > 0 ? '+' : ''}{pref.preferenceScore}
              </Text>
            </View>
          </View>
          {pref.reasons && pref.reasons.length > 0 && (
            <View style={styles.prefReasons}>
              <Text style={[styles.prefReasonsLabel, { color: subtextColor }]}>Because:</Text>
              {pref.reasons.slice(0, 2).map((reason: string, i: number) => (
                <Text key={i} style={[styles.prefReason, { color: subtextColor }]}>
                  • {reason}
                </Text>
              ))}
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

function FactsTab({
  facts,
  textColor,
  subtextColor,
  cardColor,
  accentColor,
}: {
  facts: VoiceFact[];
  textColor: string;
  subtextColor: string;
  cardColor: string;
  accentColor: string;
}) {
  if (facts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Brain size={32} color={subtextColor} />
        <Text style={[styles.emptyText, { color: subtextColor }]}>No facts learned yet</Text>
        <Text style={[styles.emptySubtext, { color: subtextColor }]}>
          Facts about your preferences will appear here
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.tabContent}>
      {facts.map((fact, i) => (
        <View
          key={i}
          style={[styles.factCard, { backgroundColor: cardColor }]}
        >
          <View style={styles.factHeader}>
            <Sparkles size={14} color={accentColor} />
            {fact.category && (
              <View style={[styles.factCategory, { backgroundColor: `${accentColor}15` }]}>
                <Text style={[styles.factCategoryText, { color: accentColor }]}>
                  {fact.category}
                </Text>
              </View>
            )}
            <View style={[styles.confidenceBadge, { backgroundColor: `${accentColor}15` }]}>
              <Text style={[styles.confidenceText, { color: accentColor }]}>
                {fact.confidence}%
              </Text>
            </View>
          </View>
          <Text style={[styles.factText, { color: textColor }]}>{fact.fact}</Text>
        </View>
      ))}
    </View>
  );
}

function HistoryTab({
  propertyInteractions,
  memories,
  textColor,
  subtextColor,
  cardColor,
  accentColor,
}: {
  propertyInteractions: PropertyInteraction[];
  memories: VoiceMemory[];
  textColor: string;
  subtextColor: string;
  cardColor: string;
  accentColor: string;
}) {
  if (propertyInteractions.length === 0 && memories.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <History size={32} color={subtextColor} />
        <Text style={[styles.emptyText, { color: subtextColor }]}>No history yet</Text>
        <Text style={[styles.emptySubtext, { color: subtextColor }]}>
          Your property interactions will appear here
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.tabContent}>
      {/* Property Interactions */}
      {propertyInteractions.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Properties Viewed</Text>
          {propertyInteractions.slice(0, 10).map((interaction) => (
            <View
              key={`${interaction.propertyId}-${interaction.timestamp}`}
              style={[styles.historyCard, { backgroundColor: cardColor }]}
            >
              <View style={styles.historyHeader}>
                <Home size={16} color={subtextColor} />
                <Text style={[styles.historyPropertyId, { color: textColor }]}>
                  {interaction.propertyContext?.address as string || interaction.propertyId}
                </Text>
              </View>
              <View style={styles.historyMeta}>
                <View style={[styles.interactionType, { backgroundColor: `${accentColor}15` }]}>
                  <Text style={[styles.interactionTypeText, { color: accentColor }]}>
                    {interaction.interactionType}
                  </Text>
                </View>
                <Text style={[styles.historyTime, { color: subtextColor }]}>
                  {new Date(interaction.timestamp).toLocaleDateString()}
                </Text>
              </View>
              {interaction.queryText && (
                <Text style={[styles.historyQuery, { color: subtextColor, fontStyle: 'italic' }]}>
                  "{interaction.queryText}"
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Conversation Memories */}
      {memories.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Recent Conversations</Text>
          {memories.slice(0, 5).map((memory, i) => (
            <View
              key={i}
              style={[styles.memoryCard, { backgroundColor: cardColor }]}
            >
              <Text style={[styles.memoryContent, { color: subtextColor }]} numberOfLines={3}>
                {memory.content}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderBottomWidth: 2,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  loadingText: {
    fontSize: 14,
  },
  tabContent: {
    padding: 16,
    gap: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  // Preferences
  prefCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  prefHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  prefLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  prefName: {
    fontSize: 15,
    fontWeight: '500',
  },
  scoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '600',
  },
  prefReasons: {
    gap: 2,
  },
  prefReasonsLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  prefReason: {
    fontSize: 12,
    marginLeft: 8,
  },
  // Facts
  factCard: {
    borderRadius: 12,
    padding: 12,
  },
  factHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  factCategory: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  factCategoryText: {
    fontSize: 10,
    fontWeight: '500',
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 'auto',
  },
  confidenceText: {
    fontSize: 10,
    fontWeight: '600',
  },
  factText: {
    fontSize: 14,
    lineHeight: 20,
  },
  // History
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  historyCard: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  historyPropertyId: {
    fontSize: 14,
    fontWeight: '500',
  },
  historyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  interactionType: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  interactionTypeText: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  historyTime: {
    fontSize: 11,
  },
  historyQuery: {
    fontSize: 12,
    marginTop: 6,
  },
  memoryCard: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  memoryContent: {
    fontSize: 13,
    lineHeight: 18,
  },
});
