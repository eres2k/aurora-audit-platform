import netlifyIdentity from 'netlify-identity-widget';
import type { User } from '@/types';

netlifyIdentity.init();

export const auth = {
  login: (email: string, password: string) => {
    return netlifyIdentity.login(email, password);
  },

  logout: () => {
    return netlifyIdentity.logout();
  },

  signup: (email: string, password: string) => {
    return netlifyIdentity.signup(email, password);
  },

  getCurrentUser: (): User | null => {
    const user = netlifyIdentity.currentUser();
    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || user.email,
      role: (user.app_metadata as any)?.role || 'VIEWER',
      siteIds: (user.user_metadata as any)?.site_ids || []
    };
  },

  getToken: () => {
    const user = netlifyIdentity.currentUser();
    return user?.token?.access_token;
  },

  onAuthChange: (callback: (user: User | null) => void) => {
    const handleLogin = () => callback(auth.getCurrentUser());
    const handleLogout = () => callback(null);

    netlifyIdentity.on('login', handleLogin);
    netlifyIdentity.on('logout', handleLogout);

    return () => {
      netlifyIdentity.off('login', handleLogin);
      netlifyIdentity.off('logout', handleLogout);
    };
  }
};
