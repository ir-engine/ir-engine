import config from '../../config';

export const seed = {
  disabled: !config.db.forceRefresh,
  delete: config.db.forceRefresh,
  path: 'collection',
  randomize: false,
  templates: [
    {
      id: "825514a0-24d5-11eb-b79e-9fcc0de52fce",
      sid: "j9o2NLiD",
      name: "Arena",
      description: null,
      version: 4,
      metadata: "{\"name\":\"Crater\"}",
      isPublic: 1,
      createdAt: "2020-11-12 10:54:59",
      updatedAt: "2020-11-12 10:54:59",
      type: "project",
      thumbnailOwnedFileId: "80a038b0-24d5-11eb-83cc-f5ed32cf09b2",
    }
  ]
};

export default seed;
