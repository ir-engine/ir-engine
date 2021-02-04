import config from '../../config';

export const seed = {
  disabled: !config.db.forceRefresh,
  delete: config.db.forceRefresh,
  randomize: false,
  path: 'static-resource',
  templates:
  [
    {
      id : "d0828450-24e4-11eb-8630-81b209daf73a",
      sid : "j9o2NLiD",
      name : null,
      description : null,
      url : "https://resources.theoverlay.io/19176bb0-24e8-11eb-8630-81b209daf73a.jpeg",
      key : "d0828450-24e4-11eb-8630-81b209daf73a.jpeg",
      mimeType : "image/jpeg",
      metadata : null,
      createdAt : "2020-11-12 12:44:37",
      updatedAt : "2020-11-12 13:08:04",
      staticResourceType : null,
      componentId : null,
      parentResourceId : null
    }
  ]
};

export default seed;
