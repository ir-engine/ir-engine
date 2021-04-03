import config from '../../config';

export const seed = {
  disabled: !config.db.forceRefresh,
  delete: config.db.forceRefresh,
  randomize: false,
  path: 'location-settings',
  templates:
    [
      {
          id: '37ce32f0-208d-11eb-b02f-37cfdadfe58c',
          locationId: '98cbcc30-fd2d-11ea-bc7c-cd4cac9a8d61',
          locationType: 'public',
          videoEnabled: true,
          instanceMediaChatEnabled: true
      }
    ]
};

export default seed;
