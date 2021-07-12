import config from '../../appconfig'

export const messageStatusSeed = {
  disabled: !config.db.forceRefresh,
  delete: config.db.forceRefresh,
  path: 'message-status',
  randomize: false,
  templates: [
    // Default Aframe components
    { type: 'unread' },
    { type: 'read' }
  ]
}
