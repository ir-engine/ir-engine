import assert from 'assert';
import app from '../../src/app';

describe('\'seats\' service', () => {
  it('registered the service', () => {
    const service = app.service('seats');

    assert.ok(service, 'Registered the service');
  });
});
