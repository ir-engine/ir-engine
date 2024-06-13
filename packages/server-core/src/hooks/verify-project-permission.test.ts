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

import { BadRequest, Forbidden, NotAuthenticated, NotFound } from '@feathersjs/errors'
import { HookContext } from '@feathersjs/feathers/lib'
import assert from 'assert'

import { AvatarID } from '@etherealengine/common/src/schemas/user/avatar.schema'
import { InviteCode, UserName, userPath, UserType } from '@etherealengine/common/src/schemas/user/user.schema'
import { destroyEngine } from '@etherealengine/ecs/src/Engine'

import { projectPath, projectPermissionPath } from '@etherealengine/common/src/schema.type.module'
import { deleteFolderRecursive } from '@etherealengine/common/src/utils/fsHelperFunctions'
import appRootPath from 'app-root-path'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { Application } from '../../declarations'
import { createFeathersKoaApp } from '../createApp'
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
  before(async () => {
    app = createFeathersKoaApp()
    await app.setup()
  })

  after(async () => {
    return await destroyEngine()
  })

  it('should fail if user is not authenticated', async () => {
    const verifyPermission = verifyProjectPermission(['owner'])
    const hookContext = mockHookContext(app)
    assert.rejects(() => verifyPermission(hookContext), NotAuthenticated)
  })

  it('should fail if project id is missing', async () => {
    const user = await app.service(userPath).create({
      name: `Test #${Math.random()}` as UserName,
      isGuest: true,
      avatarId: '' as AvatarID,
      inviteCode: '' as InviteCode,
      scopes: []
    })
    const verifyPermission = verifyProjectPermission(['owner'])
    const hookContext = mockHookContext(app, { user })
    assert.rejects(async () => await verifyPermission(hookContext), BadRequest)
    // cleanup
    await app.service(userPath).remove(user.id)
  })

  it('should fail if project is not found', async () => {
    const user = await app.service(userPath).create({
      name: `Test #${Math.random()}` as UserName,
      isGuest: true,
      avatarId: '' as AvatarID,
      inviteCode: '' as InviteCode,
      scopes: []
    })

    const verifyPermission = verifyProjectPermission(['owner'])
    const hookContext = mockHookContext(app, {
      user,
      query: {
        projectId: uuidv4()
      }
    })
    assert.rejects(async () => await verifyPermission(hookContext), NotFound)

    // cleanup
    await app.service(userPath).remove(user.id)
  })

  it('should fail if user does not have required permission', async () => {
    const user = await app.service(userPath).create({
      name: `Test #${Math.random()}` as UserName,
      isGuest: true,
      avatarId: '' as AvatarID,
      inviteCode: '' as InviteCode,
      scopes: []
    })
    const project = await app.service(projectPath).create({
      name: `Project #${Math.random()}`
    })

    await app.service(projectPermissionPath).create({
      type: 'reviewer',
      userId: user.id,
      projectId: project.id
    })

    const verifyPermission = verifyProjectPermission(['owner'])
    const hookContext = mockHookContext(app, { user, query: { projectId: project.id } })
    assert.rejects(async () => await verifyPermission(hookContext), Forbidden)

    // cleanup
    await app.service(userPath).remove(user.id)
    await app.service(projectPath).remove(project.id)
    const projectDir = path.resolve(appRootPath.path, `packages/projects/projects/${project.name}/`)
    deleteFolderRecursive(projectDir)
  })

  it('should verify if user has required permission', async () => {
    const user = await app.service(userPath).create({
      name: `Test #${Math.random()}` as UserName,
      isGuest: true,
      avatarId: '' as AvatarID,
      inviteCode: '' as InviteCode,
      scopes: []
    })
    const project = await app.service(projectPath).create({
      name: `Project #${Math.random()}`
    })

    await app.service(projectPermissionPath).create({
      type: 'owner',
      userId: user.id,
      projectId: project.id
    })

    const verifyPermission = verifyProjectPermission(['owner'])
    const hookContext = mockHookContext(app, { user, query: { projectId: project.id } })
    assert.doesNotThrow(async () => await verifyPermission(hookContext))

    // cleanup
    await app.service(userPath).remove(user.id)
    await app.service(projectPath).remove(project.id)
    const projectDir = path.resolve(appRootPath.path, `packages/projects/projects/${project.name}/`)
    deleteFolderRecursive(projectDir)
  })

  it('should verify if isInternal', () => {
    const verifyPermission = verifyProjectPermission(['owner'])
    const hookContext = mockHookContext(app, { isInternal: true })
    assert.doesNotThrow(() => verifyPermission(hookContext))
  })
})
