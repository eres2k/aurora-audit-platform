import netlifyIdentity from 'netlify-identity-widget';

netlifyIdentity.init({ container: '#netlify-modal', locale: 'en' });

export const login = () => netlifyIdentity.open('login');
export const signup = () => netlifyIdentity.open('signup');
export const logout = () => netlifyIdentity.logout();

netlifyIdentity.on('login', (user) => {
  localStorage.setItem('netlifyToken', user.token.access_token);
});

netlifyIdentity.on('logout', () => {
  localStorage.removeItem('netlifyToken');
});

export const getUser = () => netlifyIdentity.currentUser();

export const hasRole = (role) => {
  const user = getUser();
  if (!user) return false;
  const roles = user.app_metadata.roles || [];
  return roles.includes(role);
};

export const refreshToken = async () => {
  const user = getUser();
  if (user) await user.jwt();
};
