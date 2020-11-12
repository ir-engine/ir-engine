import config from '../../config';
import LocationSettingsSeed from '../location-settings/location-settings.seed';

export const seed = {
  disabled: !config.db.forceRefresh,
  delete: config.db.forceRefresh,
  randomize: false,
  path: 'location',
  templates:
    [
      {
          id: '98cbcc30-fd2d-11ea-bc7c-cd4cac9a8d61',
          name: 'Cool Island',
          slugifiedName: 'cool-island',
          maxUsersPerInstance: 2,
          locationSettingsId: LocationSettingsSeed.templates.find(template => template.locationId === '98cbcc30-fd2d-11ea-bc7c-cd4cac9a8d61').id
      },
      {
          id: 'a98b8470-fd2d-11ea-bc7c-cd4cac9a8d61',
          name: 'Arena',
          slugifiedName: 'arena',
          maxUsersPerInstance: 4,
          locationSettingsId: LocationSettingsSeed.templates.find(template => template.locationId === 'a98b8470-fd2d-11ea-bc7c-cd4cac9a8d61').id
      },
      {
          id: 'b5cf2a70-fd2d-11ea-bc7c-cd4cac9a8d61',
          name: 'VIP Club',
          slugifiedName: 'vip-club',
          maxUsersPerInstance: 2,
          locationSettingsId: LocationSettingsSeed.templates.find(template => template.locationId === 'b5cf2a70-fd2d-11ea-bc7c-cd4cac9a8d61').id
      }
    ],
    callback(location, seed): any {
      return seed({
          delete: false,
          path: 'location-settings',
          randomize: false,
          template: LocationSettingsSeed.templates.find(template => template.locationId === location.id)
      });
    }
};

export default seed;
