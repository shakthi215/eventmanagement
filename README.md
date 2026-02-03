# Event Management App

A React Native (Expo) app for creating, browsing, liking, and registering for events. Built to match the provided Figma flow with passwordless authentication.

## Features
- Username-only login and signup (no password)
- Persistent user session and data (AsyncStorage)
- Create, edit, and publish events
- Like/unlike events
- Register for events (one-time per user)
- Profile with liked events and created events
- Bottom navigation between Home and Profile

## Tech Stack
- Expo + React Native
- Expo Router (file-based routing)
- AsyncStorage for persistence

## Setup
1. Install dependencies

```bash
npm install
```

2. Start the app

```bash
npx expo start
```

## Notes
- Login/Signup are custom screens (not in Figma) per task requirements.
- Event data is persisted locally and survives app restarts.

