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
import { colors, radius } from '../theme';
import { Settings } from '../types';
import Button from '../components/Button';

type Props = {
  settings: Settings;
  onSave: (s: Settings) => void;
  onReset: () => void;
};

export default function SettingsScreen({ settings, onSave, onReset }: Props) {
  const [name, setName] = useState(settings.name);
  const [mainGoal, setMainGoal] = useState(settings.mainGoal);
  const [saved, setSaved] = useState(false);

  const dirty = name.trim() !== settings.name || mainGoal.trim() !== settings.mainGoal;

  const save = () => {
    onSave({ name: name.trim(), mainGoal: mainGoal.trim() });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const confirmReset = () => {
    Alert.alert(
      'Reset history?',
      'All sessions, XP, level and streak will be deleted. Your name and main goal stay. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: onReset },
      ],
    );
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Settings</Text>

        <Text style={styles.label}>Your name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="What should we call you?"
          placeholderTextColor={colors.muted}
          style={styles.input}
          maxLength={30}
        />

        <Text style={styles.label}>Main goal</Text>
        <TextInput
          value={mainGoal}
          onChangeText={setMainGoal}
          placeholder="e.g. Become a software engineer"
          placeholderTextColor={colors.muted}
          style={[styles.input, { minHeight: 88, textAlignVertical: 'top' }]}
          multiline
          maxLength={140}
        />
        <Text style={styles.hint}>
          We will remind you of this during every session, especially when you feel like quitting.
        </Text>

        <Button
          label={saved ? 'Saved' : 'Save'}
          variant={saved ? 'success' : 'primary'}
          onPress={save}
          disabled={!dirty && !saved}
          style={{ marginTop: 24 }}
        />

        <View style={styles.danger}>
          <Text style={styles.dangerTitle}>Danger zone</Text>
          <Text style={styles.hint}>Remove all your old history, XP and streak and start fresh.</Text>
          <Button label="Reset history" variant="danger" onPress={confirmReset} style={{ marginTop: 14 }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 24, paddingBottom: 32 },
  title: { color: colors.text, fontSize: 28, fontWeight: '800' },
  label: { color: colors.muted, fontSize: 13, fontWeight: '600', marginTop: 28, marginBottom: 8, letterSpacing: 0.5 },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    padding: 16,
    color: colors.text,
    fontSize: 16,
  },
  hint: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 8 },
  danger: {
    marginTop: 44,
    padding: 18,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.35)',
    backgroundColor: 'rgba(255,107,107,0.06)',
  },
  dangerTitle: { color: colors.warn, fontWeight: '700', fontSize: 15 },
});
