// Array of avatar URLs from UI Avatars or similar services
const AVATAR_STYLES = [
  'adventurer',
  'avataaars',
  'bottts',
  'fun-emoji',
  'micah',
  'personas',
];

const BACKGROUND_COLORS = [
  '007AFF',
  '5856D6',
  '34C759',
  'FF9500',
  'FF3B30',
  '5AC8FA',
];

export const generateRandomAvatar = (username: string): string => {
  const style = AVATAR_STYLES[Math.floor(Math.random() * AVATAR_STYLES.length)];
  const bgColor = BACKGROUND_COLORS[Math.floor(Math.random() * BACKGROUND_COLORS.length)];
  
  // Using DiceBear API for random avatars
  return `https://api.dicebear.com/7.x/${style}/png?seed=${username}&backgroundColor=${bgColor}`;
};

// Fallback to UI Avatars if needed
export const getInitialsAvatar = (name: string): string => {
  const initials = name
    .trim()
    .split(' ')
    .filter(Boolean)
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
  
  const bgColor = BACKGROUND_COLORS[Math.floor(Math.random() * BACKGROUND_COLORS.length)];
  return `https://ui-avatars.com/api/?name=${initials}&background=${bgColor}&color=fff&size=200`;
};
