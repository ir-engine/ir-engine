import assert from 'assert';
import app from '../../src/app';

describe('\'video\' service', () => {
  it('registered the service', () => {
    const service = app.service('video');

    assert.ok(service, 'Registered the service');
  });
});
