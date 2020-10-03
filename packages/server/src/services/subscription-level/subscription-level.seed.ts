import config from '../../config';

export const seed = {
  disabled: !config.db.forceRefresh,
  delete: config.db.forceRefresh,
  path: 'subscription-level',
  randomize: false,
  templates: [
    { level: 'all' },
    { level: 'paid' }
  ]
};

export default seed;
