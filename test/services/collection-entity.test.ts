import assert from 'assert';
import app from '../../src/app';

describe('\'collection-entity\' service', () => {
  it('registered the service', () => {
    const service = app.service('collection-entity');

    assert.ok(service, 'Registered the service');
  });
});
