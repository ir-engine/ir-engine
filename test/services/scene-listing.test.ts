import assert from 'assert';
import app from '../../src/app';

describe('\'sceneListing\' service', () => {
  it('registered the service', () => {
    const service = app.service('scene-listing');

    assert.ok(service, 'Registered the service');
  });
});
