import app from '../../packages/server/app';

describe('\'login\' service', () => {
  it('registered the service', () => {
    const service = app.service('login');
    expect(service).toBeTruthy();
  });
});
