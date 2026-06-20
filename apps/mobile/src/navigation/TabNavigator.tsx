import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from './types';
import { colors, spacing, radius } from '../theme/tokens';
import { typography } from '../theme/typography';

// Import screens (will be created in Phase 4)
import { HomeScreen } from '../screens/Home/HomeScreen';
import { TransactionsScreen } from '../screens/Transactions/TransactionsScreen';
import { AnalyticsScreen } from '../screens/Analytics/AnalyticsScreen';
import { BudgetsScreen } from '../screens/Budgets/BudgetsScreen';
import { SettingsScreen } from '../screens/Settings/SettingsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

// ═══════════════════════════════════════════════════════════
// TAB ICONS (SVG-free for now, using emoji + styled views)
// ═══════════════════════════════════════════════════════════

interface TabIconProps {
  focused: boolean;
  icon: string;
  label: string;
}

function TabIcon({ focused, icon, label }: TabIconProps): React.ReactElement {
  return (
    <View style={styles.tabIconContainer}>
      <View style={[styles.tabIconWrapper, focused && styles.tabIconWrapperActive]}>
        <Text style={[styles.tabIconEmoji, focused && styles.tabIconEmojiActive]}>
          {icon}
        </Text>
      </View>
      <Text
        style={[
          styles.tabLabel,
          focused && styles.tabLabelActive,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════
// TAB NAVIGATOR
// ═══════════════════════════════════════════════════════════

export function TabNavigator(): React.ReactElement {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.accentPrimary,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="🏠" label="Home" />
          ),
          tabBarAccessibilityLabel: 'Home tab',
        }}
      />
      <Tab.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="💳" label="Transactions" />
          ),
          tabBarAccessibilityLabel: 'Transactions tab',
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="📊" label="Analytics" />
          ),
          tabBarAccessibilityLabel: 'Analytics tab',
        }}
      />
      <Tab.Screen
        name="Budgets"
        component={BudgetsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="🎯" label="Budgets" />
          ),
          tabBarAccessibilityLabel: 'Budgets tab',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="⚙️" label="Settings" />
          ),
          tabBarAccessibilityLabel: 'Settings tab',
        }}
      />
    </Tab.Navigator>
  );
}

// ═══════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.tabBarBackground,
    borderTopColor: colors.tabBarBorder,
    borderTopWidth: 1,
    height: 85,
    paddingBottom: 20,
    paddingTop: 8,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabIconWrapper: {
    width: 40,
    height: 32,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconWrapperActive: {
    backgroundColor: colors.accentSubtle,
  },
  tabIconEmoji: {
    fontSize: 20,
    opacity: 0.5,
  },
  tabIconEmojiActive: {
    opacity: 1,
  },
  tabLabel: {
    ...typography.labelSmall,
    color: colors.textMuted,
  },
  tabLabelActive: {
    color: colors.accentPrimary,
  },
});
