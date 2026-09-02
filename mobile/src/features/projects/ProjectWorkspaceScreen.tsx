// Mobile Collaborative Project Workspace Screen

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity,
  Linking
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { projectService } from '../../services/project.service';
import {
  Project,
  ProjectGoal,
  ProjectMilestone,
  ProjectTask,
  ProjectResource,
  ProjectNote,
  TaskPriority,
  TaskStatus
} from '../../types';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Input } from '../../components/common/Input';
import { TextArea } from '../../components/common/TextArea';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/common/Skeleton';
import { Icon } from '../../components/icons/Icon';
import { colors } from '../../theme/colors';
import { spacing, radius, shadows } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { formatDate } from '../../utils/formatters';

export interface ProjectWorkspaceScreenProps {
  projectId?: string;
  onBack?: () => void;
  onNavigate: (route: string, params?: any) => void;
}

export const ProjectWorkspaceScreen: React.FC<ProjectWorkspaceScreenProps> = ({
  projectId: initialProjectId,
  onBack,
  onNavigate
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'GOALS' | 'TASKS' | 'RESOURCES' | 'NOTES'>('OVERVIEW');
  const [projectId, setProjectId] = useState<string | null>(initialProjectId || null);
  const [workspaceData, setWorkspaceData] = useState<{
    project: Project;
    goals: ProjectGoal[];
    milestones: ProjectMilestone[];
    tasks: ProjectTask[];
    resources: ProjectResource[];
    notes: ProjectNote[];
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [isAddGoalModalVisible, setIsAddGoalModalVisible] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');

  const [isAddTaskModalVisible, setIsAddTaskModalVisible] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('MEDIUM');
  const [newTaskAssignee, setNewTaskAssignee] = useState<'STUDENT' | 'MENTOR'>('STUDENT');

  const [isAddResourceModalVisible, setIsAddResourceModalVisible] = useState(false);
  const [newResTitle, setNewResTitle] = useState('');
  const [newResUrl, setNewResUrl] = useState('');

  const [isAddNoteModalVisible, setIsAddNoteModalVisible] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteIsPrivate, setNewNoteIsPrivate] = useState(false);

  const fetchWorkspace = useCallback(async () => {
    try {
      let targetId = projectId;
      if (!targetId) {
        const myProjects = await projectService.getMyProjects();
        if (myProjects.length > 0) {
          targetId = myProjects[0].id;
          setProjectId(targetId);
        }
      }

      if (targetId) {
        const res = await projectService.getWorkspace(targetId);
        setWorkspaceData(res);
      }
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchWorkspace();
  }, [fetchWorkspace]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchWorkspace();
  };

  // Goal Toggle
  const handleToggleGoal = async (goal: ProjectGoal) => {
    if (!projectId) return;
    try {
      await projectService.updateGoal(projectId, goal.id, { isCompleted: !goal.isCompleted });
      fetchWorkspace();
      showToast('success', goal.isCompleted ? 'Goal marked incomplete' : 'Goal completed! 🎯');
    } catch (err: any) {
      showToast('error', 'Update Failed', err.message);
    }
  };

  // Goal Add
  const handleAddGoal = async () => {
    if (!projectId || !newGoalTitle.trim()) return;
    try {
      await projectService.addGoal(projectId, { title: newGoalTitle.trim() });
      setIsAddGoalModalVisible(false);
      setNewGoalTitle('');
      fetchWorkspace();
      showToast('success', 'Goal Added');
    } catch (err: any) {
      showToast('error', 'Add Failed', err.message);
    }
  };

  // Task Add
  const handleAddTask = async () => {
    if (!projectId || !newTaskTitle.trim()) return;
    try {
      await projectService.addTask(projectId, {
        title: newTaskTitle.trim(),
        description: newTaskDesc.trim(),
        priority: newTaskPriority,
        assigneeRole: newTaskAssignee
      });
      setIsAddTaskModalVisible(false);
      setNewTaskTitle('');
      setNewTaskDesc('');
      fetchWorkspace();
      showToast('success', 'Task Created 📋');
    } catch (err: any) {
      showToast('error', 'Create Task Failed', err.message);
    }
  };

  // Task Status Cycle
  const handleCycleTaskStatus = async (task: ProjectTask) => {
    if (!projectId) return;
    const nextStatus: Record<TaskStatus, TaskStatus> = {
      TODO: 'IN_PROGRESS',
      IN_PROGRESS: 'IN_REVIEW',
      IN_REVIEW: 'DONE',
      DONE: 'TODO'
    };
    try {
      await projectService.updateTask(projectId, task.id, { status: nextStatus[task.status] });
      fetchWorkspace();
      showToast('info', 'Task Updated', `Moved to ${nextStatus[task.status].replace('_', ' ')}`);
    } catch (err: any) {
      showToast('error', 'Status Update Failed', err.message);
    }
  };

  // Resource Add
  const handleAddResource = async () => {
    if (!projectId || !newResTitle.trim() || !newResUrl.trim()) return;
    try {
      await projectService.addResource(projectId, {
        title: newResTitle.trim(),
        url: newResUrl.trim(),
        type: 'LINK'
      });
      setIsAddResourceModalVisible(false);
      setNewResTitle('');
      setNewResUrl('');
      fetchWorkspace();
      showToast('success', 'Resource Attached 📎');
    } catch (err: any) {
      showToast('error', 'Add Resource Failed', err.message);
    }
  };

  // Note Add
  const handleAddNote = async () => {
    if (!projectId || !newNoteTitle.trim() || !newNoteContent.trim()) return;
    try {
      await projectService.addNote(projectId, {
        title: newNoteTitle.trim(),
        content: newNoteContent.trim(),
        isPrivateToMentor: newNoteIsPrivate
      });
      setIsAddNoteModalVisible(false);
      setNewNoteTitle('');
      setNewNoteContent('');
      fetchWorkspace();
      showToast('success', 'Note Saved 📝');
    } catch (err: any) {
      showToast('error', 'Save Note Failed', err.message);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header showBack={!!onBack} onBack={onBack} title="Project Workspace" />
        <View style={{ padding: spacing.lg }}>
          <CardSkeleton />
          <CardSkeleton />
        </View>
      </SafeAreaView>
    );
  }

  if (!workspaceData?.project) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header showBack={!!onBack} onBack={onBack} title="Project Workspace" />
        <View style={{ padding: spacing.lg }}>
          <EmptyState
            iconName="folder-kanban"
            title="No Active Project"
            description="You are currently not enrolled in an active project workspace. Request mentorship or check pending proposals."
            actionText="Find Mentors"
            onAction={() => onNavigate('discover')}
          />
        </View>
      </SafeAreaView>
    );
  }

  const { project, goals = [], milestones = [], tasks = [], resources = [], notes = [] } = workspaceData;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        showBack={!!onBack}
        onBack={onBack}
        title={project.title}
        subtitle={`${project.currentStage} • ${project.progressPercentage}% complete`}
      />

      {/* Navigation Sub-Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsBar}
      >
        {[
          { id: 'OVERVIEW', label: 'Overview', icon: 'compass' },
          { id: 'GOALS', label: `Goals (${goals.length})`, icon: 'check-circle' },
          { id: 'TASKS', label: `Tasks (${tasks.length})`, icon: 'folder-kanban' },
          { id: 'RESOURCES', label: `Docs (${resources.length})`, icon: 'paperclip' },
          { id: 'NOTES', label: `Notes (${notes.length})`, icon: 'edit' }
        ].map(t => {
          const isActive = activeTab === t.id;
          return (
            <TouchableOpacity
              key={t.id}
              activeOpacity={0.8}
              onPress={() => setActiveTab(t.id as any)}
              style={[styles.tabChip, isActive && styles.activeTabChip]}
            >
              <Icon
                name={t.icon as any}
                size={14}
                color={isActive ? colors.primary : colors.textMuted}
              />
              <Text
                style={[
                  typography.captionBold,
                  { color: isActive ? colors.primary : colors.textMuted, fontSize: 12 }
                ]}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Tab Body */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {/* OVERVIEW TAB */}
        {activeTab === 'OVERVIEW' && (
          <View>
            <Card padding="lg" style={styles.sectionCard}>
              <View style={styles.statusRow}>
                <Badge variant={project.status === 'COMPLETED' ? 'completed' : 'in_progress'}>
                  {project.status}
                </Badge>
                <Badge variant="primary" size="sm">{project.currentStage}</Badge>
              </View>

              <Text style={[typography.h3, styles.overviewTitle]}>{project.title}</Text>
              <Text style={[typography.body, styles.overviewDesc]}>{project.description}</Text>

              <View style={styles.progressContainer}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={[typography.captionBold, { color: colors.textMuted }]}>Collaborative Progress</Text>
                  <Text style={[typography.captionBold, { color: colors.primary }]}>{project.progressPercentage}%</Text>
                </View>
                <ProgressBar value={project.progressPercentage} size="lg" />
              </View>

              {/* Technologies */}
              <View style={styles.techTagsRow}>
                {project.targetTechnologies?.map(t => (
                  <Badge key={t} variant="neutral" size="sm" style={{ marginRight: 4, marginTop: 4 }}>
                    {t}
                  </Badge>
                ))}
              </View>
            </Card>

            {/* Participants Card */}
            <Card padding="lg" style={styles.sectionCard}>
              <Text style={[typography.h4, styles.sectionHeading]}>Project Collaboration Team</Text>
              <View style={styles.teamMemberRow}>
                <Avatar name={project.student?.fullName || 'Student'} src={project.student?.avatarUrl} size="md" />
                <View style={{ marginLeft: spacing.md, flex: 1 }}>
                  <Text style={[typography.bodyBold, { color: colors.textMain }]}>{project.student?.fullName || 'Student'}</Text>
                  <Text style={[typography.caption, { color: colors.textMuted }]}>
                    Student Builder • {project.student?.college || 'Computer Science'}
                  </Text>
                </View>
                <Badge variant="neutral" size="sm">Student</Badge>
              </View>

              {project.mentor && (
                <View style={[styles.teamMemberRow, { marginTop: spacing.md }]}>
                  <Avatar name={project.mentor.fullName || 'Mentor'} src={project.mentor.avatarUrl} size="md" isVerified />
                  <View style={{ marginLeft: spacing.md, flex: 1 }}>
                    <Text style={[typography.bodyBold, { color: colors.textMain }]}>{project.mentor.fullName || 'Mentor'}</Text>
                    <Text style={[typography.caption, { color: colors.textMuted }]}>
                      {project.mentor.title || 'Industry Mentor'} {project.mentor.company ? `@ ${project.mentor.company}` : ''}
                    </Text>
                  </View>
                  <Badge variant="verified" size="sm">Mentor</Badge>
                </View>
              )}
            </Card>

            {/* Links Card */}
            <Card padding="lg" style={styles.sectionCard}>
              <Text style={[typography.h4, styles.sectionHeading]}>Repository & Deployments</Text>
              {project.repositoryUrl ? (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => Linking.openURL(project.repositoryUrl!)}
                  style={styles.linkRow}
                >
                  <Icon name="code" size={18} color={colors.primary} />
                  <Text style={[typography.bodyBold, { color: colors.primary, flex: 1, marginLeft: 8 }]}>
                    {project.repositoryUrl}
                  </Text>
                  <Icon name="external-link" size={14} color={colors.primary} />
                </TouchableOpacity>
              ) : (
                <Text style={[typography.caption, { color: colors.textMuted }]}>
                  No repository linked yet. Update project settings to attach a GitHub repository.
                </Text>
              )}
            </Card>
          </View>
        )}

        {/* GOALS TAB */}
        {activeTab === 'GOALS' && (
          <View>
            <View style={styles.tabActionHeader}>
              <Text style={[typography.h4, { color: colors.textMain }]}>Key Milestones & Goals</Text>
              <Button
                size="sm"
                variant="primary"
                onPress={() => setIsAddGoalModalVisible(true)}
                leftIcon={<Icon name="plus" size={14} color={colors.white} />}
              >
                Add Goal
              </Button>
            </View>

            {goals.length === 0 ? (
              <EmptyState
                iconName="check-circle"
                title="No Goals Yet"
                description="Break your project into clear tangible goals to track velocity."
                actionText="Create First Goal"
                onAction={() => setIsAddGoalModalVisible(true)}
              />
            ) : (
              goals.map(goal => (
                <Card key={goal.id} padding="md" style={styles.goalItemCard}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleToggleGoal(goal)}
                    style={styles.goalToggleRow}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        goal.isCompleted && styles.checkboxChecked
                      ]}
                    >
                      {goal.isCompleted && <Icon name="check" size={12} color={colors.white} />}
                    </View>
                    <Text
                      style={[
                        typography.bodyMedium,
                        {
                          flex: 1,
                          marginLeft: spacing.sm,
                          color: goal.isCompleted ? colors.textMuted : colors.textMain,
                          textDecorationLine: goal.isCompleted ? 'line-through' : 'none'
                        }
                      ]}
                    >
                      {goal.title}
                    </Text>
                  </TouchableOpacity>
                </Card>
              ))
            )}
          </View>
        )}

        {/* TASKS TAB (Kanban Board) */}
        {activeTab === 'TASKS' && (
          <View>
            <View style={styles.tabActionHeader}>
              <Text style={[typography.h4, { color: colors.textMain }]}>Task Board</Text>
              <Button
                size="sm"
                variant="primary"
                onPress={() => setIsAddTaskModalVisible(true)}
                leftIcon={<Icon name="plus" size={14} color={colors.white} />}
              >
                New Task
              </Button>
            </View>

            {tasks.length === 0 ? (
              <EmptyState
                iconName="folder-kanban"
                title="No Tasks Defined"
                description="Add action items for code implementation, testing, and PR reviews."
                actionText="Add Task"
                onAction={() => setIsAddTaskModalVisible(true)}
              />
            ) : (
              tasks.map(task => (
                <Card key={task.id} padding="md" style={styles.taskCard}>
                  <View style={styles.taskHeader}>
                    <Badge
                      variant={
                        task.priority === 'URGENT'
                          ? 'danger'
                          : task.priority === 'HIGH'
                          ? 'warning'
                          : 'neutral'
                      }
                      size="sm"
                    >
                      {task.priority}
                    </Badge>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleCycleTaskStatus(task)}
                      style={styles.statusCycleBtn}
                    >
                      <Badge
                        variant={
                          task.status === 'DONE'
                            ? 'success'
                            : task.status === 'IN_REVIEW'
                            ? 'info'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {task.status.replace('_', ' ')} ▾
                      </Badge>
                    </TouchableOpacity>
                  </View>

                  <Text style={[typography.bodyBold, styles.taskTitle]}>{task.title}</Text>
                  {task.description ? (
                    <Text style={[typography.caption, styles.taskDesc]}>{task.description}</Text>
                  ) : null}

                  <View style={styles.taskFooter}>
                    <Badge variant="neutral" size="sm">
                      👤 {task.assigneeRole}
                    </Badge>
                    <Text style={[typography.caption, { color: colors.textSubtle, fontSize: 10.5 }]}>
                      Tap status pill to advance
                    </Text>
                  </View>
                </Card>
              ))
            )}
          </View>
        )}

        {/* RESOURCES TAB */}
        {activeTab === 'RESOURCES' && (
          <View>
            <View style={styles.tabActionHeader}>
              <Text style={[typography.h4, { color: colors.textMain }]}>Shared Resources & Docs</Text>
              <Button
                size="sm"
                variant="primary"
                onPress={() => setIsAddResourceModalVisible(true)}
                leftIcon={<Icon name="plus" size={14} color={colors.white} />}
              >
                Add Link
              </Button>
            </View>

            {resources.length === 0 ? (
              <EmptyState
                iconName="paperclip"
                title="No Resources Attached"
                description="Share design docs, RFC specifications, research papers, and tutorials."
                actionText="Add Resource"
                onAction={() => setIsAddResourceModalVisible(true)}
              />
            ) : (
              resources.map(res => (
                <Card key={res.id} padding="md" style={styles.resourceCard}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => Linking.openURL(res.url)}
                    style={styles.resourceRow}
                  >
                    <View style={styles.resourceIcon}>
                      <Icon name="globe" size={18} color={colors.primary} />
                    </View>
                    <View style={{ marginLeft: spacing.sm, flex: 1 }}>
                      <Text style={[typography.bodyBold, { color: colors.textMain }]}>{res.title}</Text>
                      <Text style={[typography.caption, { color: colors.primary }]} numberOfLines={1}>
                        {res.url}
                      </Text>
                    </View>
                    <Icon name="external-link" size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                </Card>
              ))
            )}
          </View>
        )}

        {/* NOTES TAB */}
        {activeTab === 'NOTES' && (
          <View>
            <View style={styles.tabActionHeader}>
              <Text style={[typography.h4, { color: colors.textMain }]}>Architectural Notes</Text>
              <Button
                size="sm"
                variant="primary"
                onPress={() => setIsAddNoteModalVisible(true)}
                leftIcon={<Icon name="plus" size={14} color={colors.white} />}
              >
                New Note
              </Button>
            </View>

            {notes.length === 0 ? (
              <EmptyState
                iconName="edit"
                title="No Notes Created"
                description="Document system design decisions, tradeoffs, and meeting takeaways."
                actionText="Create Note"
                onAction={() => setIsAddNoteModalVisible(true)}
              />
            ) : (
              notes.map(note => (
                <Card key={note.id} padding="lg" style={styles.noteCard}>
                  <View style={styles.noteHeader}>
                    <Text style={[typography.h4, { color: colors.textMain, flex: 1 }]}>{note.title}</Text>
                    {note.isPrivateToMentor && (
                      <Badge variant="warning" size="sm">Mentor Private</Badge>
                    )}
                  </View>
                  <Text style={[typography.body, styles.noteContent]}>{note.content}</Text>
                  <Text style={[typography.caption, styles.noteFooter]}>
                    By {note.authorName || 'Collaborator'} • {formatDate(note.createdAt)}
                  </Text>
                </Card>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* ADD GOAL MODAL */}
      <Modal
        visible={isAddGoalModalVisible}
        onClose={() => setIsAddGoalModalVisible(false)}
        title="Add Project Goal"
        subtitle="Define a measurable milestone goal for the team"
      >
        <View style={{ paddingTop: spacing.xs }}>
          <Input
            label="Goal Title"
            placeholder="e.g. Implement Raft consensus leader heartbeat loop"
            value={newGoalTitle}
            onChangeText={setNewGoalTitle}
          />
          <Button
            size="md"
            onPress={handleAddGoal}
            fullWidth
            style={{ marginTop: spacing.sm }}
          >
            Create Goal
          </Button>
        </View>
      </Modal>

      {/* ADD TASK MODAL */}
      <Modal
        visible={isAddTaskModalVisible}
        onClose={() => setIsAddTaskModalVisible(false)}
        title="Create Task"
        subtitle="Add an engineering task to the Kanban board"
      >
        <View style={{ paddingTop: spacing.xs }}>
          <Input
            label="Task Title"
            placeholder="e.g. Write benchmark test for 5,000 tasks/sec"
            value={newTaskTitle}
            onChangeText={setNewTaskTitle}
          />
          <TextArea
            label="Description (Optional)"
            placeholder="Acceptance criteria, edge cases..."
            rows={3}
            value={newTaskDesc}
            onChangeText={setNewTaskDesc}
          />

          <Text style={[typography.captionBold, { color: colors.textMuted, marginBottom: spacing.xs }]}>
            PRIORITY:
          </Text>
          <View style={{ flexDirection: 'row', gap: 6, marginBottom: spacing.md }}>
            {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as TaskPriority[]).map(p => (
              <TouchableOpacity
                key={p}
                onPress={() => setNewTaskPriority(p)}
                style={[
                  styles.prioritySelectBtn,
                  newTaskPriority === p && styles.activePrioritySelect
                ]}
              >
                <Text style={[typography.captionBold, { color: newTaskPriority === p ? colors.primary : colors.textMuted, fontSize: 11 }]}>
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button
            size="md"
            onPress={handleAddTask}
            fullWidth
            style={{ marginTop: spacing.sm }}
          >
            Save Task
          </Button>
        </View>
      </Modal>

      {/* ADD RESOURCE MODAL */}
      <Modal
        visible={isAddResourceModalVisible}
        onClose={() => setIsAddResourceModalVisible(false)}
        title="Add Resource Link"
        subtitle="Share documentation, specification RFCs, or code"
      >
        <View style={{ paddingTop: spacing.xs }}>
          <Input
            label="Resource Name"
            placeholder="e.g. Raft Protocol Specification Paper"
            value={newResTitle}
            onChangeText={setNewResTitle}
          />
          <Input
            label="URL Link"
            placeholder="https://..."
            value={newResUrl}
            onChangeText={setNewResUrl}
            autoCapitalize="none"
          />
          <Button
            size="md"
            onPress={handleAddResource}
            fullWidth
            style={{ marginTop: spacing.sm }}
          >
            Attach Resource
          </Button>
        </View>
      </Modal>

      {/* ADD NOTE MODAL */}
      <Modal
        visible={isAddNoteModalVisible}
        onClose={() => setIsAddNoteModalVisible(false)}
        title="Create Note"
        subtitle="Record architectural design tradeoffs or meeting summaries"
      >
        <View style={{ paddingTop: spacing.xs }}>
          <Input
            label="Note Title"
            placeholder="e.g. Concurrency Lock Tradeoffs"
            value={newNoteTitle}
            onChangeText={setNewNoteTitle}
          />
          <TextArea
            label="Note Content"
            placeholder="Detailed markdown or code notes..."
            rows={5}
            value={newNoteContent}
            onChangeText={setNewNoteContent}
          />

          {user?.role === 'MENTOR' && (
            <TouchableOpacity
              onPress={() => setNewNoteIsPrivate(!newNoteIsPrivate)}
              style={styles.privateToggleRow}
            >
              <View style={[styles.checkbox, newNoteIsPrivate && styles.checkboxChecked]}>
                {newNoteIsPrivate && <Icon name="check" size={12} color={colors.white} />}
              </View>
              <Text style={[typography.captionBold, { marginLeft: 8, color: colors.textMain }]}>
                Private to Mentor Only
              </Text>
            </TouchableOpacity>
          )}

          <Button
            size="md"
            onPress={handleAddNote}
            fullWidth
            style={{ marginTop: spacing.md }}
          >
            Save Note
          </Button>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  tabsBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs
  },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSubtle,
    gap: 6
  },
  activeTabChip: {
    backgroundColor: colors.primaryLight
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl
  },
  sectionCard: {
    marginBottom: spacing.md,
    ...shadows.sm
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm
  },
  overviewTitle: {
    color: colors.textMain,
    marginBottom: spacing.xs
  },
  overviewDesc: {
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: spacing.lg
  },
  progressContainer: {
    marginBottom: spacing.md
  },
  techTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  sectionHeading: {
    color: colors.textMain,
    marginBottom: spacing.md
  },
  teamMemberRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: radius.md
  },
  tabActionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md
  },
  goalItemCard: {
    marginBottom: spacing.sm
  },
  goalToggleRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: radius.xs,
    borderWidth: 2,
    borderColor: colors.borderDark,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  taskCard: {
    marginBottom: spacing.sm
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs
  },
  statusCycleBtn: {
    padding: 2
  },
  taskTitle: {
    color: colors.textMain,
    marginBottom: 4
  },
  taskDesc: {
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: spacing.sm
  },
  taskFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingTop: spacing.xs + 2
  },
  resourceCard: {
    marginBottom: spacing.sm
  },
  resourceRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  resourceIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center'
  },
  noteCard: {
    marginBottom: spacing.sm
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs
  },
  noteContent: {
    color: colors.textMain,
    lineHeight: 20
  },
  noteFooter: {
    color: colors.textSubtle,
    marginTop: spacing.sm
  },
  prioritySelectBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: radius.xs,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center'
  },
  activePrioritySelect: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary
  },
  privateToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.sm
  }
});
