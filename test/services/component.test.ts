import assert from 'assert';
import app from '../../src/app';

describe('\'component\' service', () => {
  it('registered the service', () => {
    const service = app.service('component');

    assert.ok(service, 'Registered the service');
  });
});
