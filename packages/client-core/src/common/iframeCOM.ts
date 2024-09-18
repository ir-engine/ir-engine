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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

export interface Message {
  id: string
  method: string
  payload?: any
}

export interface MessageResponse {
  source: string
  id: string
  success: boolean
  data?: any
}

import { v4 as uuidv4 } from 'uuid'

export class ParentCommunicator {
  private iframe: HTMLIFrameElement
  private iframeId: string
  private origin: string
  private messageQueue: Map<string, (response: MessageResponse) => void> = new Map()

  constructor(iframeId: string, origin: string) {
    this.iframeId = iframeId
    this.origin = origin
    this.iframe = document.getElementById(iframeId) as HTMLIFrameElement
    window.addEventListener('message', this.handleMessage.bind(this))
  }

  private handleMessage(event: MessageEvent) {
    if (event.source !== this.iframe.contentWindow) return
    const response = event.data as MessageResponse
    if (response && response.id && response.source === this.iframeId) {
      const resolver = this.messageQueue.get(response.id)
      if (resolver) {
        resolver(response)
        this.messageQueue.delete(response.id)
      }
    }
  }

  public sendMessage(method: string, payload?: any): Promise<MessageResponse> {
    return new Promise((resolve) => {
      const id = uuidv4()
      const message: Message = { id, method, payload }
      this.messageQueue.set(id, resolve)
      this.iframe?.contentWindow?.postMessage(message, origin)
    })
  }
}

// Usage example
//const communicator = new ParentCommunicator('childIframe')
//communicator.sendMessage('getData', { key: 'value' }).then((response) => {
//  console.log('Response received:', response)
//})
