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

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { API } from '@ir-engine/common'
import {
  avatarPath,
  ChannelID,
  messagePath,
  RoomCode,
  staticResourcePath,
  userAvatarPath
} from '@ir-engine/common/src/schema.type.module'
import { createEngine, destroyEngine, Engine, EngineState, Entity } from '@ir-engine/ecs'
import { SceneState } from '@ir-engine/engine/src/gltf/GLTFState'
import {
  applyIncomingActions,
  dispatchAction,
  EventDispatcher,
  getMutableState,
  getState,
  joinNetwork,
  MediaChannelState,
  NetworkActions,
  NetworkID,
  NetworkState,
  NetworkTopics,
  screenshareAudioMediaChannelType,
  screenshareVideoMediaChannelType,
  UserID,
  webcamAudioMediaChannelType,
  webcamVideoMediaChannelType
} from '@ir-engine/hyperflux'
import { createMockNetwork } from '@ir-engine/hyperflux/tests/createMockNetwork'
import React from 'react'
import { v4 as uuidv4 } from 'uuid'
import { MediaInstanceState } from '../common/services/MediaInstanceConnectionService'
import { ChannelState } from '../social/services/ChannelService'
import { LocationState } from '../social/services/LocationService'
import InstanceChat from './InstanceChat'
import { AuthState } from './services/AuthService'
vi.mock('@ir-engine/client-core/src/hooks/useFeatureFlags', () => {
  return {
    default: () => [false, false]
  }
})
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}))

let eventDispatcher: EventDispatcher
let db: Record<string, Record<string, any>>

const hostUserID = 'host user id' as UserID
const secondUserID = 'second user id' as UserID

const channelId = uuidv4() as ChannelID
const roomCode = uuidv4() as RoomCode

