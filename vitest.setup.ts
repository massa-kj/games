import { beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import '@testing-library/jest-dom/vitest';

// Mock scrollIntoView for jsdom
Element.prototype.scrollIntoView = function () { };

// Reset DOM state before each test
beforeEach(() => {
  document.head.innerHTML = '';
  document.body.innerHTML = '';
});
