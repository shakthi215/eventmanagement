import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import colors from '../constants/colors';
import { getUserByUsername, saveCurrentUser, saveUser } from '../services/storage';
import { generateRandomAvatar } from '../utils/avatars';
import { generateId } from '../utils/helpers';

export default function SignupScreen() {
  const params = useLocalSearchParams<{ username?: string }>();

  const [username, setUsername] = useState(params.username ?? '');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (username) {
      setAvatarUrl(generateRandomAvatar(username));
    }
  }, [username]);

  const handleSignup = async () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Please enter a username');
      return;
    }

    setLoading(true);
    try {
      const existingUser = await getUserByUsername(username.trim());
      if (existingUser) {
        Alert.alert('Error', 'Username already exists. Please choose another one.');
        return;
      }

      const user = {
        id: generateId(),
        username: username.trim(),
        bio: bio.trim() || 'Event enthusiast and community builder.',
        avatar: avatarUrl || generateRandomAvatar(username.trim()),
        createdAt: new Date().toISOString(),
      };

      await saveUser(user);
      await saveCurrentUser(user);

      // Go to home screen
      router.replace('/');
    } catch (error) {
      Alert.alert('Error', 'Failed to create account. Please try again.');
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join the event community</Text>

        <View style={styles.form}>
          {avatarUrl ? (
            <View style={styles.avatarContainer}>
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            </View>
          ) : null}

          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor={colors.placeholder}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            style={[styles.input, styles.bioInput]}
            placeholder="Bio (optional)"
            placeholderTextColor={colors.placeholder}
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.link}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 40,
  },
  form: {
    width: '100%',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surface,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bioInput: {
    height: 100,
    paddingTop: 16,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  link: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});