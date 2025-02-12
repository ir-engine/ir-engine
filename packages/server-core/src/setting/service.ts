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

import Authentication from './authentication-setting/authentication-setting'
import Aws from './aws-setting/aws-setting'
import ClientSetting from './client-setting/client-setting'
import Email from './email-setting/email-setting'
import EngineSetting from './engine-setting/engine-setting'
import FeatureFlagSetting from './feature-flag-setting/feature-flag-setting'
import HelmVersion from './helm-version/helm-version'
import InstanceServer from './instance-server-setting/instance-server-setting'
import ProjectSetting from './project-setting/project-setting'
import ServerSetting from './server-setting/server-setting'

export default [
  ProjectSetting,
  EngineSetting,
  ServerSetting,
  ClientSetting,
  InstanceServer,
  Email,
  FeatureFlagSetting,
  Authentication,
  Aws,
  HelmVersion
]
