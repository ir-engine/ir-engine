import { createState, Downgraded } from '@speigg/hookstate'
import assert from 'assert'
import { IdentityProviderSeed } from '@xrengine/common/src/interfaces/IdentityProvider'
import { AuthUserSeed } from '@xrengine/common/src/interfaces/AuthUser'
import { UserAvatar } from '@xrengine/common/src/interfaces/UserAvatar'
import { UserSeed } from '@xrengine/common/src/interfaces/User'
import { AuthAction, avatarFetchedReceptor } from './AuthService'

// make browser globals defined
;(globalThis as any).document = {}
;(globalThis as any).navigator = {}
;(globalThis as any).window = {}

const mockState = () => createState({
  isLoggedIn: false,
  isProcessing: false,
  error: '',
  authUser: AuthUserSeed,
  user: UserSeed,
  identityProvider: IdentityProviderSeed,
  avatarList: [] as Array<UserAvatar>
})

describe('Auth Service', () => {
  describe('Auth Receptors', () => {
    it('avatarFetchedReceptor', () => {

      // mock
      const mockAuthState = mockState()
      const mockData = {
        "id": "c7456310-48d5-11ec-8706-c7fb367d91f0",
        "key": "avatars/public/CyberbotGreen.glb",
        "name": "CyberbotGreen",
        "url": "https://host.name/avatars/public/CyberbotGreen.glb",
        "staticResourceType": "avatar",
        "userId": null
      } as any
      const mockAction = AuthAction.updateAvatarList([mockData])
      
      // logic
      avatarFetchedReceptor(mockAuthState, mockAction)

      const dataResult = mockAuthState.attach(Downgraded).value

      // test
      assert.equal(mockAuthState.avatarList.length, 1)
      assert.deepStrictEqual(dataResult.avatarList[0], { avatar: mockData }) // Fails...
    })
  })
})
