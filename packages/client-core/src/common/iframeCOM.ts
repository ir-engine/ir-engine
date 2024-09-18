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
