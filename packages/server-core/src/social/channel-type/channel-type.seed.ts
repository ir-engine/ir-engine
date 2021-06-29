import config from '../../appconfig';

export const channelTypeSeed = {
  disabled: !config.db.forceRefresh,
  delete: config.db.forceRefresh,
  path: 'channel-type',
  randomize: false,
  templates:
        [
          { type: 'user' },
          { type: 'group' },
          { type: 'party' },
          { type: 'instance' }
        ]
};
