import assert from 'assert';
import app from '../../src/app';

describe('\'resource\' service', () => {
  it('registered the service', () => {
    const service = app.service('resource');

    assert.ok(service, 'Registered the service');
  });
});
