import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import colors from '../constants/colors';

type HeaderProps = {
  title: string;
  onBackPress?: () => void;
  onRightPress?: () => void;
  rightIcon?: React.ComponentProps<typeof Ionicons>['name'];
  rightText?: string;
  showBack?: boolean;
};

export default function Header({
  title,
  onBackPress,
  onRightPress,
  rightIcon,
  rightText,
  showBack = true,
}: HeaderProps) {
  return (
    <View style={styles.container}>
      {/* Left Button */}
      <View style={styles.leftContainer}>
        {showBack && onBackPress ? (
          <TouchableOpacity onPress={onBackPress} style={styles.button}>
            <Ionicons name="chevron-back" size={28} color={colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      {/* Title */}
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      {/* Right Button */}
      <View style={styles.rightContainer}>
        {onRightPress && rightIcon ? (
          <TouchableOpacity onPress={onRightPress} style={styles.button}>
            <Ionicons name={rightIcon} size={28} color={colors.text} />
          </TouchableOpacity>
        ) : onRightPress && rightText ? (
          <TouchableOpacity onPress={onRightPress} style={styles.button}>
            <Text style={styles.rightText}>{rightText}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: colors.background,
  },
  leftContainer: {
    width: 40,
    alignItems: 'flex-start',
  },
  rightContainer: {
    width: 40,
    alignItems: 'flex-end',
  },
  button: {
    padding: 4,
  },
  placeholder: {
    width: 28,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  rightText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
});
