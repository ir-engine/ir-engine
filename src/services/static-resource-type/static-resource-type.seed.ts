export const seed = {
  disabled: (process.env.FORCE_DB_REFRESH !== 'true'),
  delete: (process.env.FORCE_DB_REFRESH === 'true'),
  path: 'static-resource-type',
  randomize: false,
  templates: [
    { type: 'image' },
    { type: 'video' }, // parse metadata for video type (eg 360-eac)
    { type: 'audio' },
    { type: 'model3d' },
    { type: 'script' },
    { type: 'volumetric' }, // any volumetric file, parse metadata for type
    { type: 'json' }, // JSON data
    { type: 'data' } // arbitrary data of any other type
  ]
}

export default seed
