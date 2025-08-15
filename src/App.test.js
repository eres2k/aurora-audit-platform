import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app title', () => {
  render(<App />);
  const headingElement = screen.getByText(/Aurora Audit Platform/i);
  expect(headingElement).toBeInTheDocument();
});
