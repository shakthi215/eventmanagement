import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import colors from '../../constants/colors';
import {
  getCurrentUser,
  getEventById,
  getEventStats,
  isEventLiked,
  isUserRegistered,
  likeEvent,
  registerForEvent,
  unlikeEvent,
} from '../../services/storage';
import { formatDate, formatNumber } from '../../utils/helpers';
export default function EventDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const eventId = String(id);

  const [event, setEvent] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [liked, setLiked] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [stats, setStats] = useState({ registrations: 0, likes: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEventDetails();
  }, [eventId]);

  const loadEventDetails = async () => {
    try {
      const eventData = await getEventById(eventId);
      const user = await getCurrentUser();

      if (!user) {
        router.replace('/login');
        return;
      }
      if (!eventData) {
        Alert.alert('Error', 'Event not found');
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/');
        }
        return;
      }

      setEvent(eventData);
      setCurrentUser(user);
      setLiked(await isEventLiked(user.id, eventId));
      setRegistered(await isUserRegistered(user.id, eventId));
      setStats(await getEventStats(eventId));
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      if (liked) {
        await unlikeEvent(currentUser.id, eventId);
        setLiked(false);
        setStats(prev => ({ ...prev, likes: prev.likes - 1 }));
      } else {
        await likeEvent(currentUser.id, eventId);
        setLiked(true);
        setStats(prev => ({ ...prev, likes: prev.likes + 1 }));
      }
    } catch {
      Alert.alert('Error', 'Failed to update like status');
    }
  };

  const handleRegister = async () => {
    if (registered) {
      Alert.alert('Already Registered');
      return;
    }

    Alert.alert(
      'Register for Event',
      `Do you want to register for ${event.title}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Register',
          onPress: async () => {
            try {
              await registerForEvent(currentUser.id, eventId);
              setRegistered(true);
              setStats(prev => ({
                ...prev,
                registrations: prev.registrations + 1,
              }));
              Alert.alert('Success', 'Registered successfully');
            } catch {
              Alert.alert('Error', 'Registration failed');
            }
          },
        },
      ]
    );
  };

  const handleManageEvent = () => {
    router.push(`/events/edit?eventId=${eventId}`);
  };

  if (loading || !event) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const isCreator = currentUser?.id === event.creatorId;
  const revenue = stats.registrations * (parseFloat(event.price) || 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Image
          source={{
            uri: event.coverImage || 'https://via.placeholder.com/800x400',
          }}
          style={styles.coverImage}
        />
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color={colors.white} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.headerButton} onPress={handleLike}>
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={24}
              color={liked ? colors.danger : colors.white}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.title}>{event.title}</Text>

        {isCreator && (
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>REGISTRATIONS</Text>
              <Text style={styles.statValue}>
                {formatNumber(stats.registrations)}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>REVENUE</Text>
              <Text style={styles.statValue}>${revenue.toFixed(1)}</Text>
            </View>
          </View>
        )}

        <View style={styles.infoRow}>
          <View style={styles.iconContainer}>
            <Ionicons name="calendar-outline" size={18} color={colors.primary} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoText}>
              {formatDate(event.date)} - {event.time}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.iconContainer}>
            <Ionicons name="location-outline" size={18} color={colors.primary} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoText}>{event.location}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About this event</Text>
          <Text style={styles.description}>
            {event.description || 'No description available.'}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomContainer}>
        {isCreator ? (
          <TouchableOpacity style={styles.manageButton} onPress={handleManageEvent}>
            <Text style={styles.buttonText}>Manage Event</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.registerButton,
              registered && styles.registeredButton,
            ]}
            onPress={handleRegister}
            disabled={registered}
          >
            <Text style={styles.buttonText}>
              {registered ? 'Already Registered' : 'Register Now'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.text,
    fontSize: 16,
  },
  headerContainer: {
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: 300,
    backgroundColor: colors.card,
  },
  headerButtons: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 20,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
    justifyContent: 'center',
  },
  infoText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  infoSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  engagementRow: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 24,
  },
  engagementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  engagementText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 6,
    fontWeight: '500',
  },
  section: {
    marginTop: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  registerButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  registeredButton: {
    backgroundColor: colors.success,
  },
  manageButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
