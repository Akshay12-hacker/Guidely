import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import {
  Project,
  ProjectGoal,
  ProjectMilestone,
  ProjectTask,
  ProjectResource,
  ProjectNote,
  TaskStatus,
  TaskPriority
} from '../../../../shared/types.js';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Avatar } from '../../components/ui/Avatar.js';
import { Tabs } from '../../components/ui/Tabs.js';
import { ProgressBar } from '../../components/ui/ProgressBar.js';
import { Modal } from '../../components/ui/Modal.js';
import { Input } from '../../components/ui/Input.js';
import { Textarea } from '../../components/ui/Textarea.js';
import { Select } from '../../components/ui/Select.js';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton.js';
import { EmptyState } from '../../components/ui/EmptyState.js';
import { MediaUpload } from '../../components/ui/MediaUpload.js';
import { MediaSaveButton } from '../../components/ui/MediaSaveButton.js';
import { WhatsAppMediaViewer } from '../../components/ui/WhatsAppMediaViewer.js';
import { getOptimizedCloudinaryUrl, getVideoPosterUrl } from '../../utils/cloudinary.js';
import {
  FolderKanban,
  Target,
  Milestone as MilestoneIcon,
  CheckSquare,
  FileText,
  Link2,
  Lock,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  ExternalLink,
  CheckCircle2,
  Video,
  GitBranch
} from 'lucide-react';

interface ProjectWorkspaceProps {
  projectId?: string;
  onNavigate: (route: string, params?: any) => void;
}

