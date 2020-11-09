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
      },
      {
          id: '44c80990-208d-11eb-b02f-37cfdadfe58c',
          locationId: 'a98b8470-fd2d-11ea-bc7c-cd4cac9a8d61',
          locationType: 'showroom',
          videoEnabled: false,
          instanceMediaChatEnabled: true
      },
      {
          id: '5189b930-208d-11eb-b02f-37cfdadfe58c',
          locationId: 'b5cf2a70-fd2d-11ea-bc7c-cd4cac9a8d61',
          locationType: 'private',
          videoEnabled: false,
          instanceMediaChatEnabled: false
      }
    ]
};

export default seed;
