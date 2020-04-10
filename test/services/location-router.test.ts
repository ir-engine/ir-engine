import assert from 'assert';
import app from '../../src/app';

describe('\'location-router\' service', () => {
  it('registered the service', () => {
    const service = app.service('location-router');

    assert.ok(service, 'Registered the service');
  });
});
