import React from 'react';
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
import logoSource from './assets/logo.jpg';

export const colors = {
  blue: '#0C6DA9',
  sky: '#53B7E7',
  ink: '#16354B',
  muted: '#60788A',
  bg: '#F3F8FC',
  line: '#DAE8F1',
  white: '#FFFFFF',
  danger: '#B73C45',
};
export const logo = logoSource;

export function Brand({ large = false }: { large?: boolean }) {
  return (
    <View style={[styles.brand, large && styles.brandLarge]}>
      <Image
        source={logo}
        style={large ? styles.logoLarge : styles.logo}
        accessibilityLabel="Logo VagaLivre"
      />
      {!large && (
        <View>
          <Text style={styles.brandTitle}>VagaLivre</Text>
          <Text style={styles.caption}>Seu próximo lugar está aqui.</Text>
        </View>
      )}
    </View>
  );
}

export function Button({
  title,
  onPress,
  secondary = false,
  danger = false,
  busy = false,
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  danger?: boolean;
  busy?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={busy}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.secondary,
        danger && styles.danger,
        { opacity: busy || pressed ? 0.65 : 1 },
      ]}
    >
      {busy ? (
        <ActivityIndicator color={secondary ? colors.blue : colors.white} />
      ) : (
        <Text
          style={[
            styles.buttonText,
            secondary && { color: colors.blue },
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
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor="#8B9CAA"
        {...props}
        style={[
          styles.input,
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
    gap: 18,
    width: '100%',
    maxWidth: 880,
    alignSelf: 'center',
    paddingBottom: 48,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  brandLarge: { alignSelf: 'center' },
  logo: { width: 60, height: 60, borderRadius: 16 },
  logoLarge: { width: 164, height: 164, borderRadius: 32 },
  brandTitle: { fontSize: 22, fontWeight: '800', color: colors.ink },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.6,
  },
  subtitle: { fontSize: 16, lineHeight: 24, color: colors.muted },
  caption: { fontSize: 12, lineHeight: 19, color: colors.muted },
  card: {
    padding: 22,
    backgroundColor: colors.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 14,
  },
  cardTitle: { fontSize: 19, fontWeight: '700', color: colors.ink },
  label: { fontSize: 13, fontWeight: '600', color: colors.ink },
  field: { gap: 7 },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: '#FBFDFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    color: colors.ink,
  },
  button: {
    minHeight: 48,
    backgroundColor: colors.blue,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  buttonText: { fontSize: 15, fontWeight: '700', color: colors.white },
  secondary: { backgroundColor: '#E9F4FC' },
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
    backgroundColor: '#DDF2FF',
    padding: 24,
    borderRadius: 24,
    gap: 10,
    borderWidth: 1,
    borderColor: '#BFE4FA',
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
    padding: 6,
    borderRadius: 15,
    backgroundColor: '#E6EEF5',
    gap: 4,
  },
  tab: { flex: 1, paddingVertical: 12, borderRadius: 11, alignItems: 'center' },
  tabActive: { backgroundColor: colors.white },
  tabText: { fontSize: 13, fontWeight: '700', color: colors.muted },
  empty: { padding: 30, gap: 10, alignItems: 'center' },
});
