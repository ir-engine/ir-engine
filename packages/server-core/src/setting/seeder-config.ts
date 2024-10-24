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

import { KnexSeed } from '@ir-engine/common/src/interfaces/KnexSeed'

import * as authenticationSeed from './authentication-setting/authentication-setting.seed'
import * as awsSeed from './aws-setting/aws-setting.seed'
import * as clientSeed from './client-setting/client-setting.seed'
import * as emailSeed from './email-setting/email-setting.seed'
import * as engineSeed from './engine-setting/engine-setting.seed'
import * as helmSeed from './helm-setting/helm-setting.seed'
import * as instanceServerSeed from './instance-server-setting/instance-server-setting.seed'
import * as serverSeed from './server-setting/server-setting.seed'

export const settingSeeds: Array<KnexSeed> = [
  authenticationSeed,
  clientSeed,
  serverSeed,
  instanceServerSeed,
  emailSeed,
  awsSeed,
  helmSeed,
  engineSeed
]
