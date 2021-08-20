import config from '../../appconfig'

export const subscriptionLevelSeed = {
  path: 'subscription-level',
  randomize: false,
  templates: [{ level: 'all' }, { level: 'paid' }]
}
