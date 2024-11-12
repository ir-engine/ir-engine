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

import ProgressBar from '@ir-engine/client-core/src/systems/ui/LoadingDetailView/SimpleProgressBar'
import React from 'react'

export default function FilePropertiesSaveConfirmationModal() {
  return (
    <div className="flex items-center justify-center">
      <div className="z-10  w-[30vw] rounded-lg border border-gray-800 bg-theme-surface-main p-20 shadow-lg">
        <ProgressBar
          bgColor={'#ffffff'}
          completed={50}
          loopingBarWidth={50}
          height="4px"
          baseBgColor="#000000"
          isLabelVisible={false}
          isLooping={true}
          loopingBarSpeed={0.4}
        />
        <div className="mb-8 mt-6  flex justify-between text-sm text-white">
          <span>Saving asset changes...</span>
          <span>Please Wait</span>
        </div>
      </div>
    </div>
  )
}
