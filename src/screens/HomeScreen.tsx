import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radius } from '../theme';
import { Settings } from '../types';
import { greeting } from '../content';
import { loadDraft, saveDraft } from '../storage';
import Button from '../components/Button';
import WheelPicker from '../components/WheelPicker';

type Props = { settings: Settings; onStart: (goal: string, seconds: number) => void };

export default function HomeScreen({ settings, onStart }: Props) {
  const [seconds, setSeconds] = useState(25 * 60);
  const [goal, setGoal] = useState('');
  // The wheel reads its start position once, so mount it after the saved draft loads
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadDraft().then((d) => {
      if (d) {
        setGoal(d.goal);
        setSeconds(d.seconds ?? 25 * 60);
      }
      setReady(true);
    });
  }, []);

  const start = () => {
    const g = goal.trim() || 'Focus session';
    saveDraft({ goal: goal.trim(), seconds });
    onStart(g, seconds);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.hello}>{greeting(settings.name)}</Text>
        {settings.mainGoal ? (
          <Text style={styles.main} numberOfLines={2}>
            {settings.mainGoal}
          </Text>
        ) : (
          <Text style={styles.main}>Set the timer and get to work.</Text>
        )}

        <View style={styles.picker}>{ready && <WheelPicker seconds={seconds} onChange={setSeconds} />}</View>

        <Text style={styles.label}>Label</Text>
        <TextInput
          value={goal}
          onChangeText={setGoal}
          placeholder="What will you do in this time?"
          placeholderTextColor={colors.muted}
          style={styles.input}
          maxLength={120}
        />

        <Button label="Start" onPress={start} disabled={seconds < 1} style={{ marginTop: 28 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 24, paddingBottom: 32 },
  hello: { color: colors.text, fontSize: 28, fontWeight: '800' },
  main: { color: colors.muted, fontSize: 15, marginTop: 6, lineHeight: 21 },
  picker: { marginTop: 28, minHeight: 240 },
  label: { color: colors.muted, fontSize: 13, fontWeight: '600', marginTop: 24, marginBottom: 8, letterSpacing: 0.5 },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    padding: 16,
    color: colors.text,
    fontSize: 16,
  },
});
