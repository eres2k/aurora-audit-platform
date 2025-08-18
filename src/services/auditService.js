import netlifyIdentity from 'netlify-identity-widget';

const API = '/.netlify/functions/audits';

const authHeaders = () => {
  const user = netlifyIdentity.currentUser();
  return user ? { Authorization: `Bearer ${user.token.access_token}` } : {};
};

export const auditService = {
  async getAll() {
    const res = await fetch(API, { headers: authHeaders() });
    return res.json();
  },
  async get(id) {
    const res = await fetch(`${API}?id=${id}`, { headers: authHeaders() });
    return res.json();
  },
  async create(data) {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  async update(id, data) {
    const res = await fetch(API, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ ...data, id }),
    });
    return res.json();
  },
  async remove(id) {
    const res = await fetch(API, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ id }),
    });
    return res.json();
  },
};
