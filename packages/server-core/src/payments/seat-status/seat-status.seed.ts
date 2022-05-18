import config from '../../appconfig'

export const seed = {
  path: 'seat-status',
  randomize: false,
  templates: [{ status: 'pending' }, { status: 'filled' }]
}

export default seed
