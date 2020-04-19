import assert from 'assert';
import app from '../../src/app';

describe('\'thumbnail\' service', () => {
  it('registered the service', () => {
    const service = app.service('thumbnail');

    assert.ok(service, 'Registered the service');
  });
});
