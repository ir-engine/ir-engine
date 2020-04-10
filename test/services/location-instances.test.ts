import assert from 'assert';
import app from '../../src/app';

describe('\'instance\' service', () => {
  it('registered the service', () => {
    const service = app.service('instance');

    assert.ok(service, 'Registered the service');
  });
});
