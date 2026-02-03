import AsyncStorage from '@react-native-async-storage/async-storage';

/* =======================
   TYPES
======================= */

export type User = {
  id: string;
  username: string;
  bio?: string;
  avatar?: string;
};

export type Event = {
  id: string;
  title: string;
  description?: string;
  location: string;
  date: string;
  time?: string;
  price?: string;
  coverImage?: string;
  creatorId: string;
  createdAt: string;
};

type UsersMap = Record<string, User>;
type EventsMap = Record<string, Event>;
type LikesMap = Record<string, string[]>; // userId -> eventIds
type RegistrationsMap = Record<string, string[]>; // eventId -> userIds

/* =======================
   STORAGE KEYS
======================= */

const KEYS = {
  CURRENT_USER: '@current_user',
  EVENTS: '@events',
  USERS: '@users',
  LIKES: '@likes',
  REGISTRATIONS: '@registrations',
};

/* =======================
   USER SESSION
======================= */

export const saveCurrentUser = async (user: User): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    return true;
  } catch (error) {
    console.error('Error saving current user:', error);
    return false;
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const user = await AsyncStorage.getItem(KEYS.CURRENT_USER);
    return user ? (JSON.parse(user) as User) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const logout = async (): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(KEYS.CURRENT_USER);
    return true;
  } catch (error) {
    console.error('Error logging out:', error);
    return false;
  }
};

/* =======================
   USERS
======================= */

export const saveUser = async (user: User): Promise<boolean> => {
  try {
    const users = await getUsers();
    users[user.id] = user;
    await AsyncStorage.setItem(KEYS.USERS, JSON.stringify(users));
    return true;
  } catch (error) {
    console.error('Error saving user:', error);
    return false;
  }
};

export const getUsers = async (): Promise<UsersMap> => {
  try {
    const users = await AsyncStorage.getItem(KEYS.USERS);
    return users ? (JSON.parse(users) as UsersMap) : {};
  } catch (error) {
    console.error('Error getting users:', error);
    return {};
  }
};

export const getUserByUsername = async (
  username: string
): Promise<User | null> => {
  try {
    const users = await getUsers();
    return (
      Object.values(users).find(
        user => user.username.toLowerCase() === username.toLowerCase()
      ) || null
    );
  } catch (error) {
    console.error('Error getting user by username:', error);
    return null;
  }
};

/* =======================
   EVENTS
======================= */

export const saveEvent = async (event: Event): Promise<boolean> => {
  try {
    const events = await getEvents();
    events[event.id] = event;
    await AsyncStorage.setItem(KEYS.EVENTS, JSON.stringify(events));
    return true;
  } catch (error) {
    console.error('Error saving event:', error);
    return false;
  }
};

export const getEvents = async (): Promise<EventsMap> => {
  try {
    const events = await AsyncStorage.getItem(KEYS.EVENTS);
    return events ? (JSON.parse(events) as EventsMap) : {};
  } catch (error) {
    console.error('Error getting events:', error);
    return {};
  }
};

export const getEventById = async (eventId: string): Promise<Event | null> => {
  try {
    const events = await getEvents();
    return events[eventId] || null;
  } catch (error) {
    console.error('Error getting event by id:', error);
    return null;
  }
};

export const getAllEventsArray = async (): Promise<Event[]> => {
  try {
    const events = await getEvents();
    return Object.values(events).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error('Error getting events array:', error);
    return [];
  }
};

export const deleteEvent = async (eventId: string): Promise<boolean> => {
  try {
    const events = await getEvents();
    delete events[eventId];
    await AsyncStorage.setItem(KEYS.EVENTS, JSON.stringify(events));
    return true;
  } catch (error) {
    console.error('Error deleting event:', error);
    return false;
  }
};

/* =======================
   LIKES
======================= */

export const getLikes = async (): Promise<LikesMap> => {
  try {
    const likes = await AsyncStorage.getItem(KEYS.LIKES);
    return likes ? (JSON.parse(likes) as LikesMap) : {};
  } catch (error) {
    console.error('Error getting likes:', error);
    return {};
  }
};

export const likeEvent = async (
  userId: string,
  eventId: string
): Promise<boolean> => {
  try {
    const likes = await getLikes();
    likes[userId] = likes[userId] || [];
    if (!likes[userId].includes(eventId)) {
      likes[userId].push(eventId);
      await AsyncStorage.setItem(KEYS.LIKES, JSON.stringify(likes));
    }
    return true;
  } catch (error) {
    console.error('Error liking event:', error);
    return false;
  }
};

export const unlikeEvent = async (
  userId: string,
  eventId: string
): Promise<boolean> => {
  try {
    const likes = await getLikes();
    if (likes[userId]) {
      likes[userId] = likes[userId].filter(id => id !== eventId);
      await AsyncStorage.setItem(KEYS.LIKES, JSON.stringify(likes));
    }
    return true;
  } catch (error) {
    console.error('Error unliking event:', error);
    return false;
  }
};

export const getUserLikes = async (userId: string): Promise<string[]> => {
  try {
    const likes = await getLikes();
    return likes[userId] || [];
  } catch (error) {
    console.error('Error getting user likes:', error);
    return [];
  }
};

export const isEventLiked = async (
  userId: string,
  eventId: string
): Promise<boolean> => {
  const likes = await getUserLikes(userId);
  return likes.includes(eventId);
};

/* =======================
   REGISTRATIONS
======================= */

export const getRegistrations = async (): Promise<RegistrationsMap> => {
  try {
    const registrations = await AsyncStorage.getItem(KEYS.REGISTRATIONS);
    return registrations
      ? (JSON.parse(registrations) as RegistrationsMap)
      : {};
  } catch (error) {
    console.error('Error getting registrations:', error);
    return {};
  }
};

export const registerForEvent = async (
  userId: string,
  eventId: string
): Promise<boolean> => {
  try {
    const registrations = await getRegistrations();
    registrations[eventId] = registrations[eventId] || [];
    if (!registrations[eventId].includes(userId)) {
      registrations[eventId].push(userId);
      await AsyncStorage.setItem(
        KEYS.REGISTRATIONS,
        JSON.stringify(registrations)
      );
    }
    return true;
  } catch (error) {
    console.error('Error registering for event:', error);
    return false;
  }
};

export const getEventRegistrations = async (
  eventId: string
): Promise<string[]> => {
  const registrations = await getRegistrations();
  return registrations[eventId] || [];
};

export const isUserRegistered = async (
  userId: string,
  eventId: string
): Promise<boolean> => {
  const registrations = await getEventRegistrations(eventId);
  return registrations.includes(userId);
};

export const getEventStats = async (
  eventId: string
): Promise<{ registrations: number; likes: number }> => {
  try {
    const registrations = await getEventRegistrations(eventId);
    const likes = await getLikes();

    let likesCount = 0;
    Object.values(likes).forEach(userLikes => {
      if (userLikes.includes(eventId)) likesCount++;
    });

    return {
      registrations: registrations.length,
      likes: likesCount,
    };
  } catch (error) {
    console.error('Error getting event stats:', error);
    return { registrations: 0, likes: 0 };
  }
};

/* =======================
   CLEAR DATA
======================= */

export const clearAllData = async (): Promise<boolean> => {
  try {
    await AsyncStorage.multiRemove(Object.values(KEYS));
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
};
