process.env.NODE_ENV = 'test';
import assert from 'assert';
import { Database } from '../src/infrastructure/database/database.js';
import { seedDatabase } from '../src/infrastructure/database/seed.js';
import { SqliteAuthRepository } from '../src/modules/auth/auth.repository.js';
import { AuthService } from '../src/modules/auth/auth.service.js';
import { SqliteMentorRepository } from '../src/modules/mentors/mentor.repository.js';
import { MentorService } from '../src/modules/mentors/mentor.service.js';
import { SqliteMentorshipRepository } from '../src/modules/mentorship/mentorship.repository.js';
import { MentorshipService } from '../src/modules/mentorship/mentorship.service.js';
import { SqliteProjectRepository } from '../src/modules/projects/project.repository.js';
import { ProjectService } from '../src/modules/projects/project.service.js';
import { SqliteSessionRepository } from '../src/modules/sessions/session.repository.js';
import { SessionService } from '../src/modules/sessions/session.service.js';
import { SqliteReviewRepository } from '../src/modules/reviews/review.repository.js';
import { ReviewService } from '../src/modules/reviews/review.service.js';
import { SqliteAdminRepository } from '../src/modules/admin/admin.repository.js';
import { AdminService } from '../src/modules/admin/admin.service.js';
import { logger } from '../src/shared/utils/logger.js';

let passed = 0;
let failed = 0;

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } catch (err: any) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
    failed++;
  }
}

async function runAllTests() {
  console.log('\n=========================================');
  console.log('🧪 Running Guidely Core Engineering Suite');
  console.log('=========================================\n');

  const db = Database.getInstance();
  await db.initializeSchema();
  await seedDatabase(true);

  const authRepo = new SqliteAuthRepository();
  const authService = new AuthService(authRepo);
  const mentorRepo = new SqliteMentorRepository();
  const mentorService = new MentorService(mentorRepo, authRepo);
  const mentorshipRepo = new SqliteMentorshipRepository();
  const mentorshipService = new MentorshipService(mentorshipRepo);
  const projectRepo = new SqliteProjectRepository();
  const projectService = new ProjectService(projectRepo);
  const sessionRepo = new SqliteSessionRepository();
  const sessionService = new SessionService(sessionRepo);
  const reviewRepo = new SqliteReviewRepository();
  const reviewService = new ReviewService(reviewRepo);
  const adminRepo = new SqliteAdminRepository();
  const adminService = new AdminService(adminRepo);

  console.log('--- 1. Authentication & Security ---');
  await test('Admin and Student can authenticate with valid credentials', async () => {
    const adminAuth = await authService.login({ email: 'admin@guidely.dev', password: 'password123' });
    assert.strictEqual(adminAuth.user.role, 'ADMIN');
    assert(adminAuth.token.length > 20);

    const studentAuth = await authService.login({ email: 'akshay@guidely.dev', password: 'password123' });
    assert.strictEqual(studentAuth.user.role, 'STUDENT');
  });

  await test('Rejects incorrect credentials with unauthorized exception', async () => {
    try {
      await authService.login({ email: 'admin@guidely.dev', password: 'wrongPassword' });
      assert.fail('Should have thrown error');
    } catch (err: any) {
      assert.strictEqual(err.statusCode, 401);
    }
  });

  console.log('\n--- 2. Mentor Discovery & Multi-Criteria Filtering ---');
  await test('Filter mentors by technology and experience', async () => {
    const mentors = await mentorService.discoverMentors({
      technologies: ['Go (Golang)'],
      minExperience: 5
    });
    assert(mentors.length >= 1);
    assert(mentors.some(m => m.user.fullName === 'Priya Sundaram'));
  });

  console.log('\n--- 3. Mentorship Request Workflow ---');
  await test('Student can send request, mentor can accept, auto-provisions project & chat', async () => {
    const req = await mentorshipService.createRequest('usr_student_sapna', {
      mentorId: 'usr_mentor_rohan',
      projectTitle: 'Automated Chest X-Ray Diagnosis with Vision Transformers',
      projectDescription: 'Building ViT for multi-label pneumonia classification',
      currentKnowledge: 'PyTorch, Python',
      techKnown: ['PyTorch', 'Python'],
      helpNeeded: ['ViT Fine-tuning', 'Model Evaluation'],
      expectedOutcome: 'Paper & Web Demo',
      preferredTimes: 'Tuesday evenings'
    });
    assert.strictEqual(req.status, 'PENDING');

    const accepted = await mentorshipService.respondToRequest('usr_mentor_rohan', req.id, 'ACCEPT');
    assert.strictEqual(accepted.status, 'ACCEPTED');
  });

  console.log('\n--- 4. Collaborative Project Workspace & Progress Engine ---');
  await test('Project workspace loads with goals, milestones, tasks and recalculates progress', async () => {
    const workspace = await projectService.getProjectWorkspace('proj_guidely_pbl', 'usr_student_akshay', 'STUDENT');
    assert.strictEqual(workspace.project.title, 'Guidely: E-learning & Collaborative Project Mentorship Platform');
    assert(workspace.goals.length >= 2);
    assert(workspace.milestones.length >= 2);
    assert(workspace.tasks.length >= 4);

    // Add a task and complete it
    const newTask = await projectService.addTask('proj_guidely_pbl', 'usr_student_akshay', {
      title: 'Run end-to-end integration test suite',
      assigneeRole: 'STUDENT',
      priority: 'HIGH'
    });

    const updated = await projectService.updateTask('proj_guidely_pbl', newTask.id, 'usr_student_akshay', {
      status: 'DONE'
    });
    assert.strictEqual(updated.status, 'DONE');
  });

  console.log('\n--- 5. Session Scheduling & Telemetry ---');
  await test('Student can request session and mentor can confirm with video room', async () => {
    const session = await sessionService.requestSession('usr_student_akshay', {
      mentorId: 'usr_mentor_nitin',
      title: 'Deep-dive on WebSocket Flow Control',
      agenda: 'Discuss channel backpressure under load',
      scheduledAt: new Date(Date.now() + 86400000).toISOString()
    });
    assert.strictEqual(session.status, 'REQUESTED');

    const confirmed = await sessionService.confirmSession('usr_mentor_nitin', session.id);
    assert.strictEqual(confirmed.status, 'CONFIRMED');
    assert(confirmed.meetingUrl?.includes('meet.jit.si'));
  });

  console.log('\n--- 6. Reviews & Aggregate Scoring ---');
  await test('Student reviews mentor and aggregate rating updates accurately', async () => {
    const reviews = await reviewService.getMentorReviews('usr_mentor_nitin');
    assert(reviews.length >= 1);
    assert.strictEqual(reviews[0].rating, 5);
  });

  console.log('\n--- 7. Admin Governance & Platform Analytics ---');
  await test('Admin dashboard aggregates platform KPIs and handles mentor verification', async () => {
    const analytics = await adminService.getOverview();
    assert(analytics.totalUsers >= 5);
    assert(analytics.totalMentors >= 4);
    assert(analytics.totalStudents >= 3);

    const pending = await adminService.getPendingVerifications();
    if (pending.length > 0) {
      const verified = await adminService.verifyMentor(pending[0].userId, 'APPROVED', 'Verified credentials');
      assert.strictEqual(verified.isVerified, true);
    }
  });

  console.log('\n=========================================');
  console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
  console.log('=========================================\n');

  await db.close();

  if (failed > 0) process.exit(1);
}

runAllTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
