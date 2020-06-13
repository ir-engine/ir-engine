import assert from 'assert';
import app from '../../src/app';

describe('\'media-resolve\' service', () => {
  it('registered the service', () => {
    const service = app.service('media-resolve');

    assert.ok(service, 'Registered the service');
  });
});
