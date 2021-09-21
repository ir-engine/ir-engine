import app from '../../packages/server/src/app';

describe('\'feed\' service', () => {
  it('registered the service', () => {
    const service = app.service('feed');
    expect(service).toBeTruthy();
  });
});
