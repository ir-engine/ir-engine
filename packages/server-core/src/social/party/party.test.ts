import appRootPath from 'app-root-path'
import assert from 'assert'
import path from 'path'

import { Party } from '@xrengine/common/src/interfaces/Party'
import { UserInterface } from '@xrengine/common/src/interfaces/User'

import { Application } from '../../../declarations'
import { createFeathersExpressApp } from '../../createApp'
import { deleteFolderRecursive } from '../../util/fsHelperFunctions'

const newProjectName1 = 'ProjectTest_test_project_name_1'

const cleanup = async (app: Application) => {
  const project1Dir = path.resolve(appRootPath.path, `packages/projects/projects/${newProjectName1}/`)
  deleteFolderRecursive(project1Dir)
  try {
    await app.service('project').Model.destroy({ where: { name: newProjectName1 } })
  } catch (e) {}
}

/**
 * @todo
 * - refactor storage provider to be create as part of createFeathersExpressApp() to eliminate global scope
 * - use this to force a local storage provider and test specific files in the upload folder
 * - add tests for all combinations of state for projects
 *
 * - figure out how to mock git clone functionality (maybe override the function?)
 */

describe('party.test', () => {
  let app: Application
  let user1: UserInterface
  let user2: UserInterface
  let user3: UserInterface
  let user4: UserInterface
  let party1, party2, partyUser1, partyUser2, partyUser3
  before(async () => {
    app = createFeathersExpressApp()
    await app.setup()
    const avatarName = 'CyberbotGreen'

    const avatar = await app.service('avatar').create({
      name: avatarName
    })

    user1 = (await app.service('user').create({
      name: `Test #${Math.random()}`,
      avatarId: avatar.id,
      isGuest: false
    })) as UserInterface
    user2 = (await app.service('user').create({
      name: `Test #${Math.random()}`,
      avatarId: avatar.id,
      isGuest: false
    })) as UserInterface
    user3 = (await app.service('user').create({
      name: `Test #${Math.random()}`,
      avatarId: avatar.id,
      isGuest: false
    })) as UserInterface
    user4 = (await app.service('user').create({
      name: `Test #${Math.random()}`,
      avatarId: avatar.id,
      isGuest: false
    })) as UserInterface
    user1.apiKey = await app.service('user-api-key').Model.findOne({
      where: {
        userId: user1.id
      }
    })
    user2.apiKey = await app.service('user-api-key').Model.findOne({
      where: {
        userId: user2.id
      }
    })
    user3.apiKey = await app.service('user-api-key').Model.findOne({
      where: {
        userId: user3.id
      }
    })
    user4.apiKey = await app.service('user-api-key').Model.findOne({
      where: {
        userId: user4.id
      }
    })
    await app.service('scope').create({
      type: 'admin:admin',
      userId: user4.id
    })
  })

  describe('party', () => {
    describe('create', () => {
      it('should create a party owned by creating user, and set their partyId to the party ID', async function () {
        const params = {
          headers: {
            authorization: `Bearer ${user1.apiKey.token}`
          },
          provider: 'rest'
        }
        party2 = await app.service('party').create({}, params)

        const party2Users = await app.service('party-user').find({
          query: {
            partyId: party2.id
          }
        })

        const user = await app.service('user').get(user1.id)

        assert.strictEqual(party2Users.total, 1)
        partyUser1 = party2Users.data[0]
        assert.strictEqual(partyUser1.partyId, party2.id)
        assert.strictEqual(partyUser1.userId, user1.id)
        assert.strictEqual(partyUser1.isOwner, true)
        assert.strictEqual(user.partyId, party2.id)
      })

      it("should delete the user's old party-user if they create a new party, and make a new party", async function () {
        const params = {
          headers: {
            authorization: `Bearer ${user1.apiKey.token}`
          },
          provider: 'rest'
        }
        party1 = await app.service('party').create({}, params)

        const user = await app.service('user').get(user1.id)

        const oldPartyUserResult = await app.service('party-user').find({
          query: {
            partyId: party2.id,
            userId: user1.id
          }
        })

        const party1Users = await app.service('party-user').find({
          query: {
            partyId: party1.id
          }
        })

        assert.strictEqual(oldPartyUserResult.total, 0)
        assert.strictEqual(party1Users.total, 1)
        partyUser1 = party1Users.data[0]
        assert.strictEqual(partyUser1.partyId, party1.id)
        assert.strictEqual(partyUser1.userId, user1.id)
        assert.strictEqual(partyUser1.isOwner, true)
        assert.strictEqual(user.partyId, party1.id)
      })
    })

    describe('get', () => {
      it('should get the party for a requesting user in a party', async function () {
        const params = {
          headers: {
            authorization: `Bearer ${user1.apiKey.token}`
          },
          provider: 'rest'
        }
        const returnedParty = await app.service('party').get('', params)

        assert.strictEqual(returnedParty.id, party1.id)
        assert.strictEqual(returnedParty.party_users?.length, 1)
        const returnedPartyUser1 = returnedParty.party_users
          ? returnedParty.party_users[0]
          : {
              partyId: '',
              userId: '',
              isOwner: false
            }
        assert.strictEqual(returnedPartyUser1.partyId, party1.id)
        assert.strictEqual(returnedPartyUser1.userId, user1.id)
        assert.strictEqual(returnedPartyUser1.isOwner, true)
      })

      it('should return null if the requesting user is not in a party', async function () {
        const params = {
          headers: {
            authorization: `Bearer ${user4.apiKey.token}`
          },
          provider: 'rest'
        }
        const returnedParty = await app.service('party').get('', params)

        assert.strictEqual(returnedParty, null)
      })
    })

    describe('patch', () => {
      it('should not let a non-member patch the party', async function () {
        const params = {
          headers: {
            authorization: `Bearer ${user2.apiKey.token}`
          },
          provider: 'rest'
        }
        assert.rejects(
          async () => {
            await app.service('party').patch(
              party1.id,
              {
                name: 'foobar'
              },
              params
            )
          },
          { message: 'You are not the owner of this party' }
        )
      })

      it('should not let a non-owner member patch the party', async function () {
        partyUser2 = await app.service('party-user').create({
          partyId: party1.id,
          userId: user2.id,
          isOwner: false
        })
        const params = {
          headers: {
            authorization: `Bearer ${user2.apiKey.token}`
          },
          provider: 'rest'
        }
        assert.rejects(
          async () => {
            await app.service('party').patch(
              party1.id,
              {
                name: 'foobar'
              },
              params
            )
          },
          { message: 'You are not the owner of this party' }
        )
      })

      it('should let the owner patch the party', async function () {
        const params = {
          headers: {
            authorization: `Bearer ${user1.apiKey.token}`
          },
          provider: 'rest'
        }
        const patchedParty = (await app.service('party').patch(
          party1.id,
          {
            name: 'foobar'
          },
          params
        )) as Party

        assert.strictEqual(patchedParty.name, 'foobar')
      })
    })

    describe('remove', () => {
      it('should not allow a non-member to remove the party', async function () {
        const params = {
          headers: {
            authorization: `Bearer ${user3.apiKey.token}`
          },
          provider: 'rest'
        }
        assert.rejects(
          async () => {
            await app.service('party').remove(party1.id, params)
          },
          { message: 'You are not the owner of this party' }
        )
      })

      it('should not allow a non-owner member to remove the party', async function () {
        const params = {
          headers: {
            authorization: `Bearer ${user2.apiKey.token}`
          },
          provider: 'rest'
        }
        assert.rejects(
          async () => {
            await app.service('party').remove(party1.id, params)
          },
          { message: 'You are not the owner of this party' }
        )
      })

      it('should not allow a non-member to remove any party user, whether owner or non-owner', async function () {
        const params = {
          headers: {
            authorization: `Bearer ${user3.apiKey.token}`
          },
          provider: 'rest'
        }
        assert.rejects(
          async () => {
            await app.service('party-user').remove(partyUser1.id, params)
          },
          { message: 'You are not the owner of this party' }
        )

        assert.rejects(
          async () => {
            await app.service('party-user').remove(partyUser2.id, params)
          },
          { message: 'You are not the owner of this party' }
        )
      })

      it('should not allow a non-owner member to remove any party user other than themself, whether owner or non-owner', async function () {
        partyUser3 = await app.service('party-user').create({
          partyId: party1.id,
          userId: user3.id,
          isOwner: false
        })
        const params = {
          headers: {
            authorization: `Bearer ${user2.apiKey.token}`
          },
          provider: 'rest'
        }
        assert.rejects(
          async () => {
            await app.service('party-user').remove(partyUser1.id, params)
          },
          { message: 'You are not the owner of this party' }
        )

        assert.rejects(
          async () => {
            await app.service('party-user').remove(partyUser3.id, params)
          },
          { message: 'You are not the owner of this party' }
        )
      })

      it('should allow a non-owner member to remove themself', async function () {
        const params = {
          headers: {
            authorization: `Bearer ${user2.apiKey.token}`
          },
          provider: 'rest'
        }
        await app.service('party-user').remove(partyUser2.id, params)

        const partyUsers = await app.service('party-user').find({
          query: {
            partyId: party1.id
          }
        })

        const user2Result = await app.service('user').get(user2.id)

        assert.strictEqual(partyUsers.total, 2)
        assert.strictEqual(user2Result.partyId, null)
      })

      it('should allow the owner to remove another member', async function () {
        const params = {
          headers: {
            authorization: `Bearer ${user1.apiKey.token}`
          },
          provider: 'rest'
        }

        await app.service('party-user').remove(partyUser3.id, params)

        const partyUsers = await app.service('party-user').find({
          query: {
            partyId: party1.id
          }
        })

        const user3Result = await app.service('user').get(user3.id)

        assert.strictEqual(partyUsers.total, 1)
        assert.strictEqual(user3Result.partyId, null)
      })

      it('should allow the owner to remove themself, and automatically pass ownership to another party member', async function () {
        partyUser2 = await app.service('party-user').create({
          partyId: party1.id,
          userId: user2.id,
          isOwner: false
        })

        const params = {
          headers: {
            authorization: `Bearer ${user1.apiKey.token}`
          },
          provider: 'rest'
        }

        await app.service('party-user').remove(partyUser1.id, params)

        const partyUsers = await app.service('party-user').find({
          query: {
            partyId: party1.id
          }
        })

        const user1Result = await app.service('user').get(user1.id)

        assert.strictEqual(partyUsers.total, 1)
        const returnedPartyUser = partyUsers.data[0]
        assert.strictEqual(returnedPartyUser.id, partyUser2.id)
        assert.strictEqual(returnedPartyUser.isOwner, true)
        assert.strictEqual(user1Result.partyId, null)
      })

      it('should automatically delete the party if the last party member leaves', async function () {
        const params = {
          headers: {
            authorization: `Bearer ${user2.apiKey.token}`
          },
          provider: 'rest'
        }

        await app.service('party-user').remove(partyUser2.id, params)

        const partyUsers = await app.service('party-user').find({
          query: {
            partyId: party1.id
          }
        })

        assert.strictEqual(partyUsers.total, 0)

        assert.rejects(
          async () => {
            await app.service('party').get(party1.id)
          },
          { code: 404 }
        )
      })

      it('should delete all party members when the party owner deletes the party', async function () {
        const params = {
          headers: {
            authorization: `Bearer ${user1.apiKey.token}`
          },
          provider: 'rest'
        }

        party1 = await app.service('party').create({}, params)

        partyUser2 = await app.service('party-user').create({
          partyId: party1.id,
          userId: user2.id,
          isOwner: false
        })
        const partyUsers = await app.service('party-user').find({
          query: {
            partyId: party1.id
          }
        })
        assert.strictEqual(partyUsers.total, 2)
        await app.service('party').remove(party1.id)

        assert.rejects(
          async () => {
            await app.service('party').get(party1.id)
          },
          { code: 404 }
        )
        const noPartyUsers = await app.service('party-user').find({
          query: {
            partyId: party1.id
          }
        })
        assert.strictEqual(noPartyUsers.total, 0)
      })
    })

    after(async () => {
      await cleanup(app)
    })
  })
})
