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

import '../patchEngineNode'

import { BadRequest, Forbidden, NotAuthenticated, NotFound } from '@feathersjs/errors'
import { HookContext } from '@feathersjs/feathers/lib'
import assert from 'assert'
import { afterEach, beforeEach, describe, it } from 'vitest'

import { InviteCode, UserName, userPath, UserType } from '@ir-engine/common/src/schemas/user/user.schema'
import { destroyEngine } from '@ir-engine/ecs/src/Engine'

import { projectPath, projectPermissionPath } from '@ir-engine/common/src/schema.type.module'
import { deleteFolderRecursive } from '@ir-engine/common/src/utils/fsHelperFunctions'
import appRootPath from 'app-root-path'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { Application } from '../../declarations'
import { createFeathersKoaApp, tearDownAPI } from '../createApp'
import verifyProjectPermission from './verify-project-permission'

const mockHookContext = (
  app: Application,
  params?: Partial<{ isInternal: boolean; query: unknown; user: UserType }>
) => {
  return {
    app,
    params
  } as unknown as HookContext<Application>
}

describe('verify-project-permission', () => {
  let app: Application
  beforeEach(async () => {
    app = await createFeathersKoaApp()
    await app.setup()
  })

  afterEach(async () => {
    await tearDownAPI()
    const projectDir = path.resolve(appRootPath.path, `packages/projects/projects/testorg`)
    deleteFolderRecursive(projectDir)
    destroyEngine()
  })

  it('should fail if user is not authenticated', async () => {
    const verifyPermission = verifyProjectPermission(['owner'])
    const hookContext = mockHookContext(app, {})
    await assert.rejects(async () => await verifyPermission(hookContext), NotAuthenticated)
  })

  it('should fail if project id is missing', async () => {
    const user = await app.service(userPath).create({
      name: `Test #${Math.random()}` as UserName,
      isGuest: true,
      inviteCode: '' as InviteCode
    })
    const verifyPermission = verifyProjectPermission(['owner'])
    const hookContext = mockHookContext(app, { user })
    await assert.rejects(async () => await verifyPermission(hookContext), BadRequest)
    // cleanup
    await app.service(userPath).remove(user.id)
  })

  it('should fail if project is not found', async () => {
    const user = await app.service(userPath).create({
      name: `Test #${Math.random()}` as UserName,
      isGuest: true,
      inviteCode: '' as InviteCode
    })

    const verifyPermission = verifyProjectPermission(['owner'])
    const hookContext = mockHookContext(app, {
      user,
      query: {
        projectId: uuidv4()
      }
    })
    await assert.rejects(async () => await verifyPermission(hookContext), NotFound)

    // cleanup
    await app.service(userPath).remove(user.id)
  })

  it('should fail if user does not have required permission', async () => {
    const userOwner = await app.service(userPath).create({
      name: `Test #${Math.random()}` as UserName,
      isGuest: true,
      inviteCode: '' as InviteCode
    })
    const user = await app.service(userPath).create({
      name: `Test #${Math.random()}` as UserName,
      isGuest: true,
      inviteCode: '' as InviteCode
    })
    const project = await app.service(projectPath).create({
      name: `testorg/project${Math.random()}`
    })

    // owner must exist, or next user will be made owner
    const ownerPerms = await app.service(projectPermissionPath).create({
      type: 'owner',
      userId: userOwner.id,
      projectId: project.id
    })

    const perms = await app.service(projectPermissionPath).create(
      {
        type: 'reviewer',
        userId: user.id,
        projectId: project.id
      },
      {
        user
      }
    )

    const verifyPermission = verifyProjectPermission(['owner'])
    const hookContext = mockHookContext(app, { user, query: { projectId: project.id } })
    await assert.rejects(async () => await verifyPermission(hookContext), Forbidden)

    // cleanup
    await app.service(userPath).remove(user.id)
    await app.service(projectPath).remove(project.id)
    await app.service(userPath).remove(userOwner.id)
  })

  it('should verify if user has required permission', async () => {
    const user = await app.service(userPath).create({
      name: `Test #${Math.random()}` as UserName,
      isGuest: true,
      inviteCode: '' as InviteCode
    })

    const project = await app.service(projectPath).create({
      name: `testorg/project${Math.random()}`
    })

    await app.service(projectPermissionPath).create({
      type: 'owner',
      userId: user.id,
      projectId: project.id
    })

    const verifyPermission = verifyProjectPermission(['owner'])
    const hookContext = mockHookContext(app, { user, query: { projectId: project.id } })
    await assert.doesNotReject(async () => await verifyPermission(hookContext))

    // cleanup
    await app.service(userPath).remove(user.id)
    await app.service(projectPath).remove(project.id)
  })

  it('should verify if isInternal', async () => {
    const verifyPermission = verifyProjectPermission(['owner'])
    const hookContext = mockHookContext(app, { isInternal: true })
    await assert.doesNotReject(() => verifyPermission(hookContext))
  })
})
