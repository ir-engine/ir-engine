import assert from 'assert';
import app from '../../src/app';

describe('\'Asset\' service', () => {
  it('registered the service', () => {
    const service = app.service('asset');

    assert.ok(service, 'Registered the service');
  });
});
