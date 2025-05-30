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

import { cleanup, fireEvent, render, RenderResult, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, TestContext, vi } from 'vitest'

import { createEngine, destroyEngine, Engine, EngineState, Entity } from '@ir-engine/ecs'
import React from 'react'
import { MediaIconsBox } from './index'

import { ChannelID, LocationID, RoomCode } from '@ir-engine/common/src/schema.type.module'
import { SceneState } from '@ir-engine/engine/src/gltf/GLTFState'
import {
  applyIncomingActions,
  dispatchAction,
  getMutableState,
  getState,
  joinNetwork,
  MediaStreamState,
  NetworkActions,
  NetworkID,
  NetworkState,
  NetworkTopics,
  UserID
} from '@ir-engine/hyperflux'
import { createMockNetwork } from '@ir-engine/hyperflux/tests/createMockNetwork'
import { MemoryRouter } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { MediaInstanceState } from '../../common/services/MediaInstanceConnectionService'
import { LocationState } from '../../social/services/LocationService'

vi.mock('@ir-engine/client-core/src/hooks/useFeatureFlags', () => {
  return {
    default: () => [false, false]
  }
})

interface MediaIconsBoxContext extends TestContext {
  rerender: RenderResult['rerender']
}

const userID = 'user id' as UserID

const sceneID = 'scene id'
const sceneURL = '/empty.gltf'
describe('MediaIconsBox component', () => {
  let sceneEntity: Entity
  beforeEach<MediaIconsBoxContext>((context) => {
    createEngine()

    // Adds MediaSteam API to jsdom scope
    globalThis.MediaStream = class {} as any
    if (!navigator.mediaDevices) {
      Object.defineProperty(navigator, 'mediaDevices', {
        configurable: true,
        writable: true,
        value: {}
      })
    }

    // Mock getDisplayMedia
    if (!navigator.mediaDevices.getDisplayMedia) {
      navigator.mediaDevices.getDisplayMedia = vi.fn().mockResolvedValue(new MediaStream())
    }

    if (!navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices = vi.fn().mockResolvedValue([])
    }

    getMutableState(LocationState).currentLocation.location.sceneURL.set(sceneURL)
    SceneState.loadScene(sceneURL, sceneID)

    sceneEntity = getState(SceneState)[sceneURL]

    const peerID = Engine.instance.store.peerID
    const hostUserID = 'host user' as UserID
    const instanceID = 'instanceID' as NetworkID
    getMutableState(EngineState).userID.set(hostUserID)

    createMockNetwork(NetworkTopics.world, peerID, hostUserID)
    const network = joinNetwork(instanceID, peerID, NetworkTopics.world)
    dispatchAction(
      NetworkActions.peerJoined({
        $network: network.id,
        peerID: peerID,
        peerIndex: 1,
        userID: userID
      })
    )

    const worldNetworkId = network.id
    getMutableState(NetworkState).networks[network.id].set({
      ...network,
      hostPeerID: peerID,
      ready: true
    })

    getMutableState(NetworkState).hostIds.media.set(worldNetworkId)

    const locationId = uuidv4() as LocationID
    console.log('locationId', locationId)

    getMutableState(LocationState).currentLocation.location.locationSetting.set({
      id: 'mock-id',
      locationId: locationId,
      audioEnabled: true,
      locationType: 'private',
      screenSharingEnabled: true,
      faceStreamingEnabled: false,
      videoEnabled: true,
      jumpControlEnabled: true,
      vrEnabled: true,
      createdAt: '',
      updatedAt: ''
    })

    getMutableState(MediaStreamState).availableAudioDevices.set([
      {
        deviceId: 'audio-device-id',
        kind: 'audioinput',
        label: 'Audio Device',
        groupId: 'audio-group-id',
        toJSON: () => ({})
      }
    ])

    getMutableState(MediaStreamState).availableVideoDevices.set([
      {
        deviceId: 'video-device-id',
        kind: 'videoinput',
        label: 'Video Device',
        groupId: 'video-group-id',
        toJSON: () => ({})
      }
    ])

    getMutableState(MediaInstanceState).instances[instanceID].set({
      ipAddress: '127.0.0.1',
      channelId: 'mock-channel-id' as ChannelID,
      roomCode: 'mock-room-code' as RoomCode
    })

    applyIncomingActions()

    const { rerender } = render(
      <MemoryRouter>
        <MediaIconsBox />
      </MemoryRouter>
    )
    context.rerender = rerender
  })

  afterEach(() => {
    destroyEngine()
    cleanup()
  })

  it('should render a button with data-testid "toggle-mic-on-button"', () => {
    const micOnButton = screen.getByTestId('toggle-mic-on-button')
    fireEvent.click(micOnButton)
    // @ts-expect-error
    expect(micOnButton).toBeInTheDocument()
  })

  it('should render a button with data-testid "toggle-mic-off-button" after a media stream has been created', (context: MediaIconsBoxContext) => {
    getMutableState(MediaStreamState).microphoneEnabled.set(true)
    getMutableState(MediaStreamState).microphoneMediaStream.set(new MediaStream())

    context.rerender(
      <MemoryRouter>
        <MediaIconsBox />
      </MemoryRouter>
    )

    const micOffButton = screen.getByTestId('toggle-mic-off-button')
    // @ts-expect-error
    expect(micOffButton).toBeInTheDocument()
  })

  it('should render a button with data-testid "toggle-camera-on-button"', () => {
    const cameraOnButton = screen.getByTestId('toggle-camera-on-button')
    // @ts-expect-error
    expect(cameraOnButton).toBeInTheDocument()
  })

  it('should render a button with data-testid "toggle-camera-off-button" after a media stream has been created', (context: MediaIconsBoxContext) => {
    getMutableState(MediaStreamState).webcamEnabled.set(true)
    getMutableState(MediaStreamState).webcamMediaStream.set(new MediaStream())

    context.rerender(
      <MemoryRouter>
        <MediaIconsBox />
      </MemoryRouter>
    )

    const cameraOffButton = screen.getByTestId('toggle-camera-off-button')
    // @ts-expect-error
    expect(cameraOffButton).toBeInTheDocument()
  })

  it('should render a button with data-testid "toggle-screenshare-on-button"', () => {
    const screenshareOnButton = screen.getByTestId('toggle-screenshare-on-button')
    // @ts-expect-error
    expect(screenshareOnButton).toBeInTheDocument()
  })

  it('should render a button with data-testid "toggle-screenshare-off-button" after a media stream has been created', (context: MediaIconsBoxContext) => {
    getMutableState(MediaStreamState).screenshareEnabled.set(true)
    getMutableState(MediaStreamState).screenshareMediaStream.set(new MediaStream())

    context.rerender(
      <MemoryRouter>
        <MediaIconsBox />
      </MemoryRouter>
    )

    const screenshareOffButton = screen.getByTestId('toggle-screenshare-off-button')
    // @ts-expect-error
    expect(screenshareOffButton).toBeInTheDocument()
  })
})
