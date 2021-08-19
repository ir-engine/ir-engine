
navigator.xr = {
  requestSession: async () => new XRSesion,
  isSessionSupported: async () => true,
}

/*
Object.defineProperty(navigator.xr, 'requestSession', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
})
*/