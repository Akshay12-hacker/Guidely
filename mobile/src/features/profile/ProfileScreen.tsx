// Mobile Profile & Settings Screen with Android Grouped Settings

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Platform,
  ToastAndroid
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Avatar } from '../../components/common/Avatar';
import { Badge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import { Chip } from '../../components/common/Chip';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { TextArea } from '../../components/common/TextArea';
import { Icon } from '../../components/icons/Icon';
import { colors } from '../../theme/colors';
import { spacing, radius } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { studentService } from '../../services/student.service';
import { mentorService } from '../../services/mentor.service';
import { apiClient } from '../../api/client';

export interface ProfileScreenProps {
  onNavigateToOnboarding?: () => void;
  onNavigate?: (route: string, params?: any) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onNavigateToOnboarding,
  onNavigate
}) => {
  const { user, profile, logout, refreshUser } = useAuth();
  const { showToast } = useToast();

  const isStudent = user?.role === 'STUDENT';
  const isMentor = user?.role === 'MENTOR';
  const anyProfile = profile as any;

  // Settings State
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailNotifsEnabled, setEmailNotifsEnabled] = useState(true);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Edit form state
  const [editBio, setEditBio] = useState(anyProfile?.bio || anyProfile?.headline || '');
  const [editCollege, setEditCollege] = useState(anyProfile?.college || anyProfile?.company || '');
  const [editDegree, setEditDegree] = useState(anyProfile?.degree || anyProfile?.jobTitle || '');

  // Photo Upload via Expo ImagePicker
  const handlePickAvatar = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        if (Platform.OS === 'android') {
          ToastAndroid.show('Gallery permission required', ToastAndroid.SHORT);
        }
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8
      });

      if (!result.canceled && result.assets[0]?.uri) {
        const localUri = result.assets[0].uri;
        if (Platform.OS === 'android') {
          ToastAndroid.show('Uploading profile photo...', ToastAndroid.SHORT);
        }
        try {
          const uploaded = await apiClient.uploadImage(localUri);
          if (uploaded?.secureUrl || uploaded?.url) {
            const avatarUrl = uploaded.secureUrl || uploaded.url;
            if (isStudent) {
              await studentService.updateProfile({ avatarUrl } as any);
            } else if (isMentor) {
              await mentorService.updateProfile({ avatarUrl } as any);
            }
            await refreshUser();
            showToast('success', 'Profile Photo Updated', 'Your new avatar is saved.');
          }
        } catch (uploadErr) {
          showToast('error', 'Upload Failed', 'Could not upload photo. Using local preview.');
        }
      }
    } catch (e) {}
  };

  const handleSaveProfile = async () => {
    setIsUpdating(true);
    try {
      if (isStudent) {
        await studentService.updateProfile({
          bio: editBio,
          college: editCollege,
          degree: editDegree
        } as any);
      } else if (isMentor) {
        await mentorService.updateProfile({
          bio: editBio,
          company: editCollege,
          headline: editDegree
        } as any);
      }
      await refreshUser();
      setIsEditModalVisible(false);
      showToast('success', 'Profile Updated', 'Your profile details have been saved.');
    } catch (err: any) {
      showToast('error', 'Update Failed', err?.message || 'Could not update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogoutPress = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to sign out of Guidely?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => logout()
        }
      ]
    );
  };

  const completionPercentage = anyProfile?.isCompleted ? 100 : 75;
  const skillsList: string[] = anyProfile?.skills || anyProfile?.targetTechnologies || [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* User Header Card */}
      <Card padding="lg" style={styles.headerCard}>
        <View style={styles.avatarWrapper}>
          <Avatar name={user?.fullName || 'User'} src={user?.avatarUrl} size="xl" />
          <TouchableOpacity activeOpacity={0.8} onPress={handlePickAvatar} style={styles.cameraBadge}>
            <Icon name="camera" size={16} color={colors.white} />
          </TouchableOpacity>
        </View>

        <Text style={[typography.h2, styles.nameText]}>{user?.fullName}</Text>
        <Text style={[typography.body, styles.emailText]}>{user?.email}</Text>

        <View style={styles.roleBadgeRow}>
          <Badge
            variant={isMentor ? 'primary' : isStudent ? 'info' : 'success'}
          >
            {user?.role || 'STUDENT'}
          </Badge>
          {anyProfile?.isVerified && (
            <Badge variant="success" style={{ marginLeft: 6 }}>
              Verified
            </Badge>
          )}
        </View>

        {anyProfile?.headline ? (
          <Text style={[typography.caption, styles.headlineText]}>{anyProfile.headline}</Text>
        ) : null}

        <Button
          onPress={() => {
            setEditBio(anyProfile?.bio || anyProfile?.headline || '');
            setEditCollege(anyProfile?.college || anyProfile?.company || '');
            setEditDegree(anyProfile?.degree || anyProfile?.jobTitle || '');
            setIsEditModalVisible(true);
          }}
          variant="outline"
          size="sm"
          style={styles.editBtn}
        >
          Edit Profile
        </Button>
      </Card>

      {/* Profile Completion Progress */}
      {completionPercentage < 100 && (
        <Card padding="md" style={styles.sectionCard}>
          <View style={styles.completionHeader}>
            <Text style={[typography.h4, { color: colors.textMain }]}>Profile Completion</Text>
            <Text style={[typography.captionBold, { color: colors.primary }]}>{completionPercentage}%</Text>
          </View>
          <View style={{ marginVertical: spacing.xs }}>
            <ProgressBar value={completionPercentage} color={colors.primary} />
          </View>
          <Text style={[typography.caption, { color: colors.textMuted, marginTop: 4 }]}>
            Complete your onboarding details to get higher mentor matching accuracy.
          </Text>
          {onNavigateToOnboarding && (
            <TouchableOpacity onPress={onNavigateToOnboarding} style={{ marginTop: 8 }}>
              <Text style={[typography.captionBold, { color: colors.primary }]}>
                Continue Onboarding →
              </Text>
            </TouchableOpacity>
          )}
        </Card>
      )}

      {/* Skills Section */}
      {skillsList.length > 0 && (
        <Card padding="md" style={styles.sectionCard}>
          <Text style={[typography.h4, styles.sectionTitle]}>
            {isMentor ? 'Expertise & Skills' : 'Target Technologies'}
          </Text>
          <View style={styles.chipsRow}>
            {skillsList.map((skill, idx) => (
              <Chip key={idx} label={skill} variant="tag" />
            ))}
          </View>
        </Card>
      )}

      {/* Grouped Android Settings: Preferences */}
      <Text style={styles.groupHeading}>NOTIFICATIONS & PREFERENCES</Text>
      <Card padding="none" style={styles.settingsGroupCard}>
        <View style={styles.settingItem}>
          <View style={styles.settingLabelCol}>
            <Text style={[typography.bodyBold, styles.settingLabel]}>Push Notifications</Text>
            <Text style={[typography.caption, styles.settingSub]}>Receive instant alerts on Android</Text>
          </View>
          <Switch
            value={pushEnabled}
            onValueChange={setPushEnabled}
            trackColor={{ false: colors.border, true: colors.primaryLight }}
            thumbColor={pushEnabled ? colors.primary : '#FFFFFF'}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.settingItem}>
          <View style={styles.settingLabelCol}>
            <Text style={[typography.bodyBold, styles.settingLabel]}>Email Updates</Text>
            <Text style={[typography.caption, styles.settingSub]}>Session reminders & reports</Text>
          </View>
          <Switch
            value={emailNotifsEnabled}
            onValueChange={setEmailNotifsEnabled}
            trackColor={{ false: colors.border, true: colors.primaryLight }}
            thumbColor={emailNotifsEnabled ? colors.primary : '#FFFFFF'}
          />
        </View>
      </Card>

      {/* App Information */}
      <Text style={styles.groupHeading}>ABOUT GUIDELY</Text>
      <Card padding="none" style={styles.settingsGroupCard}>

        <View style={styles.settingActionItem}>
          <View style={styles.settingLabelCol}>
            <Text style={[typography.bodyBold, styles.settingLabel]}>Guidely Version</Text>
            <Text style={[typography.caption, styles.settingSub]}>1.0.0 (Production Native Build)</Text>
          </View>
          <Badge variant="neutral">Android</Badge>
        </View>
      </Card>

      {/* Logout Action */}
      <TouchableOpacity activeOpacity={0.8} onPress={handleLogoutPress} style={styles.logoutBtn}>
        <Icon name="logout" size={18} color={colors.danger} style={{ marginRight: 8 }} />
        <Text style={styles.logoutBtnText}>Sign Out of Guidely</Text>
      </TouchableOpacity>

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditModalVisible}
        title="Edit Profile"
        onClose={() => setIsEditModalVisible(false)}
      >
        <View style={{ gap: spacing.md }}>
          <Input
            label={isMentor ? 'Current Company / Org' : 'College / University'}
            value={editCollege}
            onChangeText={setEditCollege}
            placeholder={isMentor ? 'e.g. Google India' : 'e.g. IIT Delhi'}
          />
          <Input
            label={isMentor ? 'Job Title / Headline' : 'Degree / Major'}
            value={editDegree}
            onChangeText={setEditDegree}
            placeholder={isMentor ? 'e.g. Staff Engineer' : 'e.g. B.Tech Computer Science'}
          />
          <TextArea
            label="Bio & About"
            value={editBio}
            onChangeText={setEditBio}
            placeholder="Tell mentors and peers about your background and interests..."
            rows={4}
          />

          <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
            <Button
              onPress={() => setIsEditModalVisible(false)}
              variant="outline"
              style={{ flex: 1 }}
            >
              Cancel
            </Button>
            <Button
              onPress={handleSaveProfile}
              isLoading={isUpdating}
              variant="primary"
              style={{ flex: 1 }}
            >
              Save Changes
            </Button>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl
  },
  headerCard: {
    alignItems: 'center',
    marginBottom: spacing.md
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: spacing.sm
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 32,
    height: 32,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.surface
  },
  nameText: {
    color: colors.textMain,
    textAlign: 'center'
  },
  emailText: {
    color: colors.textMuted,
    marginTop: 2
  },
  roleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs
  },
  headlineText: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md
  },
  editBtn: {
    marginTop: spacing.md,
    minWidth: 140
  },
  sectionCard: {
    marginBottom: spacing.md
  },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  sectionTitle: {
    color: colors.textMain,
    marginBottom: spacing.sm
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs
  },
  groupHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.8,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    marginLeft: spacing.xs
  },
  settingsGroupCard: {
    marginBottom: spacing.md,
    borderRadius: radius.lg,
    overflow: 'hidden'
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md
  },
  settingActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md
  },
  settingLabelCol: {
    flex: 1,
    marginRight: spacing.md
  },
  settingLabel: {
    color: colors.textMain
  },
  settingSub: {
    color: colors.textMuted,
    marginTop: 2
  },
  divider: {
    height: 1,
    backgroundColor: colors.border
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.dangerLight,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.dangerBorder
  },
  logoutBtnText: {
    color: colors.danger,
    fontSize: 15,
    fontWeight: '700'
  }
});
