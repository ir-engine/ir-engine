import assert from 'assert';
import app from '../../src/app';

describe('\'IdentityProviderType\' service', () => {
  it('registered the service', () => {
    const service = app.service('identity-provider-type');

    assert.ok(service, 'Registered the service');
  });
});
