import config from '../../appconfig'

const getAvatarURL = (avatarName) => {
  if (config.aws.s3.s3DevMode === 'local' || !config) {
    if (avatarName.includes('.glb') || avatarName.includes('.glb')) return '/models/avatars/' + avatarName
    else return '/static/' + avatarName
  } else {
    return (
      'https://s3.amazonaws.com/' +
      config.aws.s3.staticResourceBucket +
      '/' +
      config.aws.s3.avatarDir +
      '/' +
      avatarName
    )
  }
}

export const staticResourceSeed = {
  disabled: !config || !config.db.forceRefresh,
  delete: config && config.db.forceRefresh,
  randomize: false,
  path: 'static-resource',
  templates: [
    {
      id: 'd0828450-24e4-11eb-8630-81b209daf73a',
      sid: 'j9o2NLiD',
      name: null,
      description: null,
      url: 'https://resources.theoverlay.io/19176bb0-24e8-11eb-8630-81b209daf73a.jpeg',
      key: 'd0828450-24e4-11eb-8630-81b209daf73a.jpeg',
      mimeType: 'image/jpeg',
      metadata: null,
      createdAt: '2020-11-12 12:44:37',
      updatedAt: '2020-11-12 13:08:04',
      staticResourceType: null,
      subscriptionLevel: null,
      componentId: null,
      parentResourceId: null
    },
    {
      name: 'Sonny',
      url: getAvatarURL('Sonny.glb'),
      key: 'avatars/Sonny.glb',
      staticResourceType: 'avatar'
    },
    {
      name: 'Sonny',
      url: getAvatarURL('Sonny.jpg'),
      key: 'avatars/Sonny.jpg',
      staticResourceType: 'user-thumbnail'
    },

    {
      name: 'Razer1',
      url: getAvatarURL('Razer1.glb'),
      key: 'avatars/Razer1.glb',
      staticResourceType: 'avatar'
    },
    {
      name: 'Razer1',
      url: getAvatarURL('Razer1.jpg'),
      key: 'avatars/Razer1.jpg',
      staticResourceType: 'user-thumbnail'
    },
    {
      name: 'Razer2',
      url: getAvatarURL('Razer2.glb'),
      key: 'avatars/Razer2.glb',
      staticResourceType: 'avatar'
    },
    {
      name: 'Razer2',
      url: getAvatarURL('Razer2.jpg'),
      key: 'avatars/Razer2.jpg',
      staticResourceType: 'user-thumbnail'
    },
    {
      name: 'Razer3',
      url: getAvatarURL('Razer3.glb'),
      key: 'avatars/Razer3.glb',
      staticResourceType: 'avatar'
    },
    {
      name: 'Razer3',
      url: getAvatarURL('Razer3.jpg'),
      key: 'avatars/Razer3.jpg',
      staticResourceType: 'user-thumbnail'
    },
    {
      name: 'Razer4',
      url: getAvatarURL('Razer4.glb'),
      key: 'avatars/Razer4.glb',
      staticResourceType: 'avatar'
    },
    {
      name: 'Razer4',
      url: getAvatarURL('Razer4.jpg'),
      key: 'avatars/Razer4.jpg',
      staticResourceType: 'user-thumbnail'
    },
    {
      name: 'Razer5',
      url: getAvatarURL('Razer5.glb'),
      key: 'avatars/Razer5.glb',
      staticResourceType: 'avatar'
    },
    {
      name: 'Razer5',
      url: getAvatarURL('Razer5.jpg'),
      key: 'avatars/Razer5.jpg',
      staticResourceType: 'user-thumbnail'
    },
    {
      name: 'Razer6',
      url: getAvatarURL('Razer6.glb'),
      key: 'avatars/Razer6.glb',
      staticResourceType: 'avatar'
    },
    {
      name: 'Razer6',
      url: getAvatarURL('Razer6.jpg'),
      key: 'avatars/Razer6.jpg',
      staticResourceType: 'user-thumbnail'
    }
    // {
    //   name: 'Allison',
    //   url: getAvatarURL('Allison.glb'),
    //   key: 'avatars/Allison.glb',
    //   staticResourceType: 'avatar',
    // },
    // {
    //   name: 'Allison',
    //   url: getAvatarURL('Allison.png'),
    //   key: 'avatars/Allison.png',
    //   staticResourceType: 'user-thumbnail',
    // },
    // {
    //   name: 'Andy',
    //   url: getAvatarURL('Andy.glb'),
    //   key: 'avatars/Andy.glb',
    //   staticResourceType: 'avatar',
    // },
    // {
    //   name: 'Andy',
    //   url: getAvatarURL('Andy.png'),
    //   key: 'avatars/Andy.png',
    //   staticResourceType: 'user-thumbnail',
    // },
    // {
    //   name: 'Erik',
    //   url: getAvatarURL('Erik.glb'),
    //   key: 'avatars/Erik.glb',
    //   staticResourceType: 'avatar',
    // },
    // {
    //   name: 'Erik',
    //   url: getAvatarURL('Erik.png'),
    //   key: 'avatars/Erik.png',
    //   staticResourceType: 'user-thumbnail',
    // },
    // {
    //   name: 'Geoff',
    //   url: getAvatarURL('Geoff.glb'),
    //   key: 'avatars/Geoff.glb',
    //   staticResourceType: 'avatar',
    // },
    // {
    //   name: 'Geoff',
    //   url: getAvatarURL('Geoff.png'),
    //   key: 'avatars/Geoff.png',
    //   staticResourceType: 'user-thumbnail',
    // },
    // {
    //   name: 'Jace',
    //   url: getAvatarURL('Jace.glb'),
    //   key: 'avatars/Jace.glb',
    //   staticResourceType: 'avatar',
    // },
    // {
    //   name: 'Jace',
    //   url: getAvatarURL('Jace.png'),
    //   key: 'avatars/Jace.png',
    //   staticResourceType: 'user-thumbnail',
    // },
    // {
    //   name: 'Karthik',
    //   url: getAvatarURL('Karthik.glb'),
    //   key: 'avatars/Karthik.glb',
    //   staticResourceType: 'avatar',
    // },
    // {
    //   name: 'Karthik',
    //   url: getAvatarURL('Karthik.png'),
    //   key: 'avatars/Karthik.png',
    //   staticResourceType: 'user-thumbnail',
    // },
    // {
    //   name: 'Rose',
    //   url: getAvatarURL('Rose.glb'),
    //   key: 'avatars/Rose.glb',
    //   staticResourceType: 'avatar',
    // },
    // {
    //   name: 'Rose',
    //   url: getAvatarURL('Rose.png'),
    //   key: 'avatars/Rose.png',
    //   staticResourceType: 'user-thumbnail',
    // },
  ]
}
