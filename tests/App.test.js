import { render, screen } from '@testing-library/react';
import App from '../src/App';
import { BrowserRouter } from 'react-router-dom';

test('renders login page', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  expect(screen.getByText(/Aurora Audit Platform/i)).toBeInTheDocument();
});
