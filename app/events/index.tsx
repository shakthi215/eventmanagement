import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import colors from '../../constants/colors';

export default function EventsIndexScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Events</Text>
      <Text style={styles.subtitle}>Select an event or create a new one.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
