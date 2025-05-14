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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { useFind } from '@ir-engine/common'
import { userLoginPath } from '@ir-engine/common/src/schema.type.module'
import { toDisplayDateTime } from '@ir-engine/common/src/utils/datetime-sql'
import { Tooltip } from '@ir-engine/ui'
import React from 'react'
import { LuInfo } from 'react-icons/lu'

export const UserLastLoginInfo = (userId) => {
  const login = useFind(userLoginPath, {
    query: {
      userId: userId,
      $sort: { createdAt: -1 },
      $limit: 1
    }
  })

  return login.data.length > 0 ? (
    <div className="flex">
      {toDisplayDateTime(login.data[0].createdAt)}
      <Tooltip
        content={
          <>
            <span>IP Address: {login.data[0].ipAddress}</span>
            <br />
            <span>User Agent: {login.data[0].userAgent}</span>
          </>
        }
      >
        <LuInfo className="ml-2 h-5 w-5 bg-transparent" />
      </Tooltip>
    </div>
  ) : (
    <></>
  )
}
