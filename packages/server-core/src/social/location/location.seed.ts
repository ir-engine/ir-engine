import config from '../../appconfig'
import { locationSettingsSeed } from '../location-settings/location-settings.seed'

export const locationSeed = {
  randomize: false,
  path: 'location',
  templates: [
    {
      id: '98cbcc30-fd2d-11ea-bc7c-cd4cac9a8d61',
      name: 'Test',
      slugifiedName: 'test',
      maxUsersPerInstance: 30,
      sceneId: 'j9o2NLiD',
      location_setting: locationSettingsSeed.templates.find(
        (template) => template.locationId === '98cbcc30-fd2d-11ea-bc7c-cd4cac9a8d61'
      ),
      isLobby: false
    }
  ]
}
