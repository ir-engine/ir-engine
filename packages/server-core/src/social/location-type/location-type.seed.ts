import config from '../../appconfig'

export const locationTypeSeed = {
  path: 'location-type',
  randomize: false,
  templates: [
    { type: 'private' },
    { type: 'public' }, // parse metadata for video staticResourceType (eg 360-eac)
    { type: 'showroom' }
  ]
}
