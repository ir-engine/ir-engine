import { locationSettingsSeed } from '../location-settings/location-settings.seed'
import { Location } from '@xrengine/common/src/interfaces/Location'

export const locationSeed = {
  randomize: false,
  path: 'location',
  templates: [
    {
      id: '98cbcc30-fd2d-11ea-bc7c-cd4cac9a8d61',
      name: 'Test',
      slugifiedName: 'test',
      maxUsersPerInstance: 30,
      sceneId: 'default-project/empty',
      location_settings: locationSettingsSeed.templates.find(
        (template) => template.locationId === '98cbcc30-fd2d-11ea-bc7c-cd4cac9a8d61'
      ),
      isLobby: false
    } as Location,
    {
      id: '98cbcc30-fd2d-11ea-bc7c-cd4cac9a8d62',
      name: 'Sky Station',
      slugifiedName: 'sky-station',
      maxUsersPerInstance: 30,
      sceneId: 'default-project/sky-station',
      location_settings: locationSettingsSeed.templates.find(
        (template) => template.locationId === '98cbcc30-fd2d-11ea-bc7c-cd4cac9a8d62'
      ),
      isLobby: false
    } as Location,
    {
      id: '98cbcc30-fd2d-11ea-bc7c-cd4cac9a8d63',
      name: 'Apartment',
      slugifiedName: 'apartment',
      maxUsersPerInstance: 30,
      sceneId: 'default-project/apartment',
      location_settings: locationSettingsSeed.templates.find(
        (template) => template.locationId === '98cbcc30-fd2d-11ea-bc7c-cd4cac9a8d63'
      ),
      isLobby: false
    } as Location,
    {
      id: '98cbcc30-fd2d-11ea-bc7c-cd4cac9a8d11',
      name: 'Game-CTF',
      slugifiedName: 'game-ctf',
      maxUsersPerInstance: 30,
      sceneId: 'default-project/default',
      location_settings: locationSettingsSeed.templates.find(
        (template) => template.locationId === '98cbcc30-fd2d-11ea-bc7c-cd4cac9a8d11'
      ),
      isLobby: false
    } as Location,
    {
      id: '98cbcc30-fd2d-11ea-bc7c-cd4cac9a8d12',
      name: 'Game-Tournament',
      slugifiedName: 'game-tournament',
      maxUsersPerInstance: 30,
      sceneId: 'default-project/default',
      location_settings: locationSettingsSeed.templates.find(
        (template) => template.locationId === '98cbcc30-fd2d-11ea-bc7c-cd4cac9a8d12'
      ),
      isLobby: false
    } as Location
  ]
}
