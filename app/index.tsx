import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import colors from '../constants/colors';
import { getAllEventsArray, getCurrentUser } from '../services/storage';
import { formatDate, formatPrice } from '../utils/helpers';

export default function HomeScreen() {
  const [events, setEvents] = useState<any[]>([]);
  const [topEvents, setTopEvents] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadEvents = async () => {
    const allEvents = await getAllEventsArray();
    setEvents(allEvents);
    setTopEvents(allEvents.slice(0, 3));
  };

  const loadUser = async () => {
    const user = await getCurrentUser();
    setCurrentUser(user);
  };

  useFocusEffect(
    useCallback(() => {
      loadEvents();
      loadUser();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  };

  const renderTopEvent = ({ item }: any) => (
    <TouchableOpacity
      style={styles.topEventCard}
      onPress={() => router.push(`/events/${item.id}`)}
    >
      <Image source={{ uri: item.coverImage }} style={styles.topEventImage} />
      <View style={styles.topEventInfo}>
        <Text style={styles.topEventTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.topEventMeta}>
          <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.topEventLocation} numberOfLines={1}>
            {item.location}
          </Text>
        </View>
        <Text style={styles.topEventDate}>{formatDate(item.date)}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEvent = ({ item }: any) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => router.push(`/events/${item.id}`)}
    >
      <Image source={{ uri: item.coverImage }} style={styles.eventImage} />
      <View style={styles.eventInfo}>
        <Text style={styles.eventTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.eventDate}>
          {formatDate(item.date)} - {item.location}
        </Text>
        <Text style={styles.eventPrice}>{formatPrice(item.price)}</Text>
      </View>
    </TouchableOpacity>
  );

  const filteredEvents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return events;
    return events.filter((event) => {
      const title = String(event.title || '').toLowerCase();
      const location = String(event.location || '').toLowerCase();
      const description = String(event.description || '').toLowerCase();
      return (
        title.includes(query) ||
        location.includes(query) ||
        description.includes(query)
      );
    });
  }, [events, searchQuery]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning,</Text>
          <Text style={styles.userName}>
            Hello, {currentUser?.username || 'User'}!
          </Text>
        </View>
        {currentUser?.avatar && (
          <Image source={{ uri: currentUser.avatar }} style={styles.avatar} />
        )}
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Search */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search events, venues..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {!!searchQuery && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.searchClear}
            >
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Top Events */}
        {topEvents.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Events</Text>
            <FlatList
              horizontal
              data={topEvents}
              renderItem={renderTopEvent}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.topEventsList}
            />
          </View>
        )}

        {/* All Events */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Events</Text>
          {filteredEvents.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyText}>
                {searchQuery ? 'No matching events' : 'No events yet'}
              </Text>
              <Text style={styles.emptySubtext}>
                {searchQuery
                  ? 'Try a different search.'
                  : 'Be the first to create an event!'}
              </Text>
            </View>
          ) : (
            filteredEvents.map((item) => (
              <View key={item.id}>{renderEvent({ item })}</View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Create Button */}
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => router.push('/events/create')}
      >
        <Ionicons name="add" size={28} color={colors.white} />
      </TouchableOpacity>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={[styles.navItem, styles.navItemActive]}>
          <Ionicons name="home" size={22} color={colors.primary} />
          <Text style={styles.navTextActive}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.replace('/profile')}
        >
          <Ionicons name="person-outline" size={22} color={colors.textSecondary} />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 4,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.surface,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 24,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: colors.text,
    paddingVertical: 0,
  },
  searchClear: {
    paddingLeft: 8,
  },
  section: {
    marginBottom: 24,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  topEventsList: {
    paddingHorizontal: 20,
  },
  topEventCard: {
    width: 280,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  topEventImage: {
    width: '100%',
    height: 160,
    backgroundColor: colors.card,
  },
  topEventInfo: {
    padding: 16,
  },
  topEventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  topEventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  topEventLocation: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 4,
    flex: 1,
  },
  topEventDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  eventImage: {
    width: 100,
    height: 100,
    backgroundColor: colors.card,
  },
  eventInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  eventDate: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  eventPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
  createButton: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0px 6px 16px rgba(0,0,0,0.25)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      },
    }),
  },
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 10,
    paddingHorizontal: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navItemActive: {
    transform: [{ translateY: -2 }],
  },
  navText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
  },
  navTextActive: {
    fontSize: 11,
    color: colors.primary,
    marginTop: 4,
    fontWeight: '600',
  },
});
