import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// Mock AuthContext to bypass real authentication logic
jest.mock('./contexts/AuthContext', () => ({
  useAuth: () => ({ user: null, loading: false })
}));

test('renders login screen by default', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );

  // The login component contains a "Sign In" button
  const buttonElement = screen.getByText(/sign in/i);
  expect(buttonElement).toBeInTheDocument();
});
