import assert from 'assert';
import app from '../../src/app';

describe('\'attribution\' service', () => {
  it('registered the service', () => {
    const service = app.service('attribution');

    assert.ok(service, 'Registered the service');
  });
});
