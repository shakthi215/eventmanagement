import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import colors from '../constants/colors';
import {
  getAllEventsArray,
  getCurrentUser,
  getUserLikes,
  logout,
} from '../services/storage';
import type { Event as StoredEvent, User } from '../services/storage';
import { formatDate } from '../utils/helpers';

type Event = StoredEvent;

export default function ProfileScreen() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [likedEvents, setLikedEvents] = useState<Event[]>([]);
  const [createdEvents, setCreatedEvents] = useState<Event[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadProfileData();
    }, [])
  );

  const loadProfileData = async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);

      if (!user) {
        setLikedEvents([]);
        setCreatedEvents([]);
        return;
      }

      const likedEventIds = await getUserLikes(user.id);
      const allEvents = await getAllEventsArray();

      setLikedEvents(allEvents.filter(e => likedEventIds.includes(e.id)));
      setCreatedEvents(allEvents.filter(e => e.creatorId === user.id));
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]);
  };

  const renderEventCard = (event: Event) => (
    <TouchableOpacity
      key={event.id}
      style={styles.eventCard}
      onPress={() => router.push(`/events/${event.id}`)}
    >
      <Image
        source={{
          uri: event.coverImage || 'https://via.placeholder.com/300x200',
        }}
        style={styles.eventImage}
      />
      <View style={styles.eventInfo}>
        <Text style={styles.eventTitle} numberOfLines={2}>
          {event.title}
        </Text>
        <View style={styles.eventMeta}>
          <Ionicons name="location-outline" size={12} color={colors.textSecondary} />
          <Text style={styles.eventLocation} numberOfLines={1}>
            {event.location}
          </Text>
        </View>
        <Text style={styles.eventDate}>{formatDate(event.date)}</Text>
      </View>
    </TouchableOpacity>
  );

  if (!currentUser) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/');
            }
          }}
          style={styles.headerButton}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="ellipsis-horizontal" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.profileSection}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{
                uri: currentUser?.avatar || 'https://via.placeholder.com/200',
              }}
              style={styles.avatar}
            />
          </View>
          <Text style={styles.name}>{currentUser?.username || 'User'}</Text>
          <Text style={styles.bio}>
            {currentUser?.bio ||
              'Event enthusiast and community builder. Always looking for the next big music festival.'}
          </Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Liked Events</Text>
          {likedEvents.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="heart-outline" size={28} color={colors.textSecondary} />
              <Text style={styles.emptyText}>No liked events yet</Text>
            </View>
          ) : (
            <View style={styles.eventsGrid}>{likedEvents.map(renderEventCard)}</View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Events</Text>
          {createdEvents.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={28} color={colors.textSecondary} />
              <Text style={styles.emptyText}>No events created yet</Text>
            </View>
          ) : (
            <View style={styles.eventsGrid}>{createdEvents.map(renderEventCard)}</View>
          )}
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/')}
        >
          <Ionicons name="home-outline" size={22} color={colors.textSecondary} />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, styles.navItemActive]}>
          <Ionicons name="person" size={22} color={colors.primary} />
          <Text style={styles.navTextActive}>Profile</Text>
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.text,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  avatarWrapper: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    marginBottom: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.card,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  bio: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  logoutButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 140,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  eventsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
  },
  eventCard: {
    width: '47%',
    marginHorizontal: '1.5%',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  eventImage: {
    width: '100%',
    height: 110,
    backgroundColor: colors.card,
  },
  eventInfo: {
    padding: 10,
  },
  eventTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 11,
    color: colors.textSecondary,
    marginLeft: 4,
    flex: 1,
  },
  eventDate: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 10,
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
