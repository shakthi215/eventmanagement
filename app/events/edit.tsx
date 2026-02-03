import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import colors from '../../constants/colors';
import { getCurrentUser, getEventById, saveEvent } from '../../services/storage';
import type { Event } from '../../services/storage';

export default function EditEventScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const resolvedEventId =
    typeof eventId === 'string' ? eventId : Array.isArray(eventId) ? eventId[0] : '';

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    if (resolvedEventId) {
      loadEvent();
    }
  }, [resolvedEventId]);

  const loadEvent = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        router.replace('/login');
        return;
      }

      const event = await getEventById(resolvedEventId);
      if (event) {
        if (event.creatorId !== user.id) {
          Alert.alert('Not Allowed', 'You can only edit events you created.');
          router.back();
          return;
        }
        setTitle(event.title);
        setDate(event.date);
        setTime(event.time || '');
        setLocation(event.location);
        setPrice(event.price || '');
        setDescription(event.description || '');
        setCoverImage(event.coverImage || '');
      }
    } catch (error) {
      console.error('Error loading event:', error);
      Alert.alert('Error', 'Failed to load event details');
    } finally {
      setCheckingAuth(false);
    }
  };

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

  const handleSaveChanges = async () => {
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
      const user = await getCurrentUser();
      if (!user) {
        Alert.alert('Login Required', 'Please log in to edit this event.');
        router.replace('/login');
        return;
      }

      const existingEvent = await getEventById(resolvedEventId);
      if (!existingEvent) {
        Alert.alert('Error', 'Event not found');
        return;
      }
      if (existingEvent.creatorId !== user.id) {
        Alert.alert('Not Allowed', 'You can only edit events you created.');
        return;
      }

      const updatedEvent: Event = {
        ...existingEvent,
        title: title.trim(),
        date: date.trim(),
        time: time.trim(),
        location: location.trim(),
        price: price.trim() || '0',
        description: description.trim(),
        coverImage,
      };

      await saveEvent(updatedEvent);

      Alert.alert('Success', 'Event updated successfully!', [
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
      Alert.alert('Error', 'Failed to update event');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {checkingAuth ? (
        <View style={[styles.container, styles.loadingContainer]}>
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
        <Text style={styles.headerTitle}>Edit Event</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Event Title */}
        <View style={styles.field}>
          <Text style={styles.label}>Event Title</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} />
        </View>

        {/* Date & Time */}
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: 8 }]}>
            <TextInput style={styles.input} value={date} onChangeText={setDate} />
          </View>
          <View style={[styles.field, { flex: 1, marginLeft: 8 }]}>
            <TextInput style={styles.input} value={time} onChangeText={setTime} />
          </View>
        </View>

        {/* Location */}
        <View style={styles.field}>
          <TextInput style={styles.input} value={location} onChangeText={setLocation} />
        </View>

        {/* Price */}
        <View style={styles.field}>
          <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" />
        </View>

        {/* Description */}
        <View style={styles.field}>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            multiline
          />
        </View>

        {/* Image */}
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {coverImage ? (
            <Image source={{ uri: coverImage }} style={styles.coverImage} />
          ) : (
            <Ionicons name="add" size={32} color={colors.textSecondary} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.buttonDisabled]}
          onPress={handleSaveChanges}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
  loadingContainer: {
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
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputWithIconText: {
    flex: 1,
    marginLeft: 8,
    borderWidth: 0,
    padding: 16,
  },
  textArea: {
    height: 120,
    paddingTop: 16,
  },
  imagePicker: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  imagePickerEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
