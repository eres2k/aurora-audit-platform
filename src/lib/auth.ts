import netlifyIdentity from 'netlify-identity-widget';
import type { User } from '@/types';

netlifyIdentity.init();

type AuthListener = (user: User | null) => void;
const listeners = new Set<AuthListener>();

const mapIdentityUser = (identityUser: any): User | null => {
  if (!identityUser) return null;

  return {
    id: identityUser.id,
    email: identityUser.email,
    name: identityUser.user_metadata?.name || identityUser.email,
    role: (identityUser.app_metadata as any)?.role || 'VIEWER',
    siteIds: (identityUser.user_metadata as any)?.site_ids || [],
  };
};

const getCurrentUser = (): User | null => {
  return mapIdentityUser(netlifyIdentity.currentUser());
};

const notifyAuthChange = () => {
  const currentUser = getCurrentUser();
  listeners.forEach((listener) => listener(currentUser));
};

netlifyIdentity.off?.('login', notifyAuthChange);
netlifyIdentity.off?.('logout', notifyAuthChange);
netlifyIdentity.on('login', notifyAuthChange);
netlifyIdentity.on('logout', notifyAuthChange);

export const auth = {
  login: async (email: string, password: string) => {
    const client = netlifyIdentity.gotrue;
    if (!client) {
      throw new Error('Netlify Identity client unavailable');
    }

    const user = await client.login(email, password, true);
    if (user) {
      (netlifyIdentity as any).store.user = user;
    }
    notifyAuthChange();
  },

  logout: async () => {
    await netlifyIdentity.logout();
    (netlifyIdentity as any).store.user = null;
    notifyAuthChange();
  },

  signup: async (email: string, password: string) => {
    const client = netlifyIdentity.gotrue;
    if (!client) {
      throw new Error('Netlify Identity client unavailable');
    }

    const user = await client.signup(email, password);
    if (user) {
      (netlifyIdentity as any).store.user = user;
    }
    notifyAuthChange();
  },

  getCurrentUser,

  getToken: () => {
    const user = netlifyIdentity.currentUser();
    return user?.token?.access_token;
  },

  onAuthChange: (callback: AuthListener) => {
    listeners.add(callback);
    return () => {
      listeners.delete(callback);
    };
  },
};
