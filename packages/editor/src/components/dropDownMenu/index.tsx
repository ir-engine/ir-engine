import React from 'react'

import MenuItem from '@mui/material/MenuItem'
import { PopoverPosition } from '@mui/material/Popover'

import { ContextMenu } from '../layout/ContextMenu'
import ToolButton from '../toolbar/ToolButton'

interface Command {
  name: string
  action: Function
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
