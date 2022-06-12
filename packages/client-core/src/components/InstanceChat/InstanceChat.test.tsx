import assert from 'assert'
import React from 'react'
import ReactDOM from 'react-dom'
import { act } from 'react-dom/test-utils'

import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { createEngine } from '@xrengine/engine/src/initializeEngine'

import InstanceChat from '.'
import { createDOM } from '../../../tests/createDOM'
import { accessChatState } from '../../social/services/ChatService'

describe('Instance Chat Component', () => {
  let rootContainer: HTMLDivElement

  beforeEach(() => {
    createDOM()
    rootContainer = document.createElement('div')
    document.body.appendChild(rootContainer)
    createEngine()
  })

  afterEach(() => {
    document.body.removeChild(rootContainer)
    rootContainer = null!
  })

  it('Renders Hello World Title', () => {
    accessChatState().channels.channels.set([
      {
        id: 'id',
        channelType: 'instance',
        messages: [
          {
            id: 'message id',
            senderId: 'senderId' as UserId,
            channelId: 'channelId',
            text: 'message text',
            createdAt: null!,
            updatedAt: null!,
            sender: null!,
            messageStatus: null!
          }
        ]
        // userId1: string | null,
        // userId2: string | null,
        // groupId: string | null,
        // partyId: string | null,
        // instanceId: string | null,
        // user1: User,
        // user2: User,
        // group: Group,
        // party: Party,
        // instance: Instance,
        // updatedAt: string,
        // updateNeeded: boolean,
      } as any
    ])
    act(() => {
      ReactDOM.render(<InstanceChat />, rootContainer)
    })

    const message = rootContainer.querySelector('message-message id')!
    assert(message.textContent, 'message text')
  })
})
