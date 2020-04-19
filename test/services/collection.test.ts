import assert from 'assert';
import app from '../../src/app';

describe('\'collection\' service', () => {
  it('registered the service', () => {
    const service = app.service('collection');

    assert.ok(service, 'Registered the service');
  });
});
