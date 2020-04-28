import assert from 'assert';
import app from '../../src/app';

describe('\'MediaSearch\' service', () => {
  it('registered the service', () => {
    const service = app.service('media/search');

    assert.ok(service, 'Registered the service');
  });
});
