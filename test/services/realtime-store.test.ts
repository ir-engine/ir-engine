import assert from 'assert';
import app from '../../src/app';

describe('\'realtime-store\' service', () => {
  it('registered the service', () => {
    const service = app.service('realtime-store');

    assert.ok(service, 'Registered the service');
  });
});
