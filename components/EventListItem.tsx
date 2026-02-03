import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import colors from '../constants/colors';
import { formatDate, formatPrice, getEventImagePlaceholder } from '../utils/helpers';
import type { Event } from '../services/storage';

type EventListItemProps = {
  event: Event;
  onPress?: () => void;
};

export default function EventListItem({ event, onPress }: EventListItemProps) {
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
          <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.metaText}>{formatDate(event.date)}</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.metaText} numberOfLines={1}>
            {event.location}
          </Text>
        </View>
        {event.price && event.price !== '0' && (
          <Text style={styles.price}>{formatPrice(event.price)}</Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
  },
  image: {
    width: 100,
    height: 100,
    backgroundColor: colors.card,
  },
  content: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: 6,
    flex: 1,
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 4,
  },
});
