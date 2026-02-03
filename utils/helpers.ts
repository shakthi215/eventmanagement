export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };
  return date.toLocaleDateString('en-US', options);
};

export const formatTime = (timeString?: string): string => {
  if (!timeString) return '';
  return timeString;
};

export const formatDateTime = (dateString: string, timeString?: string): string => {
  const date = formatDate(dateString);
  if (!timeString) return date;
  return `${date} - ${timeString}`;
};

export const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

export const formatPrice = (price?: string | number | null): string => {
  if (!price || price === '0' || price === 0) return 'Free';
  const numericPrice =
    typeof price === 'number' ? price : parseFloat(price);
  return `$${numericPrice.toFixed(2)}`;
};

export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
};

export const getEventImagePlaceholder = (): string => {
  const images = [
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
    'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
  ];
  return images[Math.floor(Math.random() * images.length)];
};
