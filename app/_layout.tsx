import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { getCurrentUser } from "../services/storage";

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        setIsAuthenticated(!!user);
      } catch {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return null; // you can add splash / loader later
  }

  const screens = isAuthenticated
    ? ['index', 'profile', 'events/index', 'events/create', 'events/edit', 'events/[id]']
    : ['login', 'signup'];

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {screens.map((name) => (
        <Stack.Screen key={name} name={name} />
      ))}
    </Stack>
  );
}
