import assert from 'assert';
import app from '../../src/app';

describe('\'GroupMember\' service', () => {
  it('registered the service', () => {
    const service = app.service('group-member');

    assert.ok(service, 'Registered the service');
  });
});
