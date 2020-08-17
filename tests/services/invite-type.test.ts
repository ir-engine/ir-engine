import app from '../../packages/server/app';

describe('\'invite-type\' service', () => {
  it('registered the service', () => {
    const service = app.service('invite-type');
    expect(service).toBeTruthy();
  });
});
