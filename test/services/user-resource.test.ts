import assert from 'assert';
import app from '../../src/app';

describe('\'user-resource\' service', () => {
  it('registered the service', () => {
    const service = app.service('user-resource');

    assert.ok(service, 'Registered the service');
  });
});
