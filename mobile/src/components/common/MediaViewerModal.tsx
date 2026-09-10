// Mobile Fullscreen Media Viewer Modal

import React, { useState } from 'react';
import {
  Modal,
  View,
  Image,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Share,
  ToastAndroid,
  Platform,
  ActivityIndicator
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { colors } from '../../theme/colors';
import { spacing, radius } from '../../theme/spacing';
import { Icon } from '../icons/Icon';

export interface MediaViewerModalProps {
  visible: boolean;
  mediaUrl: string | null;
  mediaType?: 'image' | 'video' | 'file';
  title?: string;
  onClose: () => void;
}

export const MediaViewerModal: React.FC<MediaViewerModalProps> = ({
  visible,
  mediaUrl,
  mediaType = 'image',
  title = 'Guidely Media',
  onClose
}) => {
  const [isSaving, setIsSaving] = useState(false);

  if (!visible || !mediaUrl) return null;

  const handleShare = async () => {
    try {
      await Share.share({
        title,
        message: mediaUrl,
        url: mediaUrl
      });
    } catch (e) {}
  };

  const handleSaveToGallery = async () => {
    setIsSaving(true);
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        if (Platform.OS === 'android') {
          ToastAndroid.show('Storage permission required to save', ToastAndroid.SHORT);
        }
        return;
      }

      const ext = mediaType === 'video' ? 'mp4' : 'jpg';
      const filename = `Guidely_${Date.now()}.${ext}`;
      const localUri = `${FileSystem.cacheDirectory}${filename}`;

      await FileSystem.downloadAsync(mediaUrl, localUri);
      await MediaLibrary.createAssetAsync(localUri);

      if (Platform.OS === 'android') {
        ToastAndroid.show('Saved to Gallery (Guidely)', ToastAndroid.SHORT);
      }
    } catch (err: any) {
      if (Platform.OS === 'android') {
        ToastAndroid.show('Failed to save to Gallery', ToastAndroid.SHORT);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.safeArea}>
          {/* Header Bar */}
          <View style={styles.headerBar}>
            <TouchableOpacity
              onPress={onClose}
              style={styles.actionBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="close" size={22} color={colors.white} />
            </TouchableOpacity>

            <View style={styles.headerRight}>
              <TouchableOpacity
                onPress={handleShare}
                style={styles.actionBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="share" size={20} color={colors.white} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSaveToGallery}
                disabled={isSaving}
                style={styles.actionBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Icon name="download" size={20} color={colors.white} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Media Viewport */}
          <View style={styles.mediaContainer}>
            {mediaType === 'image' ? (
              <Image
                source={{ uri: mediaUrl }}
                style={styles.fullImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.videoBox}>
                <Icon name="play" size={56} color={colors.white} />
                <Text style={styles.videoText}>Video Preview</Text>
                <Text style={styles.videoUrl} numberOfLines={1}>
                  {mediaUrl}
                </Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)'
  },
  safeArea: {
    flex: 1
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md
  },
  headerRight: {
    flexDirection: 'row',
    gap: spacing.md
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  mediaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md
  },
  fullImage: {
    width: '100%',
    height: '100%'
  },
  videoBox: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12
  },
  videoText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600'
  },
  videoUrl: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    maxWidth: 260
  }
});
