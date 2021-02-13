import config from '../../config';

export const seed = {
  disabled: !config.db.forceRefresh,
  delete: config.db.forceRefresh,
  path: 'seat-status',
  randomize: false,
  templates: [
    { status: 'pending' },
    { status: 'filled' }
  ]
};

export default seed;
