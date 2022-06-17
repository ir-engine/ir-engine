import assert from 'assert'

// TODO: move all top level state calls into some API

// import { accessAuthState, AuthAction, avatarFetchedReceptor } from '../../src/user/services/AuthService' // make browser globals defined

// import { createEngine, setupEngineActionSystems } from '@xrengine/engine/src/initializeEngine'
// import { Downgraded } from '@xrengine/hyperflux/functions/StateFunctions'

// ;(globalThis as any).document = {}
// ;(globalThis as any).navigator = {}
// ;(globalThis as any).window = {}

describe('Auth Service', () => {
  // beforeEach(() => {
  //   createEngine()
  //   setupEngineActionSystems()
  // })
  // describe('Auth Receptors', () => {
  //   it('avatarFetchedReceptor', () => {
  //     // mock
  //     const mockAuthState = accessAuthState()
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
