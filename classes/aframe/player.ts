// eslint-disable-next-line no-unused-vars
import AFRAME from 'aframe'
import Avatar from './avatar'

export default class Player {
  player : AFRAME.Entity
  avatar : Avatar

  constructor(public playerID = 'player', public templateID = 'avatar-template') {
    this.player = document.getElementById(this.playerID) as AFRAME.Entity
    this.avatar = new Avatar(this.templateID)
  }

  setupAvatar() {
    this.avatar.setupTemplate()
    this.avatar.addTemplateToPlayerByID(this.playerID)
  }
}
