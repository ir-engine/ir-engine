import assert from 'assert';
import app from '../../src/app';

describe('\'resolve-media\' service', () => {
  it('registered the service', () => {
    const service = app.service('resolve-media');

    assert.ok(service, 'Registered the service');
  });
});
