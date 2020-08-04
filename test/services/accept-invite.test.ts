import app from '../../server/app';

describe('\'accept-invite\' service', () => {
  it('registered the service', () => {
    const service = app.service('accept-invite');
    expect(service).toBeTruthy();
  });
});
