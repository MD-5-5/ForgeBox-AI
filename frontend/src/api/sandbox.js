/**
 * Sandbox API helpers
 * All requests include credentials (cookies) for auth-protected endpoints.
 */

const BASE = '/api/sandbox';

/**
 * Fetch all projects for the authenticated user.
 * GET /api/sandbox/project
 */
export async function fetchProjects() {
  const res = await fetch(`${BASE}/projects`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to fetch projects (${res.status})`);
  }
  return res.json(); // { message, projects }
}

/**
 * Create a new project.
 * POST /api/sandbox/project
 * @param {string} title
 */
export async function createProject(title) {
  const res = await fetch(`${BASE}/project`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to create project (${res.status})`);
  }
  return res.json(); // { message, project }
}

/**
 * Start a sandbox for a project.
 * POST /api/sandbox/start
 * @param {string} projectId
 */
export async function startSandbox(projectId) {
  const res = await fetch(`${BASE}/start`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to start sandbox (${res.status})`);
  }
  return res.json(); // { message, sandboxId, previewUrl }
}
