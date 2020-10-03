import config from '../../config';

export const seed = {
  disabled: !config.db.forceRefresh,
  delete: config.db.forceRefresh,
  path: 'message-status',
  randomize: false,
  templates:
        [
          // Default Aframe components
          { type: 'unread' },
          { type: 'read' }
        ]
};

export default seed;
