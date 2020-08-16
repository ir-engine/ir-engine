import app from '../../app';

describe('\'invite\' service', () => {
  it('registered the service', () => {
    const service = app.service('invite');
    expect(service).toBeTruthy();
  });
});
