import assert from 'assert';
import app from '../../src/app';

describe('\'resource-type\' service', () => {
  it('registered the service', () => {
    const service = app.service('resource-type');

    assert.ok(service, 'Registered the service');
  });
});
