import config from '../../config';

export const seed = {
  disabled: !config.db.forceRefresh,
  delete: config.db.forceRefresh,
  path: 'location-type',
  randomize: false,
  templates: [
    { type: 'private' },
    { type: 'public' }, // parse metadata for video staticResourceType (eg 360-eac)
    { type: 'showroom' }
  ]
};

export default seed;
