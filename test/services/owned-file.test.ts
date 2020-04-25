import assert from 'assert';
import app from '../../src/app';

describe('\'OwnedFile\' service', () => {
  it('registered the service', () => {
    const service = app.service('owned-file');

    assert.ok(service, 'Registered the service');
  });
});
