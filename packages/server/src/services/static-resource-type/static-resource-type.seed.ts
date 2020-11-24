import config from '../../config';

export const seed = {
  disabled: !config.db.forceRefresh,
  delete: config.db.forceRefresh,
  path: 'static-resource-type',
  randomize: false,
  templates: [
    { type: 'image' },
    { type: 'video' }, // parse metadata for video staticResourceType (eg 360-eac)
    { type: 'audio' },
    { type: 'model3d' },
    { type: 'script' },
    { type: 'volumetric' }, // any volumetric file, parse metadata for staticResourceType
    { type: 'json' }, // JSON data
    { type: 'user-thumbnail' }, // User avatar profile thumbnail
    { type: 'data' } // arbitrary data of any other type
  ]
};

export default seed;
