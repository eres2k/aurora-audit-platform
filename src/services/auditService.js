const API = '/.netlify/functions/audits';

export const auditService = {
  async getAll() {
    const res = await fetch(API);
    return res.json();
  },
  async get(id) {
    const res = await fetch(`${API}?id=${id}`);
    return res.json();
  },
  async create(data) {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  async update(id, data) {
    const res = await fetch(API, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, id }),
    });
    return res.json();
  },
  async remove(id) {
    const res = await fetch(API, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    return res.json();
  },
};
