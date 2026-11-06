import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, radius, shadow } from '../theme';
import { Settings, Stats } from '../types';
import { levelFromXp, levelTitle } from '../content';
import { formatDuration } from '../format';
import Button from '../components/Button';
import Tree from '../components/Tree';

type Props = {
  settings: Settings;
  stats: Stats;
  onSave: (s: Settings) => void;
  onReset: () => void;
};

export default function SettingsScreen({ settings, stats, onSave, onReset }: Props) {
  const [name, setName] = useState(settings.name);
  const [mainGoal, setMainGoal] = useState(settings.mainGoal);
  const [saved, setSaved] = useState(false);

  const dirty = name.trim() !== settings.name || mainGoal.trim() !== settings.mainGoal;
  const level = levelFromXp(stats.xp);
  const trees = stats.sessions.filter((s) => s.completed).length;
  const totalMin = stats.sessions.reduce((a, s) => a + s.focusedMin, 0);

  const save = () => {
    onSave({ name: name.trim(), mainGoal: mainGoal.trim() });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const confirmReset = () => {
    Alert.alert(
      'Clear your forest?',
      'All sessions, trees, XP, level and streak will be deleted. Your name and main goal stay. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: onReset },
      ],
    );
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Me</Text>

        <View style={styles.profile}>
          <View style={styles.avatar}>
            <Tree size={58} stage={Math.min(1, 0.35 + level * 0.12)} bare />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{settings.name || 'Focus planter'}</Text>
            <Text style={styles.profileLvl}>
              Level {level} · {levelTitle(level)}
            </Text>
            <Text style={styles.profileMeta}>
              {trees} trees · {formatDuration(totalMin)} focused
            </Text>
          </View>
        </View>

        <Text style={styles.label}>YOUR NAME</Text>
        <View style={styles.field}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="What should we call you?"
            placeholderTextColor={colors.muted}
            style={styles.input}
            maxLength={30}
          />
        </View>

        <Text style={styles.label}>MAIN GOAL</Text>
        <View style={styles.field}>
          <TextInput
            value={mainGoal}
            onChangeText={setMainGoal}
            placeholder="e.g. Become a software engineer"
            placeholderTextColor={colors.muted}
            style={[styles.input, { minHeight: 88, textAlignVertical: 'top' }]}
            multiline
            maxLength={140}
          />
        </View>
        <Text style={styles.hint}>
          We will remind you of this during every session, especially when you feel like quitting.
        </Text>

        <Button
          label={saved ? 'Saved' : 'Save'}
          variant={saved ? 'success' : 'primary'}
          onPress={save}
          disabled={!dirty && !saved}
          style={{ marginTop: 22 }}
        />

        <View style={styles.danger}>
          <Text style={styles.dangerTitle}>Danger zone</Text>
          <Text style={styles.dangerHint}>
            Cut down every tree and start with empty soil again.
          </Text>
          <Button label="Clear my forest" variant="danger" onPress={confirmReset} style={{ marginTop: 14 }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 28 },
  title: { color: colors.text, fontSize: 26, fontWeight: '800', letterSpacing: -0.3 },

  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 16,
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    ...shadow.card,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: { color: colors.text, fontSize: 18, fontWeight: '800' },
  profileLvl: { color: colors.primaryDeep, fontSize: 13.5, fontWeight: '700', marginTop: 2 },
  profileMeta: { color: colors.muted, fontSize: 12.5, fontWeight: '600', marginTop: 3 },

  label: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 24,
    marginBottom: 8,
    letterSpacing: 1.2,
  },
  field: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    ...shadow.card,
  },
  input: { paddingVertical: 15, color: colors.text, fontSize: 15.5, fontWeight: '500' },
  hint: { color: colors.textSoft, fontSize: 13, lineHeight: 19, marginTop: 10 },

  danger: {
    marginTop: 40,
    padding: 18,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(201,111,91,0.3)',
    backgroundColor: colors.warnSoft,
  },
  dangerTitle: { color: colors.warn, fontWeight: '800', fontSize: 15 },
  dangerHint: { color: '#9A6354', fontSize: 13, lineHeight: 19, marginTop: 6 },
});
