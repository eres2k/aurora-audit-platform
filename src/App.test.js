import { render, screen } from '@testing-library/react';
import LoginPage from './pages/LoginPage';
import { AuthProvider } from './contexts/AuthContext';

test('renders login heading', () => {
  render(
    <AuthProvider>
      <LoginPage />
    </AuthProvider>
  );
  const headingElement = screen.getByText(/Aurora Audit Platform/i);
  expect(headingElement).toBeInTheDocument();
});
