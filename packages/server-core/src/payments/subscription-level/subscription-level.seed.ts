import config from '../../appconfig';

export const subscriptionLevelSeed = {
  disabled: !config.db.forceRefresh,
  delete: config.db.forceRefresh,
  path: 'subscription-level',
  randomize: false,
  templates: [
    { level: 'all' },
    { level: 'paid' }
  ]
};