class DOMTokenList extends Array {
  constructor() {
    super();
  }

  add(value) {
    this.push(value);
  }

  contains(value) {
    return this.includes(value);
  }
}

export default {
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    beforeParse: (window) => {
      // This is a temporary workaround because JSDom does not support the part attribute yet
      Object.defineProperty(window.Element.prototype, 'part', {
        get: function () {
          if (this._part === undefined) {
            this._part = new DOMTokenList();
          }
          return this._part;
        },
      });
      // Enforce open shadow root for testing purposes
      window.Element.prototype._attachShadow =
        window.Element.prototype.attachShadow;
      window.Element.prototype.attachShadow = function () {
        return this._attachShadow({ mode: 'open' });
      };
    },
  },
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
  moduleNameMapper: {
    '\\.(css|svg)': '<rootDir>/tests/style-mock.cjs',
  },
};
