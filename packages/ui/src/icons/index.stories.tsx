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

import React, { useState } from 'react'
import * as Icons from '.'

export default {
  title: 'Icons/All',
  parameters: {
    componentSubtitle: 'Icons',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/ln2VDACenFEkjVeHkowxyi/iR-Engine-Design-Library-File?node-id=2283-24252&node-type=frame&t=XAGvEGVnphLHTwP3-0'
    }
  }
}

const IconRenderer = () => {
  const [searchedIconName, setSearchedIconName] = useState('')

  const iconsList = Object.entries(Icons)
    .filter(([iconName]) => {
      const searchedName = searchedIconName
        .replaceAll('-', '_')
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('')
        .toLowerCase()
      if (iconName.toLowerCase().includes(searchedName)) return true
      return false
    })
    .map(([iconName, IconComponent]) => {
      const importText = `import { ${iconName} } from '@ir-engine/ui/icons'`
      return (
        <div className="m-1 grid grid-cols-5 items-center gap-4 border p-1">
          <div className="cursor-copy" onClick={async () => await navigator.clipboard.writeText(iconName)}>
            {iconName}
          </div>
          <div>
            <IconComponent />
          </div>
          <div className="col-span-3 cursor-copy" onClick={async () => await navigator.clipboard.writeText(importText)}>
            {importText}
          </div>
        </div>
      )
    })

  return (
    <>
      <div className="my-2">
        <input
          type="text"
          value={searchedIconName}
          onChange={(event) => setSearchedIconName(event.target.value)}
          className="block w-full rounded-lg border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Search Icon ..."
        />
      </div>
      {iconsList}
    </>
  )
}

export const Default = {
  name: 'Default',
  render: IconRenderer
}
