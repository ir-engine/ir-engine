import assert from 'assert';
import app from '../../src/app';

describe('\'email\' service', () => {
  it('registered the service', () => {
    const service = app.service('email');

    assert.ok(service, 'Registered the service');
  });
});
