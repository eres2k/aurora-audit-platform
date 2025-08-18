// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

jest.mock(
  'netlify-identity-widget',
  () => ({
    init: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    open: jest.fn(),
    close: jest.fn(),
    logout: jest.fn(),
    currentUser: jest.fn(() => null),
  }),
  { virtual: true }
);
