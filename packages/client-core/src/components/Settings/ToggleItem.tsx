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

import Toggle from '@ir-engine/ui/src/components/viewer/Toggle'
import React from 'react'

interface ToggleItemProps extends React.PropsWithChildren {
  label?: string
  checked?: boolean
  onClick?: () => void
}

const ToggleItem: React.FC<ToggleItemProps> = ({ label, checked = false, onClick, children }) => {
  return (
    <div className="flex items-center justify-between bg-black/10 px-4 py-3.5 text-white/90">
      {children || <span className="font-medium">{label}</span>}
      <Toggle checked={checked} onChange={onClick} />
    </div>
  )
}

export default ToggleItem
