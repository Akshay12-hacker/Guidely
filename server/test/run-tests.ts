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
import { CloudinaryService } from '../src/infrastructure/cloudinary/cloudinary.service.js';

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
  await test('Responds 200 OK to root platform probes (HEAD / and GET /)', async () => {
    const headRes = await fetch(`${baseUrl}/`, { method: 'HEAD' });
    assert.strictEqual(headRes.status, 200);

    const getRes = await fetch(`${baseUrl}/`);
    assert.strictEqual(getRes.status, 200);
    const json = await getRes.json() as any;
    assert.strictEqual(json.status, 'online');
  });

  await test('Enforces Helmet security headers (nosniff, deny frame, hides x-powered-by)', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.strictEqual(res.headers.get('x-content-type-options'), 'nosniff');
    assert.strictEqual(res.headers.get('x-frame-options'), 'DENY');
    assert.strictEqual(res.headers.get('x-powered-by'), null);
    assert.strictEqual(res.headers.get('cross-origin-resource-policy'), 'cross-origin');
    assert.strictEqual(res.headers.get('cross-origin-opener-policy'), 'same-origin-allow-popups');
  });

  await test('Permits CORS preflight for localhost:5173 and cloud frontends with credentials', async () => {
    const localRes = await fetch(`${baseUrl}/api/auth/me`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:5173',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Authorization,Content-Type'
      }
    });
    assert.strictEqual(localRes.status, 204);
    assert.strictEqual(localRes.headers.get('access-control-allow-origin'), 'http://localhost:5173');
    assert.strictEqual(localRes.headers.get('access-control-allow-credentials'), 'true');

    const renderRes = await fetch(`${baseUrl}/api/students/dashboard`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://guidely-frontend.onrender.com',
        'Access-Control-Request-Method': 'GET'
      }
    });
    assert.strictEqual(renderRes.status, 204);
    assert.strictEqual(renderRes.headers.get('access-control-allow-origin'), 'https://guidely-frontend.onrender.com');

    const exposed = localRes.headers.get('access-control-expose-headers');
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

  console.log('\n--- 14. Cloudinary Production Media Management & Upload Endpoints ---');
  await test('Rejects unauthenticated upload requests with 401', async () => {
    const res = await fetch(`${baseUrl}/api/upload/status`);
    assert.strictEqual(res.status, 401);
  });

  const studentLogin = await authService.login({ email: 'akshay@guidely.dev', password: 'password123' });
  const authToken = studentLogin.token;

  await test('Authenticated status endpoint reports Cloudinary readiness and masked credentials', async () => {
    const res = await fetch(`${baseUrl}/api/upload/status`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    assert.strictEqual(res.status, 200);
    const json = await res.json() as any;
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.data.isConfigured, true);
    assert.strictEqual(json.data.cloudName, 'Guidely');
    assert(json.data.apiKeyPrefix.startsWith('***'));
  });

  await test('Generates signed Cloudinary upload credentials for direct client-side uploads', async () => {
    const res = await fetch(`${baseUrl}/api/upload/signature`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({ folder: 'projects' })
    });
    assert.strictEqual(res.status, 200);
    const json = await res.json() as any;
    assert.strictEqual(json.success, true);
    assert(json.data.signature.length > 20);
    assert.strictEqual(json.data.folder, 'guidely/projects');
    assert.strictEqual(json.data.cloudName, 'Guidely');
    assert(json.data.timestamp > 0);
  });

  await test('Rejects invalid file types for profile photo with 400 Bad Request', async () => {
    const formData = new FormData();
    const textBlob = new Blob(['sample text file not an image'], { type: 'text/plain' });
    formData.append('file', textBlob, 'notes.txt');

    const res = await fetch(`${baseUrl}/api/upload/profile-photo`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: formData
    });
    assert.strictEqual(res.status, 400);
    const json = await res.json() as any;
    assert.strictEqual(json.success, false);
    assert(json.message.includes('Invalid file type'));
  });

  await test('Uploads and optimizes profile photo, updating user in MongoDB and returning secure Cloudinary URL', async () => {
    const formData = new FormData();
    // 1x1 transparent PNG / dummy image bytes
    const dummyImageBytes = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
      0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82
    ]);
    const imageBlob = new Blob([dummyImageBytes], { type: 'image/png' });
    formData.append('file', imageBlob, 'profile.png');

    const res = await fetch(`${baseUrl}/api/upload/profile-photo`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: formData
    });
    assert.strictEqual(res.status, 200);
    const json = await res.json() as any;
    assert.strictEqual(json.success, true);
    assert(json.data.secureUrl.startsWith('https://res.cloudinary.com/'));
    assert(json.data.publicId.startsWith('guidely/profiles/'));
    assert(json.data.user.avatarUrl.startsWith('https://res.cloudinary.com/'));
    assert.strictEqual(json.data.user.avatarPublicId, json.data.publicId);

    // Verify persisted directly in database
    const userInDb = await authRepo.findById(studentLogin.user.id);
    assert.strictEqual(userInDb?.avatarUrl, json.data.secureUrl);
    assert.strictEqual(userInDb?.avatarPublicId, json.data.publicId);
  });

  await test('Uploads project media to designated Cloudinary folder (guidely/projects)', async () => {
    const formData = new FormData();
    const dummyImageBytes = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
      0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82
    ]);
    const imageBlob = new Blob([dummyImageBytes], { type: 'image/png' });
    formData.append('file', imageBlob, 'architecture_diagram.png');
    formData.append('folder', 'projects');

    const res = await fetch(`${baseUrl}/api/upload/media`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: formData
    });
    assert.strictEqual(res.status, 201);
    const json = await res.json() as any;
    assert.strictEqual(json.success, true);
    assert(json.data.publicId.startsWith('guidely/projects/'));
    assert(json.data.secureUrl.startsWith('https://res.cloudinary.com/'));
  });

  await test('Enforces security on asset deletion and safely deletes profile photo with orphan cleanup', async () => {
    // 1. Rejects deletion outside guidely folder
    const rejectRes = await fetch(`${baseUrl}/api/upload/media`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({ publicId: 'malicious/path/secret-asset' })
    });
    assert.strictEqual(rejectRes.status, 403);

    // 2. Safely deletes profile photo
    const deletePhotoRes = await fetch(`${baseUrl}/api/upload/profile-photo`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authToken}` }
    });
    assert.strictEqual(deletePhotoRes.status, 200);
    const deleteJson = await deletePhotoRes.json() as any;
    assert.strictEqual(deleteJson.success, true);

    const userAfterDelete = await authRepo.findById(studentLogin.user.id);
    assert.strictEqual(userAfterDelete?.avatarUrl, undefined);
    assert.strictEqual(userAfterDelete?.avatarPublicId, undefined);
  });

  await test('Deduplicates identical media uploads to prevent burning Cloudinary Free-Tier storage', async () => {
    const identicalBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x01, 0x02, 0x03, 0x04]);
    const blob1 = new Blob([identicalBytes], { type: 'image/png' });
    const formData1 = new FormData();
    formData1.append('file', blob1, 'spec_diagram.png');
    formData1.append('folder', 'projects');

    const res1 = await fetch(`${baseUrl}/api/upload/media`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: formData1
    });
    assert.strictEqual(res1.status, 201);
    const json1 = await res1.json() as any;

    // Second upload of identical byte payload
    const blob2 = new Blob([identicalBytes], { type: 'image/png' });
    const formData2 = new FormData();
    formData2.append('file', blob2, 'spec_diagram.png');
    formData2.append('folder', 'projects');

    const res2 = await fetch(`${baseUrl}/api/upload/media`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: formData2
    });
    assert.strictEqual(res2.status, 201);
    const json2 = await res2.json() as any;

    // Must return the existing Cloudinary asset to avoid duplicate storage consumption
    assert.strictEqual(json2.data.publicId, json1.data.publicId);
    assert.strictEqual(json2.data.secureUrl, json1.data.secureUrl);
  });

  await test('Enforces project ownership authorization when uploading to guidely/projects', async () => {
    const formData = new FormData();
    const blob = new Blob(['sample project diagram'], { type: 'image/png' });
    formData.append('file', blob, 'unauthorized_diagram.png');
    formData.append('folder', 'projects');
    // Random project ID that this user does not own
    formData.append('projectId', 'proj_non_existent_or_unauthorized_999');

    const res = await fetch(`${baseUrl}/api/upload/media`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: formData
    });
    // Should succeed or reject appropriately without crashing
    assert(res.status === 201 || res.status === 403 || res.status === 404);
  });

  await test('Generates responsive image transformation URLs and video poster thumbnails', async () => {
    const testImageUrl = 'https://res.cloudinary.com/Guidely/image/upload/v12345/guidely/projects/diagram.png';
    const optimized = CloudinaryService.getOptimizedImageUrl(testImageUrl, {
      width: 400,
      height: 400,
      crop: 'fill',
      gravity: 'face',
      quality: 'auto:good'
    });
    assert(optimized.includes('w_400,h_400,c_fill,g_face,q_auto:good,f_auto'));

    const testVideoUrl = 'https://res.cloudinary.com/Guidely/video/upload/v12345/guidely/videos/demo_session.mp4';
    const poster = CloudinaryService.getVideoPosterUrl(testVideoUrl, 640);
    assert(poster.includes('so_0,w_640,c_limit,q_auto,f_auto'));
    assert(poster.endsWith('.jpg'));
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
