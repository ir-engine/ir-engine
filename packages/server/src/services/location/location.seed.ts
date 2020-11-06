import config from '../../config';

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
          maxUsersPerInstance: 2
      },
      {
          id: 'a98b8470-fd2d-11ea-bc7c-cd4cac9a8d61',
          name: 'Arena',
          slugifiedName: 'arena',
          maxUsersPerInstance: 4,
          locationType: 'showroom'
      },
      {
          id: 'b5cf2a70-fd2d-11ea-bc7c-cd4cac9a8d61',
          name: 'VIP Club',
          slugifiedName: 'vip-club',
          maxUsersPerInstance: 2
      }
    ]
};

export default seed;
