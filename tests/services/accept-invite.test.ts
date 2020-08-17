import app from '../../app';

describe('\'a-i\' service', () => {
  it('registered the service', () => {
    const service = app.service('a-i');
    expect(service).toBeTruthy();
  });
});
