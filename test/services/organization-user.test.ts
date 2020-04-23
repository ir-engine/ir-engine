import assert from 'assert';
import app from '../../src/app';

describe('\'organization-user\' service', () => {
  it('registered the service', () => {
    const service = app.service('organization-user');

    assert.ok(service, 'Registered the service');
  });
});
