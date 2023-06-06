import assert from 'assert'

// make browser globals defined

import { createEngine } from '@etherealengine/engine/src/initializeEngine'
// import { getMutableState } from '@etherealengine/hyperflux
import { Downgraded } from '@etherealengine/hyperflux/functions/StateFunctions'

import { AuthAction, AuthState, avatarFetchedReceptor } from '../../src/user/services/AuthService'

// ;(globalThis as any).document = {}
// ;(globalThis as any).navigator = {}
// ;(globalThis as any).window = {}

describe('Auth Service', () => {
  // beforeEach(() => {
  //   createEngine()
  // })
  // describe('Auth Receptors', () => {
  //   it('avatarFetchedReceptor', () => {
  //     // mock
  //     const mockAuthState = getMutableState(AuthState)
  //     const mockData = {
  //       id: 'c7456310-48d5-11ec-8706-c7fb367d91f0',
  //       key: 'avatars/public/CyberbotGreen.glb',
  //       name: 'CyberbotGreen',
  //       url: 'https://host.name/avatars/public/CyberbotGreen.glb',
  //       staticResourceType: 'avatar',
  //       userId: null
  //     } as any
  //     const mockAction = AuthAction.updateAvatarListAction({ avatarList: [mockData] })
  //     // logic
  //     avatarFetchedReceptor(mockAuthState, mockAction)
  //     const dataResult = mockAuthState.attach(Downgraded).value
  //     // test
  //     assert.equal(mockAuthState.avatarList.length, 1)
  //     assert.deepStrictEqual(dataResult.avatarList[0], { avatar: mockData }) // Fails...
  //   })
  // })
})
