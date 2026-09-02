// In-App Toast Context & Notification Provider

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { colors } from '../theme/colors';
import { spacing, radius, shadows } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Icon } from '../components/icons/Icon';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, title: string, message?: string, duration: number = 3500) => {
    const id = Date.now().toString() + Math.random().toString();
    const newToast: ToastMessage = { id, type, title, message, duration };
    setToasts(prev => [newToast, ...prev.slice(0, 2)]);

    setTimeout(() => {
      hideToast(id);
    }, duration);
  }, [hideToast]);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {/* Toast Overlay Container */}
      <SafeAreaView pointerEvents="box-none" style={styles.toastContainer}>
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onDismiss={() => hideToast(toast.id)} />
        ))}
      </SafeAreaView>
    </ToastContext.Provider>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: () => void }> = ({ toast, onDismiss }) => {
  const translateY = useRef(new Animated.Value(-60)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        friction: 6,
        useNativeDriver: true
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      })
    ]).start();
  }, [opacity, translateY]);

  const getTheme = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: colors.successLight,
          border: colors.successBorder,
          iconColor: colors.successDark,
          iconName: 'check-circle'
        };
      case 'error':
        return {
          bg: colors.dangerLight,
          border: colors.dangerBorder,
          iconColor: colors.dangerDark,
          iconName: 'alert-circle'
        };
      case 'warning':
        return {
          bg: colors.warningLight,
          border: colors.warningBorder,
          iconColor: colors.warningDark,
          iconName: 'clock'
        };
      case 'info':
      default:
        return {
          bg: colors.infoLight,
          border: colors.infoBorder,
          iconColor: colors.info,
          iconName: 'bell'
        };
    }
  };

  const currentTheme = getTheme();

  return (
    <Animated.View
      style={[
        styles.toastCard,
        {
          backgroundColor: currentTheme.bg,
          borderColor: currentTheme.border,
          transform: [{ translateY }],
          opacity
        }
      ]}
    >
      <TouchableOpacity activeOpacity={0.9} onPress={onDismiss} style={styles.toastContent}>
        <View style={styles.iconSlot}>
          <Icon name={currentTheme.iconName as any} size={20} color={currentTheme.iconColor} />
        </View>
        <View style={styles.textSlot}>
          <Text style={[typography.h4, { fontSize: 14, color: colors.textMain }]}>
            {toast.title}
          </Text>
          {toast.message ? (
            <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>
              {toast.message}
            </Text>
          ) : null}
        </View>
        <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Icon name="close" size={16} color={colors.textSubtle} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 36 : 12,
    left: 16,
    right: 16,
    zIndex: 99999,
    alignItems: 'center'
  },
  toastCard: {
    width: '100%',
    borderRadius: radius.md,
    borderWidth: 1.5,
    padding: spacing.md,
    marginBottom: spacing.xs,
    ...shadows.md
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  iconSlot: {
    marginRight: spacing.md
  },
  textSlot: {
    flex: 1,
    paddingRight: spacing.sm
  }
});

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
