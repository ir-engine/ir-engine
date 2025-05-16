/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { API } from '@ir-engine/common'
import {
  avatarPath,
  messagePath,
  staticResourcePath,
  userAvatarPath,
  userPath
} from '@ir-engine/common/src/schema.type.module'
import { createEngine, destroyEngine, Engine, EngineState, Entity } from '@ir-engine/ecs'
import { SceneState } from '@ir-engine/engine/src/gltf/GLTFState'
import {
  applyIncomingActions,
  EventDispatcher,
  getMutableState,
  getState,
  NetworkID,
  UserID
} from '@ir-engine/hyperflux'
import { addNetwork, createNetwork, NetworkState, NetworkTopics } from '@ir-engine/network'
import { PeerMediaChannelState } from '@ir-engine/network/src/media/PeerMediaChannelState'
import { createMockNetwork } from '@ir-engine/network/tests/createMockNetwork'
import React from 'react'
import { v4 as uuidv4 } from 'uuid'
import { LocationState } from '../../social/services/LocationService'
import { SingleVideoWindow } from './window'
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}))

vi.mock('hark', () => {
  return {
    default: vi.fn(() => ({
      on: vi.fn(),
      stop: vi.fn()
    }))
  }
})

Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: vi.fn(() => ({
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn(() => ({ data: [] })),
    putImageData: vi.fn(),
    createImageData: vi.fn(),
    setTransform: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    fillText: vi.fn(),
    restore: vi.fn()
  }))
})

globalThis.MediaStream = class {
  getAudioTracks() {
    return [{ kind: 'audio', enabled: true }]
  }
  getVideoTracks() {
    return [{ kind: 'video', enabled: true }]
  }
} as any

Object.defineProperty(global.navigator, 'mediaDevices', {
  writable: true,
  value: {
    enumerateDevices: vi.fn().mockResolvedValue([]),
    getUserMedia: vi.fn().mockResolvedValue(new MediaStream())
  }
})

let eventDispatcher: EventDispatcher
let db: Record<string, Record<string, any>>

const hostUserID = 'host user id' as UserID

const sceneID = 'scene id'
const sceneURL = '/empty.gltf'

describe('SingleVideoWindow component', () => {
  let sceneEntity: Entity
  beforeEach(() => {
    createEngine()

    db = {
      [staticResourcePath]: [
        {
          id: sceneID,
          url: sceneURL
        }
      ],
      [userAvatarPath]: [
        {
          id: uuidv4(),
          userId: hostUserID,
          avatarId: uuidv4(),
          avatar: {
            modelResource: {
              url: '/avatar.gltf'
            }
          }
        }
      ],
      [avatarPath]: [],
      [messagePath]: []
    }

    const createService = (path: string) => {
      return {
        find: () => {
          return new Promise((resolve) => {
            resolve(
              JSON.parse(
                JSON.stringify({
                  data: db[path],
                  limit: 10,
                  skip: 0,
                  total: db[path].length
                })
              )
            )
          })
        },
        get: (id) => {
          return new Promise((resolve) => {
            const data = db[path].find((entry) => entry.id === id)
            resolve(data ? JSON.parse(JSON.stringify(data)) : null)
          })
        },
        on: (serviceName, cb) => {
          eventDispatcher.addEventListener(serviceName, cb)
        },
        off: (serviceName, cb) => {
          eventDispatcher.removeEventListener(serviceName, cb)
        }
      }
    }

    const apis = {
      [staticResourcePath]: createService(staticResourcePath),
      [userAvatarPath]: createService(userAvatarPath),
      [avatarPath]: createService(avatarPath),
      [messagePath]: createService(messagePath),
      [userPath]: createService(userPath)
    }
    eventDispatcher = new EventDispatcher()
    ;(API.instance as any) = {
      service: (path: string) => {
        const existing = apis[path]
        if (!existing) throw new Error(`Missing mock service for path: ${path}`)
        return existing
      }
    }

    getMutableState(LocationState).currentLocation.location.sceneURL.set(sceneURL)
    SceneState.loadScene(sceneURL, sceneID)

    sceneEntity = getState(SceneState)[sceneURL]

    const peerID = Engine.instance.store.peerID
    const instanceID = 'instanceID' as NetworkID
    getMutableState(EngineState).userID.set(hostUserID)

    createMockNetwork(NetworkTopics.world, peerID, hostUserID)
    const network = createNetwork(instanceID, peerID, NetworkTopics.world)
    addNetwork(network)

    const worldNetworkId = network.id
    getMutableState(NetworkState).networks[network.id].set({
      ...network,
      hostPeerID: peerID,
      ready: true
    })
    getMutableState(NetworkState).hostIds.media.set(worldNetworkId)

    getMutableState(PeerMediaChannelState).set({
      [peerID]: {
        cam: {
          videoMediaStream: new MediaStream(),
          audioMediaStream: new MediaStream(),
          videoQuality: 'smallest',
          videoStreamPaused: false,
          audioStreamPaused: false,
          videoElement: document.createElement('video'),
          audioElement: document.createElement('audio')
        },
        screen: {
          videoMediaStream: new MediaStream(),
          audioMediaStream: new MediaStream(),
          videoQuality: 'auto',
          videoStreamPaused: false,
          audioStreamPaused: false,
          videoElement: document.createElement('video'),
          audioElement: document.createElement('audio')
        }
      }
    })

    applyIncomingActions()

    render(<SingleVideoWindow peerID={peerID} type="cam" />)
  })

  afterEach(() => {
    destroyEngine()
    cleanup()
  })

  it('should render a container element with the data-testid attribute "video-window"', () => {
    const videoWindow = screen.getByTestId('video-window')
    // @ts-expect-error
    expect(videoWindow).toBeInTheDocument()
  })

  it('should render a container element with the data-testid attribute "avatar-thumbnail"', () => {
    const avatarThumbnail = screen.getByTestId('avatar-thumbnail')
    // @ts-expect-error
    expect(avatarThumbnail).toBeInTheDocument()
  })
})
