import app from '../../packages/server/src/app';

describe('\'loadbalancer-provision\' service', () => {
  it('registered the service', () => {
    const service = app.service('loadbalancer-provision');
    expect(service).toBeTruthy();
  });
});
