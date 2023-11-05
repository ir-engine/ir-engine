/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import assert from 'assert'
import { v1 } from 'uuid'

import { destroyEngine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { avatarPath } from '@etherealengine/engine/src/schemas/user/avatar.schema'

import { BotType, botPath } from '@etherealengine/engine/src/schemas/bot/bot.schema'
import { InstanceType, instancePath } from '@etherealengine/engine/src/schemas/networking/instance.schema'
import { SceneType, scenePath } from '@etherealengine/engine/src/schemas/projects/scene.schema'
import {
  LocationID,
  LocationType,
  RoomCode,
  locationPath
} from '@etherealengine/engine/src/schemas/social/location.schema'
import { UserType, userPath } from '@etherealengine/engine/src/schemas/user/user.schema'
import { Application } from '../../../declarations'
import { createFeathersKoaApp } from '../../createApp'

describe('bot.service', () => {
  let app: Application
  let testInstance: InstanceType
  let testLocation: LocationType
  let testUser: UserType
  let testBot: BotType
  let testScene: SceneType

  const params = { isInternal: true }

  before(async () => {
    app = createFeathersKoaApp()
    await app.setup()
  })
  after(() => {
    return destroyEngine()
  })

  before(async () => {
    testScene = await app.service(scenePath).create({
      name: 'test-bot-scene-name-',
      scenePath: '',
      thumbnailPath: '',
      envMapPath: ''
    })

    testLocation = await app.service(locationPath).create(
      {
        name: 'test-bot-location-' + v1(),
        slugifiedName: '',
        sceneId: testScene.id,
        maxUsersPerInstance: 30,
        locationSetting: {
          id: '',
          locationType: 'public',
          audioEnabled: true,
          videoEnabled: true,
          faceStreamingEnabled: false,
          screenSharingEnabled: false,
          locationId: '' as LocationID,
          createdAt: '',
          updatedAt: ''
        },
        isLobby: false,
        isFeatured: false
      },
      { ...params }
    )

    testInstance = await app
      .service(instancePath)
      .create({ locationId: testLocation.id as LocationID, roomCode: '' as RoomCode, currentUsers: 0 })
  })

  before(async () => {
    const name = 'test-bot-user-name-' + v1()
    const avatarName = 'test-bot-avatar-name-' + v1()

    const avatar = await app.service(avatarPath).create({
      name: avatarName
    })

    testUser = await app.service(userPath).create({
      name,
      avatarId: avatar.id,
      isGuest: false,
      scopes: []
    })
  })

  it('should create bot', async () => {
    const name = 'test-bot-' + v1()
    const description = v1() + '-' + v1()
    testBot = await app.service(botPath).create({
      name,
      instanceId: testInstance.id,
      userId: testUser.id,
      botCommands: [],
      description,
      locationId: testLocation.id as LocationID
    })

    assert.ok(testBot.id)
    assert.equal(testBot.name, name)
    assert.equal(testBot.description, description)
    assert.equal(testBot.instanceId, testInstance.id)
    assert.equal(testBot.userId, testUser.id)
    assert.equal(testBot.locationId, testLocation.id)
  })

  it('should create bot with botCommands', async () => {
    const name = 'test-bot-' + v1()
    const description = v1() + '-' + v1()

    const botCommands = [
      { name: 'test-bot-command-' + v1(), description: 'bot-command-description-' + v1() },
      { name: 'test-bot-command-' + v1(), description: 'bot-command-description-' + v1() }
    ]

    const createdBot = await app.service(botPath).create({
      name,
      instanceId: testInstance.id,
      userId: testUser.id,
      botCommands,
      description,
      locationId: testLocation.id as LocationID
    })

    assert.ok(createdBot.id)
    createdBot.botCommands.forEach((botCommand, idx) => {
      assert.equal(botCommand.botId, createdBot.id)
      assert.equal(botCommand.name, botCommands[idx].name)
      assert.equal(botCommand.description, botCommands[idx].description)
    })
  })

  it('should find the bot', async () => {
    const foundBots = await app.service(botPath).find({ isInternal: true })
    assert.ok(foundBots.data.find((bot) => bot.id === testBot.id))
  })

  it('should patch the bot', async () => {
    const name = 'test-bot-' + v1()
    const patchedBot = await app.service(botPath).patch(testBot.id, { name }, { isInternal: true })
    assert.equal(patchedBot.name, name)
    testBot = patchedBot
  })

  it('should remove bot', async () => {
    await app.service(botPath).remove(testBot.id, { isInternal: true })
    const foundBots = await app.service(botPath).find({ isInternal: true })
    assert.ok(!foundBots.data.find((bot) => bot.id === testBot.id))
  })
})
