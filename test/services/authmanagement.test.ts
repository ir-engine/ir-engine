import assert from 'assert';
import app from '../../src/app';

describe('\'authmanagement\' service', () => {
  it('registered the service', () => {
    const service = app.service('authmanagement');

    assert.ok(service, 'Registered the service');
  });
});
