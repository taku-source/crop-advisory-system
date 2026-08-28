import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors, Fonts, Spacing, Radius } from '../constants/theme';

// ─── Tag / badge ─────────────────────────────────────────────────────────────
export const Tag = ({ children, style }) => (
  <View style={[styles.tag, style]}>
    <Text style={styles.tagText}>{children}</Text>
  </View>
);

// ─── Primary button ───────────────────────────────────────────────────────────
export const BtnPrimary = ({ onPress, children, loading, style }) => (
  <TouchableOpacity style={[styles.btnPrimary, style]} onPress={onPress} activeOpacity={0.85} disabled={loading}>
    {loading
      ? <ActivityIndicator color="#041a0a" />
      : <Text style={styles.btnPrimaryText}>{children}</Text>}
  </TouchableOpacity>
);

// ─── Outline button ───────────────────────────────────────────────────────────
export const BtnOutline = ({ onPress, children, style }) => (
  <TouchableOpacity style={[styles.btnOutline, style]} onPress={onPress} activeOpacity={0.85}>
    <Text style={styles.btnOutlineText}>{children}</Text>
  </TouchableOpacity>
);

// ─── Section label (mono uppercase) ──────────────────────────────────────────
export const SectionLabel = ({ children, style }) => (
  <Text style={[styles.sectionLabel, style]}>{children}</Text>
);

// ─── Card wrapper ─────────────────────────────────────────────────────────────
export const Card = ({ children, style }) => (
  <View style={[styles.card, style]}>{children}</View>
);

// ─── Info box ─────────────────────────────────────────────────────────────────
export const InfoBox = ({ title, children, style }) => (
  <View style={[styles.infoBox, style]}>
    {title && <Text style={styles.infoBoxTitle}>{title}</Text>}
    <Text style={styles.infoBoxBody}>{children}</Text>
  </View>
);

// ─── Why box (green tinted) ───────────────────────────────────────────────────
export const WhyBox = ({ children }) => (
  <View style={styles.whyBox}>
    <Text style={styles.whyText}>{children}</Text>
  </View>
);

// ─── Pill / chip ─────────────────────────────────────────────────────────────
export const Pill = ({ children, color = 'green', style }) => {
  const colors = {
    green:  { bg: 'rgba(74,222,128,.15)',  text: Colors.leaf   },
    red:    { bg: 'rgba(248,113,113,.15)', text: Colors.danger },
    yellow: { bg: 'rgba(251,191,36,.15)',  text: Colors.warn   },
    blue:   { bg: 'rgba(56,189,248,.15)',  text: Colors.sky    },
    grey:   { bg: Colors.muted,            text: Colors.grey   },
  };
  const c = colors[color] || colors.green;
  return (
    <View style={[styles.pill, { backgroundColor: c.bg }, style]}>
      <Text style={[styles.pillText, { color: c.text }]}>{children}</Text>
    </View>
  );
};

// ─── Pulse dot ────────────────────────────────────────────────────────────────
export const PulseDot = () => <View style={styles.pulseDot} />;

const styles = StyleSheet.create({
  tag: { backgroundColor: Colors.leafDim, borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1, borderColor: '#2a5a3a', alignSelf: 'flex-start' },
  tagText: { fontFamily: Fonts.mono, fontSize: 10, color: Colors.leaf, letterSpacing: 0.7, textTransform: 'uppercase' },

  btnPrimary: { backgroundColor: Colors.leaf, borderRadius: Radius.md, paddingVertical: 13, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 },
  btnPrimaryText: { fontFamily: Fonts.bold, fontSize: 14, color: '#041a0a' },

  btnOutline: { backgroundColor: 'transparent', borderRadius: Radius.md, paddingVertical: 11, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  btnOutlineText: { fontFamily: Fonts.semibold, fontSize: 13, color: Colors.white },

  sectionLabel: { fontFamily: Fonts.mono, fontSize: 10, color: Colors.grey, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 7 },

  card: { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border },

  infoBox: { backgroundColor: Colors.card, borderRadius: Radius.md, padding: 13, borderWidth: 1, borderColor: Colors.border, marginBottom: 11 },
  infoBoxTitle: { fontFamily: Fonts.bold, fontSize: 12, color: Colors.grey2, marginBottom: 5 },
  infoBoxBody: { fontFamily: Fonts.body, fontSize: 12, color: Colors.grey, lineHeight: 19 },

  whyBox: { backgroundColor: 'rgba(255,255,255,.04)', borderLeftWidth: 2, borderLeftColor: Colors.leaf, borderRadius: 8, padding: 10, marginTop: 7 },
  whyText: { fontFamily: Fonts.body, fontSize: 11, color: Colors.grey2, lineHeight: 17 },

  pill: { borderRadius: Radius.pill, paddingHorizontal: 9, paddingVertical: 2, alignSelf: 'flex-start' },
  pillText: { fontFamily: Fonts.monoBold, fontSize: 10, letterSpacing: 0.3 },

  pulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.leaf },
});
