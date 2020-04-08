import assert from 'assert';
import app from '../../src/app';

describe('\'authManagement\' service', () => {
  it('registered the service', () => {
    const service = app.service('authManagement');

    assert.ok(service, 'Registered the service');
  });
});
