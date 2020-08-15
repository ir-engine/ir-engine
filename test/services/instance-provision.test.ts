import app from '../../server/app';

describe('\'instance-provision\' service', () => {
  it('registered the service', () => {
    const service = app.service('instance-provision');
    expect(service).toBeTruthy();
  });
});
