import Avatar, { defaultTemplateID } from './avatar/avatar'

export default class Player {
  player : HTMLElement
  avatar : Avatar

  constructor(public playerID = defaultPlayerID, public templateID = defaultTemplateID) {
    this.player = document.getElementById(this.playerID) as HTMLElement
    this.avatar = new Avatar(this.templateID)
  }

  setupAvatar() {
    this.avatar.setupTemplate()
    this.avatar.addTemplateToPlayerByID(this.playerID)
  }
}

export const defaultPlayerHeight = 1.6
export const defaultPlayerID = 'player'
