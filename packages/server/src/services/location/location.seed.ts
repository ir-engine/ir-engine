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
          name: 'Home',
          slugifiedName: 'home',
          maxUsersPerInstance: 30,
          sceneId: 'j9o2NLiD',
          locationSettingsId: LocationSettingsSeed.templates.find(template => template.locationId === '98cbcc30-fd2d-11ea-bc7c-cd4cac9a8d61').id,
          location_setting: LocationSettingsSeed.templates.find(template => template.locationId === '98cbcc30-fd2d-11ea-bc7c-cd4cac9a8d61')
      }
    ]
};

export default seed;
