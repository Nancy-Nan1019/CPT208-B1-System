import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Auth
export const authApi = {
  register: (data: { email: string; password: string; name: string; role: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
};

// Sessions
export const sessionsApi = {
  list: () => api.get('/sessions'),
  create: (data: { topic: string; duration: number; groupSize: number }) =>
    api.post('/sessions', data),
  get: (id: string) => api.get(`/sessions/${id}`),
  update: (id: string, data: Partial<{ status: string; topic: string; duration: number }>) =>
    api.patch(`/sessions/${id}`, data),
  getGroups: (id: string) => api.get(`/sessions/${id}/groups`),
  createGroups: (id: string, data: { groups: { name: string; memberIds: string[] }[] }) =>
    api.post(`/sessions/${id}/groups`, data),
};

// Groups
export const groupsApi = {
  getMembers: (groupId: string) => api.get(`/groups/${groupId}/members`),
  addMember: (groupId: string, userId: string) =>
    api.post(`/groups/${groupId}/members`, { userId }),
  removeMember: (groupId: string, userId: string) =>
    api.delete(`/groups/${groupId}/members/${userId}`),
};

// Speaking
export const speakingApi = {
  heartbeat: (data: { groupId: string; userId: string }) => api.post('/speaking', data),
};

// Scores
export const scoresApi = {
  getBySession: (sessionId: string) => api.get(`/scores?sessionId=${sessionId}`),
  getByGroup: (groupId: string) => api.get(`/scores?groupId=${groupId}`),
};

// AI Guidance
export const aiApi = {
  getGuidance: (data: {
    topic: string;
    triggerType: 'individual_silence' | 'group_silence' | 'time_warning';
    silentUsers?: string[];
    sessionId: string;
    groupId: string;
  }) => api.post('/ai/guidance', data),
};

export default api;
