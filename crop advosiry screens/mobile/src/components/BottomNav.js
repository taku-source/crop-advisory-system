import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../constants/theme';

const NAV_ITEMS = [
  { screen: 'Home',      icon: '🏠', label: 'Home'     },
  { screen: 'SeasonPlan',icon: '📋', label: 'Season'   },
  { screen: 'DiseaseID', icon: '🔍', label: 'Disease'  },
  { screen: 'Records',   icon: '📝', label: 'Records'  },
  { screen: 'Knowledge', icon: '📚', label: 'Knowledge' },
];

export default function BottomNav({ active, navigation }) {
  return (
    <View style={styles.container}>
      {NAV_ITEMS.map((item) => {
        const isActive = active === item.screen;
        return (
          <TouchableOpacity
            key={item.screen}
            style={styles.item}
            onPress={() => navigation.navigate(item.screen)}
            activeOpacity={0.7}
          >
            <Text style={[styles.icon, isActive && styles.iconActive]}>{item.icon}</Text>
            <Text style={[styles.label, isActive && styles.labelActive]}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(8,12,8,0.96)',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 6,
    paddingBottom: 20,
  },
  item: { flex: 1, alignItems: 'center', paddingVertical: 4, gap: 3 },
  icon: { fontSize: 19, color: Colors.grey },
  iconActive: { color: Colors.leaf },
  label: { fontFamily: Fonts.mono, fontSize: 9, color: Colors.grey, letterSpacing: 0.4, textTransform: 'uppercase' },
  labelActive: { color: Colors.leaf },
});