const sceneID = 'scene id'
const sceneURL = '/empty.gltf'
describe('InstanceChat component', () => {
  let sceneEntity: Entity
  beforeEach(() => {
    createEngine()

    globalThis.MediaStream = class {} as any

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
      [messagePath]: [
        {
          channelId: channelId,
          id: uuidv4(),
          text: 'Hello',
          senderId: secondUserID,
          sender: {
            id: secondUserID,
            name: 'Test User',
            isGuest: false,
            ageVerified: true
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isNotification: 0
        },
        {
          channelId: channelId,
          id: uuidv4(),
          text: 'This is a notification',
          senderId: secondUserID,
          sender: {
            id: secondUserID,
            name: 'Test User',
            isGuest: false,
            ageVerified: true
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isNotification: 1
        }
      ]
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
      [messagePath]: createService(messagePath)
    }
    eventDispatcher = new EventDispatcher()
    ;(API.instance as any) = {
      service: (path: string) => apis[path]
    }

    getMutableState(LocationState).currentLocation.location.sceneURL.set(sceneURL)
    SceneState.loadScene(sceneURL, sceneID)

    sceneEntity = getState(SceneState)[sceneURL]

    const peerID = Engine.instance.store.peerID
    const instanceID = 'instanceID' as NetworkID
    getMutableState(EngineState).userID.set(hostUserID)

    createMockNetwork(NetworkTopics.world, peerID, hostUserID)
    const network = joinNetwork(instanceID, peerID, NetworkTopics.world)

    // Mock users "joining" the network
    dispatchAction(
      NetworkActions.peerJoined({
        $network: network.id,
        peerID: peerID,
        peerIndex: 1,
        userID: hostUserID
      })
    )
    dispatchAction(
      NetworkActions.peerJoined({
        $network: network.id,
        peerID: peerID,
        peerIndex: 1,
        userID: secondUserID
      })
    )

    const worldNetworkId = network.id
    getMutableState(NetworkState).networks[network.id].set({
      ...network,
      hostPeerID: peerID,
      ready: true
    })

    getMutableState(NetworkState).hostIds.media.set(worldNetworkId)
    getMutableState(NetworkState).networks[network.id].set({
      ...network,
      hostPeerID: peerID,
      ready: true
    })

    getMutableState(MediaInstanceState).instances[instanceID].set({
      ipAddress: '127.0.0.1',
      channelId: channelId,
      roomCode: roomCode as RoomCode
    })

    getMutableState(MediaChannelState).set({
      [peerID]: {
        [webcamVideoMediaChannelType]: {
          stream: null,
          quality: 'smallest',
          paused: false,
          element: document.createElement('video')
        },
        [webcamAudioMediaChannelType]: {
          stream: null,
          paused: false,
          quality: 'smallest',
          element: document.createElement('audio')
        },
        [screenshareVideoMediaChannelType]: {
          stream: null,
          quality: 'smallest',
          paused: false,
          element: document.createElement('video')
        },
        [screenshareAudioMediaChannelType]: {
          stream: null,
          paused: false,
          quality: 'smallest',
          element: document.createElement('audio')
        }
      }
    })

    getMutableState(ChannelState).targetChannelId.set(channelId)
    getMutableState(AuthState).user.isGuest.set(false)
    getMutableState(AuthState).user.ageVerified.set(true)
    getMutableState(AuthState).user.id.set(hostUserID)

    applyIncomingActions()

    render(<InstanceChat />)
  })

  afterEach(() => {
    destroyEngine()
    cleanup()
  })

  it('should render a button with data-testid "close-chat-button"', () => {
    const closeChatButton = screen.getByTestId('close-chat-button')
    // @ts-expect-error
    expect(closeChatButton).toBeInTheDocument()
  })

  it('should render a button with data-testid "open-chat-button" when the chat window is closed', () => {
    const closeChatButton = screen.getByTestId('close-chat-button')
    fireEvent.click(closeChatButton)

    const openChatButton = screen.getByTestId('open-chat-button')
    // @ts-expect-error
    expect(openChatButton).toBeInTheDocument()
  })

  it('should render a notificastion message container element with data-testid "notification-message"', () => {
    const closeChatButton = screen.getByTestId('close-chat-button')
    fireEvent.click(closeChatButton)

    const openChatButton = screen.getByTestId('open-chat-button')
    fireEvent.click(openChatButton)
    const notificationMessage = screen.getByTestId('notification-message')
    // @ts-expect-error
    expect(notificationMessage).toBeInTheDocument()
  })

  it('should render a user chat message container element with data-testid "chat-message"', () => {
    const closeChatButton = screen.getByTestId('close-chat-button')
    fireEvent.click(closeChatButton)

    const openChatButton = screen.getByTestId('open-chat-button')
    fireEvent.click(openChatButton)
    const chatMessageContainer = screen.getByTestId('chat-message')
    // @ts-expect-error
    expect(chatMessageContainer).toBeInTheDocument()
  })

  it('should render a message sender container element with data-testid "chat-message-sender"', () => {
    const closeChatButton = screen.getByTestId('close-chat-button')
    fireEvent.click(closeChatButton)

    const openChatButton = screen.getByTestId('open-chat-button')
    fireEvent.click(openChatButton)
    const chatMessageSenderContainer = screen.getByTestId('chat-message-sender')
    // @ts-expect-error
    expect(chatMessageSenderContainer).toBeInTheDocument()
  })

  it('should render a report user button data-testid "report-user-button"', () => {
    const closeChatButton = screen.getByTestId('close-chat-button')
    fireEvent.click(closeChatButton)

    const openChatButton = screen.getByTestId('open-chat-button')
    fireEvent.click(openChatButton)
    const reportUserButton = screen.getByTestId('report-user-button')
    // @ts-expect-error
    expect(reportUserButton).toBeInTheDocument()
  })

  it('should render an input element with the data-testid attribute "chat-message-input"', () => {
    const chatMessageInput = screen.getByTestId('chat-message-input')
    // @ts-expect-error
    expect(chatMessageInput).toBeInTheDocument()
  })

  it('should render a button with the data-testid attribute "send-message-button"', () => {
    const sendMessageButton = screen.getByTestId('send-message-button')
    // @ts-expect-error
    expect(sendMessageButton).toBeInTheDocument()
  })
})
