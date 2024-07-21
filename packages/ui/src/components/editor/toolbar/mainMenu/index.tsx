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

import MenuItem from '@mui/material/MenuItem'
import Button from '../../../../primitives/tailwind/Button'
import { ContextMenu } from '../../../tailwind/ContextMenu'

interface Command {
  name: string
  action: () => void
  hotkey?: string
}

interface MainMenuProp {
  commands: Command[]
  icon: any
}

const MainMenu = ({ commands, icon }: MainMenuProp) => {
  const [anchorEvent, setAnchorEvent] = React.useState<undefined | React.MouseEvent<HTMLDivElement>>(undefined)

  const onOpen = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()

    setAnchorEvent(event)
  }

  const renderMenu = (command: Command) => {
    const menuItem = (
      <MenuItem
        key={command.name}
        onClick={() => {
          command.action()
          setAnchorEvent(undefined)
        }}
      >
        {command.name}
        {command.hotkey && <div>{command.hotkey}</div>}
      </MenuItem>
    )
    return menuItem
  }

  return (
    <>
      <div id="menu" className="flex items-center bg-theme-surfaceInput ">
        <Button
          variant="transparent"
          startIcon={icon}
          className="p-0 text-3xl"
          onClick={(event) => onOpen(event as any)}
        />
      </div>
      <ContextMenu anchorEvent={anchorEvent} onClose={() => setAnchorEvent(undefined)}>
        <div className="flex w-fit min-w-44 flex-col gap-1 truncate rounded-lg bg-neutral-900 shadow-lg">
          {commands.map((command: Command) => renderMenu(command))}
        </div>
      </ContextMenu>
    </>
  )
}

export default MainMenu
