import config from '../../config';

export const seed = {
  disabled: !config.db.forceRefresh,
  delete: config.db.forceRefresh,
  path: 'collection',
  randomize: false,
  templates: [
    {
      id: "d4457fc0-24e4-11eb-bc2e-e7e742fb069f",
      sid: "j9o2NLiD",
      name: "Test",
      description: null,
      version: 4,
      metadata: { name:'Crater' },
      isPublic: 1,
      createdAt: "2020-11-12 10:54:59",
      updatedAt: "2020-11-12 10:54:59",
      type: "project",
      thumbnailOwnedFileId: "44a11500-2b1f-11eb-a470-b153dec5b223",
    }
  ]
};

export default seed;
