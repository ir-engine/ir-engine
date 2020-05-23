import assert from 'assert';
import app from '../../src/app';

describe('\'seat-status\' service', () => {
  it('registered the service', () => {
    const service = app.service('seat-status');

    assert.ok(service, 'Registered the service');
  });
});
