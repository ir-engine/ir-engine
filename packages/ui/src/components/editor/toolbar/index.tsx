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

import React from 'react'

import MenuIcon from '@mui/icons-material/Menu'
import WindowIcon from '@mui/icons-material/Window'

import DropDownMenu from '@etherealengine/editor/src/components/dropDownMenu'
import { EditorNavbarProfile } from '@etherealengine/editor/src/components/projects/EditorNavbarProfile'
import PublishLocation from '@etherealengine/editor/src/components/toolbar/tools//PublishLocation'

type ToolBarProps = {
  menu?: any
  panels?: any
}

export const ToolBar = (props: ToolBarProps) => {
  return (
    <div className="flex-between fixed z-[1000] flex h-10 w-full select-none items-center px-2">
      <DropDownMenu icon={MenuIcon} commands={props.menu} />
      <DropDownMenu icon={WindowIcon} commands={props.panels} />
      <EditorNavbarProfile />
      <PublishLocation />
    </div>
  )
}

export default ToolBar
