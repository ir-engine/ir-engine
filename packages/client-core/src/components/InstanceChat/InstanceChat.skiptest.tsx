import assert from 'assert'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { act } from 'react-dom/test-utils'

import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import { createEngine } from '@etherealengine/engine/src/initializeEngine'
import { getMutableState } from '@etherealengine/hyperflux'

import { InstanceChat } from '.'
import { createDOM } from '../../../tests/createDOM'
import { createMockAPI } from '../../../tests/createMockAPI'
import { API } from '../../API'
import { ChatState } from '../../social/services/ChatService'

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

  it('displays chat message', async () => {
    getMutableState(ChatState).channels.channels.set([
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
      const root = createRoot(rootContainer!)
      root.render(<InstanceChat />)
    })
    const openButton = document.getElementById('openMessagesButton')!
    openButton.addEventListener('click', (e) => console.log(e))
    act(() => {
      openButton.dispatchEvent(new window.CustomEvent('click', { bubbles: true, cancelable: false }))
    })
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const message = rootContainer.querySelector('p')!
    // const message = document.getElementById('message-message id')!
    assert.equal(message.textContent, 'message text')
  })
})
