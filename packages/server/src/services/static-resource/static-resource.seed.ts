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
      subscriptionLevel : null,
      componentId : null,
      parentResourceId : null
    },
    {
      name: 'Allison',
      url: 'https://s3.amazonaws.com/xr3ngine-static-resources/avatars/Allison.glb',
      key: 'avatars/Allison.glb',
      staticResourceType: 'avatar',
    },
    {
      name: 'Allison',
      url: 'https://s3.amazonaws.com/xr3ngine-static-resources/avatars/Allison.png',
      key: 'avatars/Allison.png',
      staticResourceType: 'user-thumbnail',
    },
    {
      name: 'Andy',
      url: 'https://s3.amazonaws.com/xr3ngine-static-resources/avatars/Andy.glb',
      key: 'avatars/Andy.glb',
      staticResourceType: 'avatar',
    },
    {
      name: 'Andy',
      url: 'https://s3.amazonaws.com/xr3ngine-static-resources/avatars/Andy.png',
      key: 'avatars/Andy.png',
      staticResourceType: 'user-thumbnail',
    },
    {
      name: 'Erik',
      url: 'https://s3.amazonaws.com/xr3ngine-static-resources/avatars/Erik.glb',
      key: 'avatars/Erik.glb',
      staticResourceType: 'avatar',
    },
    {
      name: 'Erik',
      url: 'https://s3.amazonaws.com/xr3ngine-static-resources/avatars/Erik.png',
      key: 'avatars/Erik.png',
      staticResourceType: 'user-thumbnail',
    },
    {
      name: 'Geoff',
      url: 'https://s3.amazonaws.com/xr3ngine-static-resources/avatars/Geoff.glb',
      key: 'avatars/Geoff.glb',
      staticResourceType: 'avatar',
    },
    {
      name: 'Geoff',
      url: 'https://s3.amazonaws.com/xr3ngine-static-resources/avatars/Geoff.png',
      key: 'avatars/Geoff.png',
      staticResourceType: 'user-thumbnail',
    },
    {
      name: 'Jace',
      url: 'https://s3.amazonaws.com/xr3ngine-static-resources/avatars/Jace.glb',
      key: 'avatars/Jace.glb',
      staticResourceType: 'avatar',
    },
    {
      name: 'Jace',
      url: 'https://s3.amazonaws.com/xr3ngine-static-resources/avatars/Jace.png',
      key: 'avatars/Jace.png',
      staticResourceType: 'user-thumbnail',
    },
    {
      name: 'Rose',
      url: 'https://s3.amazonaws.com/xr3ngine-static-resources/avatars/Rose.glb',
      key: 'avatars/Rose.glb',
      staticResourceType: 'avatar',
    },
    {
      name: 'Rose',
      url: 'https://s3.amazonaws.com/xr3ngine-static-resources/avatars/Rose.png',
      key: 'avatars/Rose.png',
      staticResourceType: 'user-thumbnail',
    },
  ]
};

export default seed;
