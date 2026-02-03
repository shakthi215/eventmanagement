import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import colors from '../constants/colors';
import { formatDate, formatPrice, getEventImagePlaceholder } from '../utils/helpers';
import type { Event } from '../services/storage';

type EventCardProps = {
  event: Event;
  onPress?: () => void;
};

export default function EventCard({ event, onPress }: EventCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image
        source={{ uri: event.coverImage || getEventImagePlaceholder() }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {event.title}
        </Text>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.location} numberOfLines={1}>
            {event.location}
          </Text>
        </View>
        <Text style={styles.date}>{formatDate(event.date)}</Text>
        {event.price && event.price !== '0' && (
          <Text style={styles.price}>{formatPrice(event.price)}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 280,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  image: {
    width: '100%',
    height: 160,
    backgroundColor: colors.card,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 4,
    flex: 1,
  },
  date: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 8,
  },
});
