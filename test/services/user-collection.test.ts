import assert from 'assert';
import app from '../../src/app';

describe('\'user-collection\' service', () => {
  it('registered the service', () => {
    const service = app.service('user-collection');

    assert.ok(service, 'Registered the service');
  });
});
