// Mobile Chat Message Bubble Component

import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, radius } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Icon } from '../icons/Icon';

export interface MessageBubbleProps {
  id: string;
  text: string;
  timestamp: string;
  isSelf: boolean;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'file';
  mediaName?: string;
  status?: 'SENT' | 'DELIVERED' | 'READ';
  onMediaPress?: (url: string, type: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  text,
  timestamp,
  isSelf,
  mediaUrl,
  mediaType,
  mediaName,
  status = 'SENT',
  onMediaPress
}) => {
  const formatTime = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <View style={[styles.container, isSelf ? styles.selfContainer : styles.otherContainer]}>
      <View
        style={[
          styles.bubble,
          isSelf ? styles.selfBubble : styles.otherBubble,
          Boolean(mediaUrl && !text) && styles.mediaOnlyBubble
        ]}
      >
        {/* Media Preview if attached */}
        {mediaUrl && (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => onMediaPress?.(mediaUrl, mediaType || 'image')}
            style={styles.mediaContainer}
          >
            {mediaType === 'image' ? (
              <Image source={{ uri: mediaUrl }} style={styles.imagePreview} resizeMode="cover" />
            ) : mediaType === 'video' ? (
              <View style={styles.videoPlaceholder}>
                <Icon name="play" size={32} color={colors.white} />
                <Text style={styles.videoLabel}>Play Video</Text>
              </View>
            ) : (
              <View style={styles.fileBox}>
                <Icon name="file" size={20} color={isSelf ? colors.white : colors.primary} />
                <Text
                  style={[styles.fileName, { color: isSelf ? colors.white : colors.textMain }]}
                  numberOfLines={1}
                >
                  {mediaName || 'Attachment'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* Text Message */}
        {text ? (
          <Text style={[styles.messageText, isSelf ? styles.selfText : styles.otherText]}>
            {text}
          </Text>
        ) : null}

        {/* Footer: Time & Read Status */}
        <View style={styles.footerRow}>
          <Text style={[styles.timeText, isSelf ? styles.selfTimeText : styles.otherTimeText]}>
            {formatTime(timestamp)}
          </Text>
          {isSelf && (
            <Icon
              name="check"
              size={12}
              color={status === 'READ' ? colors.verified : 'rgba(255,255,255,0.7)'}
              style={{ marginLeft: 3 }}
            />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: spacing.md,
    flexDirection: 'row'
  },
  selfContainer: {
    justifyContent: 'flex-end'
  },
  otherContainer: {
    justifyContent: 'flex-start'
  },
  bubble: {
    maxWidth: '82%',
    paddingVertical: 9,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg
  },
  mediaOnlyBubble: {
    padding: 3
  },
  selfBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 2
  },
  otherBubble: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 2
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20
  },
  selfText: {
    color: colors.white
  },
  otherText: {
    color: colors.textMain
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 2
  },
  timeText: {
    fontSize: 10
  },
  selfTimeText: {
    color: 'rgba(255, 255, 255, 0.75)'
  },
  otherTimeText: {
    color: colors.textMuted
  },
  mediaContainer: {
    borderRadius: radius.md,
    overflow: 'hidden',
    marginBottom: 4
  },
  imagePreview: {
    width: 220,
    height: 160,
    borderRadius: radius.md
  },
  videoPlaceholder: {
    width: 220,
    height: 130,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.md
  },
  videoLabel: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4
  },
  fileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    gap: 8,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(0,0,0,0.06)'
  },
  fileName: {
    fontSize: 13,
    fontWeight: '500',
    maxWidth: 160
  }
});
