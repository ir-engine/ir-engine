import { DEFAULT_AVATAR_ID } from '@standardcreative/common/src/constants/AvatarConstants'
import config from '../../appconfig'

export const userSeed = {
  count: 3,

  // randomize: false,
  path: 'user',
  templates: [
    {
      name: '{{name.firstName}} {{name.lastName}}',
      avatarId: DEFAULT_AVATAR_ID,
      // instanceId: '67890uihi0u98yuijo',
      // userRole: type === 'guest' ? 'guest' : type === 'admin' ? 'admin' : 'user',
      // partyId: '5678uhy789uijk',
      email: `kimenyikevin@gmail.com`,
      createdAt: '2021-02-26 12:00:00',
      updatedAt: '2021-02-26 12:00:00'
    }
  ]
}
