import assert from 'assert';
import app from '../../src/app';

describe('\'OrganizationUserRank\' service', () => {
  it('registered the service', () => {
    const service = app.service('organization-user-rank');

    assert.ok(service, 'Registered the service');
  });
});
