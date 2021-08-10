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
      url: 'https://resources.theoverlay.io/c4efdc80-c9f0-11eb-b166-5b4d0f7861e6.jpeg',
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
      name: 'Allison',
      url: getAvatarURL('Allison.glb'),
      key: 'avatars/Allison.glb',
      staticResourceType: 'avatar'
    },
    {
      name: 'Allison',
      url: getAvatarURL('Allison.png'),
      key: 'avatars/Allison.png',
      staticResourceType: 'user-thumbnail'
    },
    {
      name: 'Cornelius',
      url: getAvatarURL('Cornelius.glb'),
      key: 'avatars/Cornelius.glb',
      staticResourceType: 'avatar'
    },
    {
      name: 'Cornelius',
      url: getAvatarURL('Cornelius.png'),
      key: 'avatars/Cornelius.png',
      staticResourceType: 'user-thumbnail'
    },
    {
      name: 'James_ReadyPlayerMe',
      url: getAvatarURL('James_ReadyPlayerMe.glb'),
      key: 'avatars/James_ReadyPlayerMe.glb',
      staticResourceType: 'avatar'
    },
    {
      name: 'James_ReadyPlayerMe',
      url: getAvatarURL('James_ReadyPlayerMe.png'),
      key: 'avatars/James_ReadyPlayerMe.png',
      staticResourceType: 'user-thumbnail'
    },
    {
      name: 'Jamie',
      url: getAvatarURL('Jamie.glb'),
      key: 'avatars/Jamie.glb',
      staticResourceType: 'avatar'
    },
    {
      name: 'Jamie',
      url: getAvatarURL('Jamie.png'),
      key: 'avatars/Jamie.png',
      staticResourceType: 'user-thumbnail'
    },
    {
      name: 'Mogrid',
      url: getAvatarURL('Mogrid.glb'),
      key: 'avatars/Mogrid.glb',
      staticResourceType: 'avatar'
    },
    {
      name: 'Mogrid',
      url: getAvatarURL('Mogrid.png'),
      key: 'avatars/Mogrid.png',
      staticResourceType: 'user-thumbnail'
    },
    {
      name: 'Warrior',
      url: getAvatarURL('Warrior.glb'),
      key: 'avatars/Warrior.glb',
      staticResourceType: 'avatar'
    },
    {
      name: 'Warrior',
      url: getAvatarURL('Warrior.png'),
      key: 'avatars/Warrior.png',
      staticResourceType: 'user-thumbnail'
    },
    {
      name: 'Zaris',
      url: getAvatarURL('Zaris.glb'),
      key: 'avatars/Zaris.glb',
      staticResourceType: 'avatar'
    },
    {
      name: 'Zaris',
      url: getAvatarURL('Zaris.png'),
      key: 'avatars/Zaris.png',
      staticResourceType: 'user-thumbnail'
    }
  ]
}
