import app from '../../packages/server/app';

describe('\'a-i\' service', () => {
  it('registered the service', () => {
    const service = app.service('a-i');
    expect(service).toBeTruthy();
  });
});
