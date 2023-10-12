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
import { PopoverPosition } from '@mui/material/Popover'

import { ContextMenu } from '../layout/ContextMenu'
import ToolButton from '../toolbar/ToolButton'

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
  const [anchorPosition, setAnchorPosition] = React.useState<undefined | PopoverPosition>(undefined)
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const onOpen = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()

    setAnchorEl(event.currentTarget)
    setAnchorPosition({
      left: 0,
      top: event.currentTarget.offsetHeight + 6
    })
  }

  const handleClose = () => {
    setAnchorEl(null)
    setAnchorPosition(undefined)
  }

  const renderMenu = (command: Command) => {
    const menuItem = (
      <MenuItem
        key={command.name}
        onClick={() => {
          command.action()
          handleClose()
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
      <ToolButton icon={icon} onClick={onOpen} isSelected={open} id="menu" />
      <ContextMenu
        open={open}
        anchorEl={anchorEl}
        anchorPosition={anchorPosition}
        rootStyle={{
          transform: 'translateX(-12px)'
        }}
        onClose={handleClose}
      >
        {commands.map((command: Command) => renderMenu(command))}
      </ContextMenu>
    </>
  )
}

export default MainMenu
