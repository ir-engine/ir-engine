import config from '../../appconfig'

export const messageStatusSeed = {
  path: 'message-status',
  randomize: false,
  templates: [
    // Default Aframe components
    { type: 'unread' },
    { type: 'read' }
  ]
}
