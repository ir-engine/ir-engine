import assert from 'assert'
import React from 'react'
import ReactDOM from 'react-dom'
import { act } from 'react-dom/test-utils'

import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { createEngine } from '@xrengine/engine/src/initializeEngine'

import InstanceChat from '.'
import { createDOM } from '../../../tests/createDOM'
import { createMockAPI } from '../../../tests/createMockAPI'
import { API } from '../../API'
import { accessChatState } from '../../social/services/ChatService'

describe('Instance Chat Component', () => {
  let rootContainer: HTMLDivElement

  beforeEach(() => {
    createDOM()
    rootContainer = document.createElement('div')
    document.body.appendChild(rootContainer)
    API.instance = createMockAPI()
    createEngine()
  })

  afterEach(() => {
    document.body.removeChild(rootContainer)
    rootContainer = null!
  })

  it('displays chat message', () => {
    accessChatState().channels.channels.set([
      {
        id: 'id',
        channelType: 'instance',
        messages: [
          {
            id: 'message id',
            senderId: 'senderId' as UserId,
            channelId: 'channelId',
            text: 'message text'
          }
        ]
      } as any
    ])
    act(() => {
      ReactDOM.render(<InstanceChat />, rootContainer)
    })
    const message = rootContainer.querySelector('p')!
    // const message = document.getElementById('message-message id')!
    assert.equal(message.textContent, 'message text')
  })
})
