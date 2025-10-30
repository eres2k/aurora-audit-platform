

export interface AuthUser {
  sub: string;
  email: string;
  app_metadata: {
    role?: string;
  };
  user_metadata: {
    site_ids?: string[];
    name?: string;
  };
}

export const getUser = (context: any): AuthUser | null => {
  return context.clientContext?.user || null;
};

export const requireAuth = (user: AuthUser | null): AuthUser => {
  if (!user?.sub) {
    throw new Error('Unauthorized');
  }
  return user;
};

export const hasRole = (user: AuthUser, requiredRoles: string[]): boolean => {
  const userRole = user.app_metadata?.role || 'VIEWER';
  return requiredRoles.includes(userRole);
};

export const canAccessSite = (user: AuthUser, siteId: string): boolean => {
  const userRole = user.app_metadata?.role || 'VIEWER';
  if (userRole === 'WHS_ADMIN') return true;
  const siteIds = user.user_metadata?.site_ids || [];
  return siteIds.includes(siteId);
};

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
} as const;