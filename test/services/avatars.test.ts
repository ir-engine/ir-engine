import assert from 'assert';
import app from '../../src/app';

describe('\'avatars\' service', () => {
  it('registered the service', () => {
    const service = app.service('avatars');

    assert.ok(service, 'Registered the service');
  });
});
