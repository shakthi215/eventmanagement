import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import colors from '../../constants/colors';
import { getCurrentUser, saveEvent } from '../../services/storage';
import type { Event, User } from '../../services/storage';
import { formatDate, generateId, getEventImagePlaceholder } from '../../utils/helpers';

export default function CreateEventScreen() {
  const isWeb = Platform.OS === 'web';
  const DateTimePicker = !isWeb
    ? (require('@react-native-community/datetimepicker')
        .default as React.ComponentType<any>)
    : null;
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [dateValue, setDateValue] = useState<Date | null>(null);
  const [time, setTime] = useState('10:00 AM');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const webDateValue = date ? date.slice(0, 10) : '';

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          router.replace('/login');
          return;
        }
      } finally {
        setCheckingAuth(false);
      }
    };
    verifyAuth();
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'] as ImagePicker.MediaType[],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setCoverImage(result.assets[0].uri);
    }
  };

  const handleCreateEvent = async () => {
    if (
      !title.trim() ||
      !date.trim() ||
      !time.trim() ||
      !location.trim() ||
      !price.trim() ||
      !description.trim() ||
      !coverImage.trim()
    ) {
      Alert.alert('Error', 'Please fill all required fields.');
      return;
    }

    setLoading(true);
    try {
      const currentUser: User | null = await getCurrentUser();
      if (!currentUser) {
        Alert.alert('Login Required', 'Please log in to create an event.', [
          { text: 'OK', onPress: () => router.replace('/login') },
        ]);
        return;
      }

      const event: Event = {
        id: generateId(),
        title: title.trim(),
        date: date.trim(),
        time: time.trim(),
        location: location.trim(),
        price: price.trim() || '0',
        description: description.trim(),
        coverImage: coverImage || getEventImagePlaceholder(),
        creatorId: currentUser.id,
        createdAt: new Date().toISOString(),
      };

      await saveEvent(event);

      Alert.alert('Success', 'Event created successfully!', [
        {
          text: 'OK',
          onPress: () => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/');
            }
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create event. Please try again.');
      console.error('Create event error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {checkingAuth ? (
        <View style={[styles.container, styles.centerContent]}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
        <>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/');
            }
          }}
        >
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Event</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Event Title */}
        <View style={styles.field}>
          <Text style={styles.label}>Event Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Summer Music Festival"
            placeholderTextColor={colors.placeholder}
          />
        </View>

        {/* Date & Time */}
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity
              style={styles.inputWithIcon}
              onPress={() => {
                if (!isWeb) setShowDatePicker(true);
              }}
              activeOpacity={0.7}
              disabled={isWeb}
            >
              <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
              <TextInput
                style={[styles.inputWithIconText, isWeb && styles.dateInput]}
                value={isWeb ? webDateValue : date ? formatDate(date) : ''}
                onChangeText={
                  isWeb
                    ? (value) => {
                        if (!value) {
                          setDate('');
                          return;
                        }
                        const iso = new Date(`${value}T00:00:00`).toISOString();
                        setDate(iso);
                      }
                    : undefined
                }
                placeholder={isWeb ? 'YYYY-MM-DD' : 'Select date'}
                placeholderTextColor={colors.placeholder}
                editable={isWeb}
                {...(isWeb ? ({ type: 'date' } as any) : {})}
              />
            </TouchableOpacity>
          </View>
          <View style={[styles.field, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>Time</Text>
            <View style={styles.inputWithIcon}>
              <Ionicons name="time-outline" size={18} color={colors.textSecondary} />
              <TextInput
                style={styles.inputWithIconText}
                value={time}
                onChangeText={setTime}
                placeholder="10:00 AM"
                placeholderTextColor={colors.placeholder}
              />
            </View>
          </View>
        </View>

        {/* Location */}
        <View style={styles.field}>
          <Text style={styles.label}>Location</Text>
          <View style={styles.inputWithIcon}>
            <Ionicons name="location-outline" size={18} color={colors.textSecondary} />
            <TextInput
              style={styles.inputWithIconText}
              value={location}
              onChangeText={setLocation}
              placeholder="Venue or Address"
              placeholderTextColor={colors.placeholder}
            />
          </View>
        </View>

        {/* Price */}
        <View style={styles.field}>
          <Text style={styles.label}>Price</Text>
          <View style={styles.inputWithIcon}>
            <Ionicons name="cash-outline" size={18} color={colors.textSecondary} />
            <TextInput
              style={styles.inputWithIconText}
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              placeholder="$0.00"
              placeholderTextColor={colors.placeholder}
            />
          </View>
        </View>

        {/* Description */}
        <View style={styles.field}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            multiline
            placeholder="Tell people about your event"
            placeholderTextColor={colors.placeholder}
          />
        </View>

        {/* Cover Image */}
        <View style={styles.field}>
          <Text style={styles.label}>Cover Image</Text>
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {coverImage ? (
              <Image source={{ uri: coverImage }} style={styles.coverImage} />
            ) : (
              <View style={styles.imagePickerEmpty}>
                <View style={styles.imagePickerIcon}>
                  <Ionicons name="add" size={22} color={colors.textSecondary} />
                </View>
                <Text style={styles.imagePickerText}>Upload Image</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.createButton, loading && styles.buttonDisabled]}
          onPress={handleCreateEvent}
          disabled={loading}
        >
          <Text style={styles.createButtonText}>
            {loading ? 'Creating...' : 'Create Event'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {!isWeb && showDatePicker && DateTimePicker && (
        <DateTimePicker
          value={dateValue ?? new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={(event: any, selectedDate?: Date) => {
            setShowDatePicker(Platform.OS === 'ios');
            if (event?.type === 'dismissed') return;
            const nextDate = selectedDate ?? dateValue ?? new Date();
            setDateValue(nextDate);
            setDate(nextDate.toISOString());
          }}
        />
      )}
        </>
      )}
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
    color: colors.textSecondary,
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputWithIconText: {
    flex: 1,
    marginLeft: 8,
    borderWidth: 0,
    paddingVertical: 14,
    paddingHorizontal: 0,
    color: colors.text,
  },
  dateInput: {
    color: colors.text,
    backgroundColor: 'transparent',
    ...(Platform.OS === 'web'
      ? ({ colorScheme: 'light', appearance: 'none', accentColor: colors.primary } as any)
      : {}),
  },
  textArea: {
    height: 120,
    paddingTop: 16,
  },
  imagePicker: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  imagePickerEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePickerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  imagePickerText: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textSecondary,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  createButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
