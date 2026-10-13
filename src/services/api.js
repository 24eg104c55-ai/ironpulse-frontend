// Centralized API client for communicating with the Spring Boot backend

const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Generic fetch wrapper that handles JSON serialization,
 * error extracting, and status checking.
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data?.message || data?.error || `HTTP error! status: ${response.status}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    console.error(`API Error on [${options.method || 'GET'}] ${endpoint}:`, error.message);
    throw error;
  }
}

export const api = {
  // Authentication
  auth: {
    login: (credentials) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    register: (userData) =>
      request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
  },

  // Dashboard Stats
  dashboard: {
    getStats: () => request('/dashboard/stats'),
  },

  // Member Management
  members: {
    getAll: () => request('/members'),
    getById: (id) => request(`/members/${id}`),
    create: (memberData) =>
      request('/members', {
        method: 'POST',
        body: JSON.stringify(memberData),
      }),
    update: (id, memberData) =>
      request(`/members/${id}`, {
        method: 'PUT',
        body: JSON.stringify(memberData),
      }),
    delete: (id) =>
      request(`/members/${id}`, {
        method: 'DELETE',
      }),
  },

  // Membership Plans
  plans: {
    getAll: () => request('/plans'),
    getActive: () => request('/plans/active'),
    getById: (id) => request(`/plans/${id}`),
    create: (planData) =>
      request('/plans', {
        method: 'POST',
        body: JSON.stringify(planData),
      }),
    update: (id, planData) =>
      request(`/plans/${id}`, {
        method: 'PUT',
        body: JSON.stringify(planData),
      }),
    delete: (id) =>
      request(`/plans/${id}`, {
        method: 'DELETE',
      }),
  },

  // Plan Assignment & Subscriptions
  memberships: {
    assign: (assignmentData) =>
      request('/memberships/assign', {
        method: 'POST',
        body: JSON.stringify(assignmentData),
      }),
    getAll: () => request('/memberships'),
    getByUser: (userId) => request(`/memberships/user/${userId}`),
    getLatestByUser: (userId) => request(`/memberships/user/${userId}/latest`),
  },

  // Payments & Billing
  payments: {
    getAll: () => request('/payments'),
    getByUser: (userId) => request(`/payments/user/${userId}`),
    record: (paymentData) =>
      request('/payments', {
        method: 'POST',
        body: JSON.stringify(paymentData),
      }),
  },

  // Attendance Check-in / Check-out
  attendance: {
    checkIn: (userId) =>
      request('/attendance/check-in', {
        method: 'POST',
        body: JSON.stringify({ userId }),
      }),
    checkOut: (userId) =>
      request('/attendance/check-out', {
        method: 'POST',
        body: JSON.stringify({ userId }),
      }),
    getToday: () => request('/attendance/today'),
    getByUser: (userId) => request(`/attendance/user/${userId}`),
    getAll: () => request('/attendance'),
  },
};
