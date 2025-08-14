import { render, screen } from '@testing-library/react';
import App from './App';

// Mock auth context to avoid requiring AuthProvider in tests
jest.mock('./contexts/AuthContext', () => ({
  useAuth: () => ({ user: null, loading: true })
}));

test('renders loading state', () => {
  render(<App />);
  expect(screen.getByText(/Loading Aurora Audit Platform/i)).toBeInTheDocument();
});
