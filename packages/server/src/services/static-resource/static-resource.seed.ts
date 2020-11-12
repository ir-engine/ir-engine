import config from '../../config';
import LocationSettingsSeed from '../location-settings/location-settings.seed';

export const seed = {
  disabled: !config.db.forceRefresh,
  delete: config.db.forceRefresh,
  randomize: false,
  path: 'static-resource',
  templates:
  [
    {
      "id" : "80a038b0-24d5-11eb-83cc-f5ed32cf09b2",
      "sid" : "j9o2NLiD",
      "name" : null,
      "description" : null,
      "url" : "https://resources.xr3.xrengine.io/de5f08e0-24db-11eb-a67d-059c7ea6ab31.jpeg",
      "key" : "de5f08e0-24db-11eb-a67d-059c7ea6ab31.jpeg",
      "mimeType" : "image/jpeg",
      "metadata" : null,
      "createdAt" : "2020-11-12 11:40:32",
      "updatedAt" : "2020-11-12 11:40:32",
      "staticResourceType" : null,
      "subscriptionLevel" : null,
      "componentId" : null,
      "parentResourceId" : null
    }
  ]
};

export default seed;
