import config from '../../appconfig'

export const locationSettingsSeed = {
  randomize: false,
  path: 'location-settings',
  templates: [
    {
      id: '37ce32f0-208d-11eb-b02f-37cfdadfe58c',
      locationId: '98cbcc30-fd2d-11ea-bc7c-cd4cac9a8d61',
      locationType: 'public',
      videoEnabled: true,
      instanceMediaChatEnabled: true
    },
    {
      id: '37ce32f0-208d-11eb-b02f-37cfdadfe58d',
      locationId: '98cbcc30-fd2d-11ea-bc7c-cd4cac9a8d62',
      locationType: 'public',
      videoEnabled: false,
      instanceMediaChatEnabled: true
    },
    {
      id: '37ce32f0-208d-11eb-b02f-37cfdadfe58e',
      locationId: '98cbcc30-fd2d-11ea-bc7c-cd4cac9a8d63',
      locationType: 'public',
      videoEnabled: false,
      instanceMediaChatEnabled: true
    }
  ]
}
