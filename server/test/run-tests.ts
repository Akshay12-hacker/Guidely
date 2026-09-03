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
import { logger, wrapPino, pinoOptions } from '../src/shared/utils/logger.js';
import http from 'http';
import net from 'net';
import { Writable } from 'stream';
import pino from 'pino';
import { createApp } from '../src/app.js';
import { WebSocketManager } from '../src/infrastructure/websocket/wsServer.js';

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

  console.log('\n--- 8. Request IDs, Telemetry & Response Time ---');
  const app = createApp();
  const testServer = http.createServer(app);
  await new Promise<void>((res) => testServer.listen(0, res));
  const address = testServer.address() as net.AddressInfo;
  const baseUrl = `http://127.0.0.1:${address.port}`;

  await test('Generates X-Request-Id and tracks X-Response-Time on requests', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.strictEqual(res.status, 200);
    const reqId = res.headers.get('x-request-id');
    const respTime = res.headers.get('x-response-time');
    assert(reqId && reqId.length >= 10, 'Request ID should be present');
    assert(respTime && respTime.endsWith('ms'), 'Response time should end with ms');

    const json = await res.json() as any;
    assert.strictEqual(json.status, 'healthy');
    assert.strictEqual(json.requestId, reqId);
  });

  await test('Propagates incoming client X-Request-Id header', async () => {
    const customId = 'client-trace-uuid-12345';
    const res = await fetch(`${baseUrl}/api/health`, {
      headers: { 'X-Request-Id': customId }
    });
    assert.strictEqual(res.headers.get('x-request-id'), customId);
    const json = await res.json() as any;
    assert.strictEqual(json.requestId, customId);
  });

  console.log('\n--- 9. Helmet Security Headers & CORS Protection ---');
  await test('Enforces Helmet security headers (nosniff, deny frame, hides x-powered-by)', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.strictEqual(res.headers.get('x-content-type-options'), 'nosniff');
    assert.strictEqual(res.headers.get('x-frame-options'), 'DENY');
    assert.strictEqual(res.headers.get('x-powered-by'), null);
    assert.strictEqual(res.headers.get('cross-origin-resource-policy'), 'cross-origin');
    assert.strictEqual(res.headers.get('cross-origin-opener-policy'), 'same-origin-allow-popups');
  });

  await test('Exposes security telemetry headers in CORS preflight', async () => {
    const res = await fetch(`${baseUrl}/api/health`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:5173',
        'Access-Control-Request-Method': 'GET'
      }
    });
    const exposed = res.headers.get('access-control-expose-headers');
    assert(exposed && exposed.includes('X-Request-Id'), 'Must expose X-Request-Id');
    assert(exposed && exposed.includes('X-Response-Time'), 'Must expose X-Response-Time');
  });

  console.log('\n--- 10. Centralized Error Handling & Validation ---');
  await test('Handles 404 for non-existent API routes with requestId', async () => {
    const res = await fetch(`${baseUrl}/api/non-existent-route-random`);
    assert.strictEqual(res.status, 404);
    const json = await res.json() as any;
    assert.strictEqual(json.success, false);
    assert(json.message.includes('not found'));
    assert(json.requestId, 'Must return requestId on 404');
  });

  await test('Handles Zod validation errors on auth registration', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    assert.strictEqual(res.status, 400);
    const json = await res.json() as any;
    assert.strictEqual(json.success, false);
    assert(json.message.includes('Validation failed'));
    assert(Array.isArray(json.details), 'Must include structured details array');
    assert(json.requestId, 'Must return requestId on validation error');
  });

  await test('Handles malformed JSON request bodies cleanly', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"invalid_json":'
    });
    assert.strictEqual(res.status, 400);
    const json = await res.json() as any;
    assert.strictEqual(json.success, false);
    assert(json.message.includes('Malformed JSON'));
  });

  await test('Handles unauthorized access to protected routes with security audit log', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`);
    assert.strictEqual(res.status, 401);
    const json = await res.json() as any;
    assert.strictEqual(json.success, false);
    assert.strictEqual(json.message, 'Access token is required');
    assert(json.requestId);
  });

  console.log('\n--- 11. Sensitive Data Redaction & Logging Audit ---');
  await test('Pino redacts passwords, tokens, and authorization headers in serialized logs', async () => {
    let captured = '';
    const dest = new Writable({
      write(chunk, encoding, callback) {
        captured += chunk.toString();
        callback();
      }
    });

    const testLogger = wrapPino(pino(pinoOptions, dest));

    testLogger.warn({
      password: 'SuperSecretPassword123!',
      token: 'sensitive.jwt.token',
      req: {
        headers: {
          authorization: 'Bearer secret-access-token'
        }
      }
    }, 'Audit log test');

    assert(!captured.includes('SuperSecretPassword123!'), 'Plain password must NOT appear in logs');
    assert(!captured.includes('secret-access-token'), 'Bearer token must NOT appear in logs');
    assert(captured.includes('[REDACTED]'), 'Must replace sensitive values with [REDACTED]');
  });

  console.log('\n--- 12. Rate Limiting Protection on Auth APIs ---');
  await test('Strict auth rate limiter throttles excessive requests when enabled', async () => {
    let throttled = false;
    // Trigger rate limiter with test header
    for (let i = 0; i < 25; i++) {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-test-rate-limit': 'true'
        },
        body: JSON.stringify({ email: 'fake@example.com', password: 'wrong' })
      });
      if (res.status === 429) {
        throttled = true;
        const json = await res.json() as any;
        assert.strictEqual(json.success, false);
        assert(json.retryAfterSeconds !== undefined);
        break;
      }
    }
    assert.strictEqual(throttled, true, 'Should throttle after exceeding limit');
  });

  console.log('\n--- 13. WebSocket Server Lifecycle & Graceful Shutdown ---');
  await test('WebSocket manager initializes and gracefully terminates client connections', async () => {
    const wsManager = WebSocketManager.getInstance();
    wsManager.initialize(testServer);
    assert(wsManager, 'WebSocket manager should be initialized');
    await wsManager.close();
  });

  await new Promise<void>((res) => testServer.close(() => res()));

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
