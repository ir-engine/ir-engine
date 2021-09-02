import { KeyInput } from 'puppeteer'

export const BotActionType = {
  None: 'none',

  // connection
  Connect: 'connect',
  Disconnect: 'disconnect',

  // room
  EnterRoom: 'enterRoom',
  LeaveRoom: 'leaveRoom',

  // key
  KeyPress: 'keyPress',

  // audio
  SendAudio: 'sendAudio',
  StopAudio: 'stopAudio',
  ReceiveAudio: 'receiveAudio',

  // video
  SendVideo: 'sendVideo',
  StopVideo: 'stopVideo',
  ReceiveVideo: 'receiveVideo',

  // interact
  InteractObject: 'interactObject',

  // send message
  SendMessage: 'sendMessage',

  // flow control
  OpIf: 'opIf',
  Delay: 'delay'
}

export class BotAction {
  /**
   *
   * @param {*} type is type of BotActionType.
   * @param {*} data is type of MessageData | KeyEventData | EnterRoomData | OperatorData | ...
   */

  type: typeof BotActionType
  data: any

  constructor(type, data = {}) {
    this.type = type
    this.data = data
  }

  static connect() {
    return new BotAction(BotActionType.Connect, {})
  }

  static sendMessage(message) {
    return new BotAction(BotActionType.SendMessage, { message })
  }

  static sendAudio(duration) {
    return new BotAction(BotActionType.SendAudio, { duration })
  }

  static stopAudio() {
    return new BotAction(BotActionType.StopAudio, {})
  }

  static receiveAudio() {
    return new BotAction(BotActionType.ReceiveAudio, {})
  }

  static sendVideo(duration) {
    return new BotAction(BotActionType.SendVideo, { duration })
  }

  static stopVideo() {
    return new BotAction(BotActionType.StopVideo, {})
  }

  static receiveVideo() {
    return new BotAction(BotActionType.ReceiveVideo, {})
  }

  static keyPress(key: KeyInput, pressedTime: number) {
    return new BotAction(BotActionType.KeyPress, { key, pressedTime })
  }

  static interactObject() {
    return new BotAction(BotActionType.InteractObject)
  }

  static enterRoom(domain, locationName) {
    return new BotAction(BotActionType.EnterRoom, { domain, locationName })
  }

  static leaveRoom(domain, locationName) {
    return new BotAction(BotActionType.LeaveRoom, { domain, locationName })
  }

  static disconnect() {
    return new BotAction(BotActionType.Disconnect)
  }

  static opIf(expression, trueCallback, falseCallback) {
    return new BotAction(BotActionType.OpIf, { expression, trueCallback, falseCallback })
  }

  static delay(timeout) {
    return new BotAction(BotActionType.Delay, { timeout })
  }
}
