import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import logoSource from './assets/logo-transparent.png';

export const colors = {
  blue: '#0C6DA9',
  sky: '#53B7E7',
  ink: '#1C2B36',
  muted: '#647480',
  bg: '#FFFFFF',
  line: '#E4E9ED',
  white: '#FFFFFF',
  danger: '#B73C45',
};
export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <View style={styles.brand}>
      <Image
        source={logoSource}
        accessibilityLabel="Logo VagaLivre"
        resizeMode="contain"
        style={compact ? styles.logoCompact : styles.logoLogin}
      />
    </View>
  );
}

export function Button({
  title,
  onPress,
  secondary = false,
  danger = false,
  busy = false,
  quiet = false,
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  danger?: boolean;
  busy?: boolean;
  quiet?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: busy, busy }}
      disabled={busy}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.secondary,
        danger && styles.danger,
        quiet && styles.quiet,
        {
          opacity: busy || pressed ? 0.65 : 1,
          transform: [{ scale: pressed && !busy ? 0.98 : 1 }],
        },
      ]}
    >
      {busy ? (
        <ActivityIndicator
          color={secondary || quiet ? colors.blue : colors.white}
        />
      ) : (
        <Text
          style={[
            styles.buttonText,
            secondary && { color: colors.blue },
            quiet && { color: colors.blue },
            danger && { color: colors.danger },
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor="#8B9CAA"
        {...props}
        onFocus={event => {
          setFocused(true);
          props.onFocus?.(event);
        }}
        onBlur={event => {
          setFocused(false);
          props.onBlur?.(event);
        }}
        style={[
          styles.input,
          focused && styles.inputFocused,
          props.multiline && { minHeight: 100, textAlignVertical: 'top' },
          props.style,
        ]}
      />
    </View>
  );
}

export function Notice({
  text,
  success = false,
}: {
  text: string;
  success?: boolean;
}) {
  return text ? (
    <Text
      accessibilityRole="alert"
      style={[
        styles.notice,
        success && { backgroundColor: '#E1F4EA', color: '#246345' },
      ]}
    >
      {text}
    </Text>
  ) : null;
}

export const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  content: {
    padding: 24,
    gap: 24,
    width: '100%',
    maxWidth: 880,
    alignSelf: 'center',
    paddingBottom: 48,
  },
  brand: { alignSelf: 'center' },
  logoLogin: { width: 156, height: 138 },
  logoCompact: { width: 94, height: 78 },
  homeHeader: {
    width: '100%',
    maxWidth: 880,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  homeWelcome: { gap: 12, paddingBottom: 8 },
  menuButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    borderRadius: 12,
    backgroundColor: '#F3F7FA',
  },
  hamburgerLine: {
    width: 22,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.ink,
  },
  pressed: { opacity: 0.65 },
  grow: { flex: 1 },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  garageBody: { gap: 14 },
  garageLink: { color: colors.blue, fontSize: 14, fontWeight: '700' },
  favoriteButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: '#F0F6FA',
  },
  favoriteIcon: { fontSize: 28, color: colors.blue },
  drawerOverlay: { flex: 1, flexDirection: 'row' },
  drawerBackdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(15, 33, 47, 0.4)',
  },
  drawer: { width: '84%', maxWidth: 320, backgroundColor: colors.white },
  drawerContent: { padding: 24, gap: 28 },
  drawerIdentity: {
    gap: 10,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EAF5FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 22, fontWeight: '700', color: colors.blue },
  drawerItems: { gap: 8 },
  drawerItem: {
    minHeight: 56,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 10,
    justifyContent: 'center',
  },
  drawerItemActive: { backgroundColor: '#EAF5FC' },
  drawerItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink,
    letterSpacing: 0.3,
  },
  drawerItemTextActive: { color: colors.blue },
  brandTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.blue,
    letterSpacing: -0.7,
  },
  auth: {
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
    gap: 24,
    paddingTop: 0,
  },
  authHeading: { gap: 10 },
  authForm: { gap: 20 },
  authFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 16,
    gap: 4,
  },
  centeredCaption: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.muted,
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.ink,
    letterSpacing: -0.6,
  },
  subtitle: { fontSize: 16, lineHeight: 24, color: colors.muted },
  caption: { fontSize: 12, lineHeight: 19, color: colors.muted },
  card: {
    padding: 22,
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 18,
  },
  cardTitle: { fontSize: 19, fontWeight: '700', color: colors.ink },
  label: { fontSize: 13, fontWeight: '600', color: colors.ink },
  field: { gap: 7 },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: '#F8FAFB',
    borderRadius: 10,
    minHeight: 52,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    color: colors.ink,
  },
  inputFocused: { borderColor: colors.blue, backgroundColor: colors.white },
  button: {
    minHeight: 52,
    backgroundColor: colors.blue,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  buttonText: { fontSize: 15, fontWeight: '700', color: colors.white },
  secondary: { backgroundColor: '#F0F6FA' },
  quiet: { backgroundColor: 'transparent', minHeight: 44, paddingVertical: 10 },
  danger: { backgroundColor: '#FCECEF' },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 10,
  },
  notice: {
    padding: 14,
    backgroundColor: '#FCECEF',
    color: colors.danger,
    lineHeight: 22,
    borderRadius: 12,
  },
  hero: {
    backgroundColor: '#F7FAFC',
    padding: 24,
    borderRadius: 16,
    gap: 16,
  },
  badge: {
    alignSelf: 'flex-start',
    fontSize: 12,
    fontWeight: '700',
    color: colors.blue,
    backgroundColor: '#E5F5FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 7,
  },
  tabs: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 12,
    backgroundColor: '#F3F5F7',
    gap: 4,
  },
  tab: { flex: 1, paddingVertical: 12, borderRadius: 11, alignItems: 'center' },
  tabActive: { backgroundColor: colors.white },
  tabText: { fontSize: 13, fontWeight: '700', color: colors.muted },
  empty: { padding: 30, gap: 10, alignItems: 'center' },
});
