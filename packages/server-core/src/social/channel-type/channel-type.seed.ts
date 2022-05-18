import config from '../../appconfig'

export const channelTypeSeed = {
  path: 'channel-type',
  randomize: false,
  templates: [{ type: 'user' }, { type: 'group' }, { type: 'party' }, { type: 'instance' }]
}
