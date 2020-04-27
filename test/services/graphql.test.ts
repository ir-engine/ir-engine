import assert from 'assert';
import app from '../../src/app';

describe('\'graphql\' service', () => {
  it('registered the service', () => {
    const service = app.service('graphql');

    assert.ok(service, 'Registered the service');
  });
});
