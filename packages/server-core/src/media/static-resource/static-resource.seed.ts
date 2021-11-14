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
  randomize: false,
  path: 'static-resource',
  templates: [
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