export const ProjectWorkspace: React.FC<ProjectWorkspaceProps> = ({ projectId, onNavigate }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [workspace, setWorkspace] = useState<{
    project: Project;
    goals: ProjectGoal[];
    milestones: ProjectMilestone[];
    tasks: ProjectTask[];
    resources: ProjectResource[];
    notes: ProjectNote[];
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Modals state
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDesc, setGoalDesc] = useState('');
  const [goalTargetDate, setGoalTargetDate] = useState('');

  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneDesc, setMilestoneDesc] = useState('');
  const [milestoneDueDate, setMilestoneDueDate] = useState('');

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskMilestoneId, setTaskMilestoneId] = useState('');
  const [taskAssignee, setTaskAssignee] = useState<'STUDENT' | 'MENTOR'>('STUDENT');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('MEDIUM');
  const [taskDueDate, setTaskDueDate] = useState('');

  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');
  const [resourceType, setResourceType] = useState<any>('DOC');

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteIsPrivate, setNoteIsPrivate] = useState(false);

  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const [repoUrl, setRepoUrl] = useState('');
  const [liveDemoUrl, setLiveDemoUrl] = useState('');
  const [viewerMedia, setViewerMedia] = useState<{
    isOpen: boolean;
    url: string;
    title?: string;
    type?: 'image' | 'video' | 'raw';
  }>({
    isOpen: false,
    url: ''
  });

  const fetchWorkspace = async () => {
    setIsLoading(true);
    try {
      let targetId = projectId;
      if (!targetId) {
        const myProjects = await api.getMyProjects();
        if (myProjects.length > 0) {
          targetId = myProjects[0].id;
        }
      }

      if (targetId) {
        const data = await api.getProjectWorkspace(targetId);
        setWorkspace(data);
        setRepoUrl(data.project.repositoryUrl || '');
        setLiveDemoUrl(data.project.liveUrl || '');
      } else {
        setWorkspace(null);
      }
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspace();
  }, [projectId]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <LoadingSkeleton height="36px" width="280px" />
        <LoadingSkeleton height="120px" />
        <LoadingSkeleton height="280px" />
      </div>
    );
  }

  if (!workspace) {
    return (
      <EmptyState
        icon={<FolderKanban size={32} />}
        title="No Project Workspace Found"
        description="Once your mentorship proposal is accepted by an industry mentor, your collaborative workspace will appear here."
        actionText="Explore Mentors →"
        onAction={() => onNavigate('find-mentor')}
      />
    );
  }

  const { project, goals, milestones, tasks, resources, notes } = workspace;

  // Handlers
  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle) return;
    try {
      await api.addGoal(project.id, { title: goalTitle, description: goalDesc, targetDate: goalTargetDate });
      showToast('success', 'Goal Added');
      setIsGoalModalOpen(false);
      setGoalTitle('');
      setGoalDesc('');
      fetchWorkspace();
    } catch (err: any) {
      showToast('error', 'Failed to add goal', err.message);
    }
  };

  const handleToggleGoal = async (goal: ProjectGoal) => {
    try {
      await api.updateGoal(project.id, goal.id, { isCompleted: !goal.isCompleted });
      fetchWorkspace();
    } catch (err: any) {
      showToast('error', 'Update Failed', err.message);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      await api.deleteGoal(project.id, goalId);
      showToast('info', 'Goal deleted');
      fetchWorkspace();
    } catch (err: any) {
      showToast('error', 'Delete failed', err.message);
    }
  };

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneTitle) return;
    try {
      await api.addMilestone(project.id, { title: milestoneTitle, description: milestoneDesc, dueDate: milestoneDueDate });
      showToast('success', 'Milestone Created');
      setIsMilestoneModalOpen(false);
      setMilestoneTitle('');
      setMilestoneDesc('');
      fetchWorkspace();
    } catch (err: any) {
      showToast('error', 'Failed to add milestone', err.message);
    }
  };

  const handleToggleMilestone = async (m: ProjectMilestone) => {
    const nextStatus = m.status === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED';
    try {
      await api.updateMilestone(project.id, m.id, { status: nextStatus });
      showToast('success', nextStatus === 'COMPLETED' ? 'Milestone Completed! 🎉' : 'Milestone Updated');
      fetchWorkspace();
    } catch (err: any) {
      showToast('error', 'Update failed', err.message);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle) return;
    try {
      await api.addTask(project.id, {
        title: taskTitle,
        description: taskDesc,
        milestoneId: taskMilestoneId || undefined,
        assigneeRole: taskAssignee,
        priority: taskPriority,
        dueDate: taskDueDate || undefined
      });
      showToast('success', 'Task Added');
      setIsTaskModalOpen(false);
      setTaskTitle('');
      setTaskDesc('');
      fetchWorkspace();
    } catch (err: any) {
      showToast('error', 'Failed to add task', err.message);
    }
  };

  const handleTaskStatusChange = async (task: ProjectTask, newStatus: TaskStatus) => {
    try {
      await api.updateTask(project.id, task.id, { status: newStatus });
      fetchWorkspace();
    } catch (err: any) {
      showToast('error', 'Failed to update task status', err.message);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.deleteTask(project.id, taskId);
      fetchWorkspace();
    } catch (err: any) {
      showToast('error', 'Failed to delete task', err.message);
    }
  };

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourceTitle || !resourceUrl) return;
    try {
      await api.addResource(project.id, { title: resourceTitle, url: resourceUrl, type: resourceType });
      showToast('success', 'Resource Added');
      setIsResourceModalOpen(false);
      setResourceTitle('');
      setResourceUrl('');
      fetchWorkspace();
    } catch (err: any) {
      showToast('error', 'Failed to add resource', err.message);
    }
  };

  const handleDeleteResource = async (resId: string) => {
    try {
      await api.deleteResource(project.id, resId);
      fetchWorkspace();
    } catch (err: any) {
      showToast('error', 'Failed to delete resource', err.message);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle || !noteContent) return;
    try {
      await api.addNote(project.id, { title: noteTitle, content: noteContent, isPrivateToMentor: noteIsPrivate });
      showToast('success', 'Note Created');
      setIsNoteModalOpen(false);
      setNoteTitle('');
      setNoteContent('');
      fetchWorkspace();
    } catch (err: any) {
      showToast('error', 'Failed to add note', err.message);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await api.deleteNote(project.id, noteId);
      fetchWorkspace();
    } catch (err: any) {
      showToast('error', 'Failed to delete note', err.message);
    }
  };

  const handleUpdateLinks = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateProject(project.id, { repositoryUrl: repoUrl, liveUrl: liveDemoUrl });
      showToast('success', 'Project Links Updated');
      setIsEditProjectModalOpen(false);
      fetchWorkspace();
    } catch (err: any) {
      showToast('error', 'Update Failed', err.message);
    }
  };

  const tabsList = [
    { id: 'overview', label: 'Overview', icon: <FolderKanban size={16} /> },
    { id: 'goals', label: 'Goals', count: goals.length, icon: <Target size={16} /> },
    { id: 'milestones', label: 'Milestones & Tasks', count: tasks.length, icon: <CheckSquare size={16} /> },
    { id: 'resources', label: 'Resources & Docs', count: resources.length, icon: <Link2 size={16} /> },
    { id: 'notes', label: 'Notes', count: notes.length, icon: <FileText size={16} /> }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }} className="animate-fade-in">
      {/* Workspace Header Card */}
      <Card padding="lg">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '18px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.025em' }}>
                {project.title}
              </h1>
              <Badge variant={project.status === 'COMPLETED' ? 'completed' : 'in_progress'}>
                {project.status}
              </Badge>
              <Badge variant="neutral">{project.category}</Badge>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: '720px', lineHeight: 1.5 }}>
              {project.description}
            </p>

            <div style={{ display: 'flex', gap: '12px', marginTop: '4px', flexWrap: 'wrap' }}>
              {project.repositoryUrl && (
                <a
                  href={project.repositoryUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--primary)' }}
                >
                  <GitBranch size={14} /> Repository <ExternalLink size={12} />
                </a>
              )}
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--success-dark)' }}
                >
                  <ExternalLink size={14} /> Live Deployment <ExternalLink size={12} />
                </a>
              )}
            </div>
          </div>

          {/* Members info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', backgroundColor: 'var(--bg-subtle)', padding: '10px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Avatar name={project.student?.fullName || 'Student'} src={project.student?.avatarUrl} size="sm" />
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Student</span>
                <p style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)' }}>{project.student?.fullName}</p>
              </div>
            </div>

            <div style={{ width: '1px', height: '28px', backgroundColor: 'var(--border)' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Avatar name={project.mentor?.fullName || 'Mentor'} src={project.mentor?.avatarUrl} size="sm" isVerified={true} />
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Mentor</span>
                <p style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)' }}>{project.mentor?.fullName}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Live Progress Bar */}
        <div style={{ marginTop: '18px', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Collaborative Project Progress
            </span>
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--primary)' }}>
              {project.progressPercentage}%
            </span>
          </div>
          <ProgressBar value={project.progressPercentage} size="md" />
        </div>
      </Card>

      {/* Tabs */}
      <Tabs tabs={tabsList} activeTab={activeTab} onChange={setActiveTab} />

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }} className="animate-fade-in workspace-overview-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Target Technologies */}
            <Card padding="md">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '10px' }}>Target Technologies & Architecture</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {project.targetTechnologies.map(t => (
                  <Badge key={t} variant="primary">{t}</Badge>
                ))}
              </div>
            </Card>

            {/* Quick Milestones Summary */}
            <Card padding="md">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Milestone Progression</h3>
                <Button size="sm" variant="outline" onClick={() => setActiveTab('milestones')}>
                  View Tasks Board →
                </Button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {milestones.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1px solid var(--border)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => handleToggleMilestone(m)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: m.status === 'COMPLETED' ? 'var(--success)' : 'var(--text-subtle)',
                          display: 'flex'
                        }}
                      >
                        <CheckCircle2 size={18} />
                      </button>
                      <span style={{ fontWeight: 600, fontSize: '0.88rem', textDecoration: m.status === 'COMPLETED' ? 'line-through' : 'none', color: m.status === 'COMPLETED' ? 'var(--text-muted)' : 'var(--text-main)' }}>
                        {m.title}
                      </span>
                    </div>
                    <Badge variant={m.status === 'COMPLETED' ? 'completed' : 'in_progress'} size="sm">
                      {m.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <Card padding="md">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <h4 style={{ fontSize: '0.94rem', fontWeight: 700 }}>Project Links</h4>
                <Button size="sm" variant="ghost" onClick={() => setIsEditProjectModalOpen(true)}>
                  <Edit2 size={13} />
                </Button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.84rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700 }}>Repository URL</span>
                  <p style={{ wordBreak: 'break-all', fontWeight: 600, color: 'var(--primary)', marginTop: '2px' }}>
                    {project.repositoryUrl || 'No repository linked yet'}
                  </p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700 }}>Live Deployment</span>
                  <p style={{ wordBreak: 'break-all', fontWeight: 600, color: 'var(--success-dark)', marginTop: '2px' }}>
                    {project.liveUrl || 'Not deployed yet'}
                  </p>
                </div>
              </div>
            </Card>

            <Card padding="md">
              <h4 style={{ fontSize: '0.94rem', fontWeight: 700, marginBottom: '6px' }}>Direct Collaboration</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '10px' }}>
                Need to discuss design trade-offs? Launch a video sync or send a direct message.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <Button size="sm" variant="secondary" onClick={() => onNavigate('messages')} leftIcon={<Video size={14} />}>
                  Chat with {user?.role === 'STUDENT' ? project.mentor?.fullName : project.student?.fullName}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: GOALS */}
      {activeTab === 'goals' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Project Goals Checklist</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Collaboratively formulated targets between mentor and student
              </p>
            </div>
            <Button size="sm" onClick={() => setIsGoalModalOpen(true)} leftIcon={<Plus size={15} />}>
              Add Goal
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {goals.length === 0 ? (
              <EmptyState
                icon={<Target size={24} />}
                title="No goals formulated yet"
                description="Add project goals collaboratively with your mentor."
                actionText="Add First Goal"
                onAction={() => setIsGoalModalOpen(true)}
              />
            ) : (
              goals.map((g) => (
                <Card
                  key={g.id}
                  padding="md"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: g.isCompleted ? 'var(--bg-subtle)' : '#FFFFFF'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <button
                      onClick={() => handleToggleGoal(g)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: g.isCompleted ? 'var(--success)' : 'var(--border-focus)',
                        display: 'flex'
                      }}
                    >
                      <CheckCircle2 size={20} />
                    </button>
                    <div>
                      <h4 style={{ fontSize: '0.94rem', fontWeight: 700, textDecoration: g.isCompleted ? 'line-through' : 'none', color: g.isCompleted ? 'var(--text-muted)' : 'var(--text-main)' }}>
                        {g.title}
                      </h4>
                      {g.description && (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {g.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {g.targetDate && (
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} /> {new Date(g.targetDate).toLocaleDateString()}
                      </span>
                    )}
                    <button
                      onClick={() => handleDeleteGoal(g.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)', padding: '4px' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: MILESTONES & TASKS BOARD */}
      {activeTab === 'milestones' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="animate-fade-in">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Milestones & Kanban Board</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Track development sprints, code reviews, and completion states
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button size="sm" variant="secondary" onClick={() => setIsMilestoneModalOpen(true)} leftIcon={<MilestoneIcon size={15} />}>
                Add Milestone
              </Button>
              <Button size="sm" variant="primary" onClick={() => setIsTaskModalOpen(true)} leftIcon={<Plus size={15} />}>
                Create Task
              </Button>
            </div>
          </div>

          {/* Kanban Columns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            {(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'] as TaskStatus[]).map((status) => {
              const columnTasks = tasks.filter(t => t.status === status);
              const statusTitles = {
                TODO: 'To Do',
                IN_PROGRESS: 'In Progress',
                IN_REVIEW: 'Code Review',
                DONE: 'Done'
              };

              return (
                <div
                  key={status}
                  style={{
                    backgroundColor: 'var(--bg-subtle)',
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    minHeight: '380px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {statusTitles[status]}
                    </span>
                    <span style={{ backgroundColor: '#FFFFFF', padding: '1px 6px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border)', fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      {columnTasks.length}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {columnTasks.map(task => (
                      <Card
                        key={task.id}
                        padding="sm"
                        style={{
                          backgroundColor: '#FFFFFF',
                          boxShadow: 'var(--shadow-xs)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                          <Badge variant={task.priority === 'URGENT' ? 'urgent' : task.priority === 'HIGH' ? 'warning' : 'neutral'} size="sm">
                            {task.priority}
                          </Badge>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.3 }}>
                          {task.title}
                        </h5>

                        {task.description && (
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                            {task.description}
                          </p>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '6px', fontSize: '0.74rem' }}>
                          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                            {task.assigneeRole}
                          </span>

                          <select
                            value={task.status}
                            onChange={(e) => handleTaskStatusChange(task, e.target.value as TaskStatus)}
                            style={{
                              fontSize: '0.72rem',
                              padding: '2px 4px',
                              borderRadius: 'var(--radius-xs)',
                              border: '1px solid var(--border)',
                              backgroundColor: 'var(--bg-body)'
                            }}
                          >
                            <option value="TODO">To Do</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="IN_REVIEW">In Review</option>
                            <option value="DONE">Done</option>
                          </select>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: RESOURCES */}
      {activeTab === 'resources' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Shared Project Resources & Docs</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Specifications, documentation links, and code references
              </p>
            </div>
            <Button size="sm" onClick={() => setIsResourceModalOpen(true)} leftIcon={<Plus size={15} />}>
              Share Resource
            </Button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
            {resources.length === 0 ? (
              <EmptyState
                icon={<Link2 size={24} />}
                title="No shared resources yet"
                description="Share links, research PDFs, or code references with your mentee/mentor."
                actionText="Add First Resource"
                onAction={() => setIsResourceModalOpen(true)}
              />
            ) : (
              resources.map(r => (
                <Card key={r.id} padding="md" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <Badge variant="primary" size="sm">{r.type}</Badge>
                      <button
                        onClick={() => handleDeleteResource(r.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '2px' }}>
                      {r.title}
                    </h4>
                    <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                      Added by {r.addedByName || r.addedByRole}
                    </p>

                    {/* Bandwidth-Optimized Media Preview with Lightbox Click */}
                    {r.type === 'VIDEO' && r.url.includes('res.cloudinary.com') ? (
                      <div
                        onClick={() => setViewerMedia({ isOpen: true, url: r.url, title: r.title, type: 'video' })}
                        style={{ marginTop: '8px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', maxHeight: '140px', backgroundColor: '#000000', cursor: 'pointer', position: 'relative' }}
                      >
                        <video
                          src={r.url}
                          poster={getVideoPosterUrl(r.url, 480)}
                          preload="none"
                          controls
                          style={{ width: '100%', maxHeight: '140px', display: 'block' }}
                        />
                      </div>
                    ) : r.url.match(/\.(jpg|jpeg|png|webp|gif)($|\?)/i) || (r.url.includes('res.cloudinary.com') && r.type !== 'DOC' && r.type !== 'CODE') ? (
                      <div
                        onClick={() => setViewerMedia({ isOpen: true, url: r.url, title: r.title, type: 'image' })}
                        style={{ marginTop: '8px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', maxHeight: '120px', textAlign: 'center', backgroundColor: 'var(--bg-subtle)', cursor: 'pointer' }}
                      >
                        <img
                          src={getOptimizedCloudinaryUrl(r.url, { width: 360, quality: 'auto:good' })}
                          alt={r.title}
                          loading="lazy"
                          decoding="async"
                          style={{ maxWidth: '100%', maxHeight: '120px', objectFit: 'contain' }}
                        />
                      </div>
                    ) : null}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px', borderTop: '1px solid var(--border)', paddingTop: '8px', marginTop: '4px' }}>
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: 'var(--primary)'
                      }}
                    >
                      Open Link <ExternalLink size={12} />
                    </a>

                    {/* WhatsApp-Style Save to Device / Gallery */}
                    <MediaSaveButton mediaUrl={r.url} filename={r.title} size="sm" />
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 5: NOTES */}
      {activeTab === 'notes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Project Notes & Architecture Specs</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Shared architectural notes & private mentor assessments
              </p>
            </div>
            <Button size="sm" onClick={() => setIsNoteModalOpen(true)} leftIcon={<Plus size={15} />}>
              Create Note
            </Button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {notes.length === 0 ? (
              <EmptyState
                icon={<FileText size={24} />}
                title="No project notes yet"
                description="Keep track of meeting minutes, debugging insights, and architectural decisions."
                actionText="Create First Note"
                onAction={() => setIsNoteModalOpen(true)}
              />
            ) : (
              notes.map(n => (
                <Card key={n.id} padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {n.isPrivateToMentor && (
                        <Badge variant="warning" size="sm">
                          <Lock size={10} /> Mentor Private
                        </Badge>
                      )}
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        by {n.authorName || n.authorRole}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteNote(n.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {n.title}
                  </h4>

                  <p style={{ fontSize: '0.84rem', color: 'var(--text-main)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                    {n.content}
                  </p>

                  <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', borderTop: '1px solid var(--border)', paddingTop: '6px' }}>
                    Updated {new Date(n.updatedAt).toLocaleDateString()}
                  </span>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal: Add Goal */}
      <Modal isOpen={isGoalModalOpen} onClose={() => setIsGoalModalOpen(false)} title="Add Collaborative Goal">
        <form onSubmit={handleAddGoal} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input label="Goal Title" placeholder="e.g. Implement Raft Consensus Engine" value={goalTitle} onChange={(e) => setGoalTitle(e.target.value)} required />
          <Textarea label="Description" placeholder="Specific goal details and requirements..." value={goalDesc} onChange={(e) => setGoalDesc(e.target.value)} />
          <Input label="Target Date (Optional)" type="date" value={goalTargetDate} onChange={(e) => setGoalTargetDate(e.target.value)} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button variant="ghost" type="button" onClick={() => setIsGoalModalOpen(false)}>Cancel</Button>
            <Button type="submit">Add Goal</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Milestone */}
      <Modal isOpen={isMilestoneModalOpen} onClose={() => setIsMilestoneModalOpen(false)} title="Create Milestone">
        <form onSubmit={handleAddMilestone} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input label="Milestone Title" placeholder="e.g. Milestone 2: gRPC Coordinator & RPC Failover" value={milestoneTitle} onChange={(e) => setMilestoneTitle(e.target.value)} required />
          <Textarea label="Description" placeholder="Key deliverables in this milestone..." value={milestoneDesc} onChange={(e) => setMilestoneDesc(e.target.value)} />
          <Input label="Due Date" type="date" value={milestoneDueDate} onChange={(e) => setMilestoneDueDate(e.target.value)} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button variant="ghost" type="button" onClick={() => setIsMilestoneModalOpen(false)}>Cancel</Button>
            <Button type="submit">Create Milestone</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Task */}
      <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="Create Development Task">
        <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input label="Task Title" placeholder="e.g. Handle Worker Node Crash in Task Queue" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} required />
          <Textarea label="Description" placeholder="Specific task instructions and requirements..." value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Select
              label="Assignee"
              value={taskAssignee}
              onChange={(e) => setTaskAssignee(e.target.value as any)}
              options={[{ value: 'STUDENT', label: 'Student' }, { value: 'MENTOR', label: 'Mentor' }]}
            />
            <Select
              label="Priority"
              value={taskPriority}
              onChange={(e) => setTaskPriority(e.target.value as any)}
              options={[
                { value: 'LOW', label: 'Low' },
                { value: 'MEDIUM', label: 'Medium' },
                { value: 'HIGH', label: 'High' },
                { value: 'URGENT', label: 'Urgent' }
              ]}
            />
          </div>
          <Input label="Due Date" type="date" value={taskDueDate} onChange={(e) => setTaskDueDate(e.target.value)} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button variant="ghost" type="button" onClick={() => setIsTaskModalOpen(false)}>Cancel</Button>
            <Button type="submit">Create Task</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Resource */}
      <Modal isOpen={isResourceModalOpen} onClose={() => setIsResourceModalOpen(false)} title="Share Resource / Doc / Media">
        <form onSubmit={handleAddResource} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <MediaUpload
            label="Upload to Cloudinary (Image, Video, or Document)"
            helperText="Directly upload architecture diagram, demo video, or PDF specification to Cloudinary"
            folder="projects"
            acceptType="all"
            value={resourceUrl}
            projectId={project?.id}
            onChange={(res) => {
              if (res) {
                setResourceUrl(res.secureUrl);
                if (!resourceTitle) {
                  setResourceTitle(res.originalFilename || 'Project Resource');
                }
                if (res.resourceType === 'video') {
                  setResourceType('VIDEO');
                } else if (res.resourceType === 'raw') {
                  setResourceType('DOC');
                }
              }
            }}
          />

          <Input label="Resource Title" placeholder="e.g. Go Concurrency in Practice" value={resourceTitle} onChange={(e) => setResourceTitle(e.target.value)} required />
          <Input label="Resource URL / Link" placeholder="https://..." value={resourceUrl} onChange={(e) => setResourceUrl(e.target.value)} required />
          <Select
            label="Type"
            value={resourceType}
            onChange={(e) => setResourceType(e.target.value)}
            options={[
              { value: 'DOC', label: 'Documentation / PDF' },
              { value: 'LINK', label: 'External Article / Link' },
              { value: 'CODE', label: 'Code Sample / Repo' },
              { value: 'VIDEO', label: 'Video Lecture / Demo' }
            ]}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button variant="ghost" type="button" onClick={() => setIsResourceModalOpen(false)}>Cancel</Button>
            <Button type="submit">Add Resource</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Note */}
      <Modal isOpen={isNoteModalOpen} onClose={() => setIsNoteModalOpen(false)} title="Create Project Note">
        <form onSubmit={handleAddNote} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input label="Note Title" placeholder="e.g. Architecture Decision on Worker Leases" value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} required />
          <Textarea label="Content" placeholder="Write markdown or structured notes..." value={noteContent} onChange={(e) => setNoteContent(e.target.value)} rows={5} required />
          {user?.role === 'MENTOR' && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={noteIsPrivate} onChange={(e) => setNoteIsPrivate(e.target.checked)} />
              <span>Make private (only visible to mentors)</span>
            </label>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button variant="ghost" type="button" onClick={() => setIsNoteModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Note</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Links */}
      <Modal isOpen={isEditProjectModalOpen} onClose={() => setIsEditProjectModalOpen(false)} title="Update Repository & Deployment Links">
        <form onSubmit={handleUpdateLinks} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input label="GitHub Repository URL" placeholder="https://github.com/username/project" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} />
          <Input label="Live Demo URL" placeholder="https://myproject.demo.com" value={liveDemoUrl} onChange={(e) => setLiveDemoUrl(e.target.value)} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button variant="ghost" type="button" onClick={() => setIsEditProjectModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Links</Button>
          </div>
        </form>
      </Modal>

      {/* WhatsApp Fullscreen Media Lightbox Viewer */}
      <WhatsAppMediaViewer
        isOpen={viewerMedia.isOpen}
        onClose={() => setViewerMedia(prev => ({ ...prev, isOpen: false }))}
        mediaUrl={viewerMedia.url}
        mediaType={viewerMedia.type}
        title={viewerMedia.title}
      />
    </div>
  );
};
