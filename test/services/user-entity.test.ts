import assert from 'assert';
import app from '../../src/app';

describe('\'user-entity\' service', () => {
  it('registered the service', () => {
    const service = app.service('user-entity');

    assert.ok(service, 'Registered the service');
  });
});
