import { vi, beforeAll, afterAll, MockInstance } from 'vitest';

let consoleErrorMock: MockInstance;

beforeAll(() => {
  // for suppressing console errors
  consoleErrorMock = vi
    .spyOn(console, 'error')
    .mockImplementation(() => vi.fn());

  class DOMTokenList extends Array {
    constructor() {
      super();
    }

    add(value: string) {
      this.push(value);
    }

    contains(value: string) {
      return this.includes(value);
    }
  }

  // This is a temporary workaround because JSDom does not support the part attribute yet
  Object.defineProperty(window.Element.prototype, 'part', {
    get: function () {
      if (this._part === undefined) {
        this._part = new DOMTokenList();
      }
      return this._part;
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window.Element.prototype as any)._attachShadow =
    window.Element.prototype.attachShadow;
  window.Element.prototype.attachShadow = function () {
    // @ts-expect-error Enforce open shadow root for testing purposes
    return this._attachShadow({ mode: 'open' });
  };
});

afterAll(() => {
  consoleErrorMock.mockRestore();
});
