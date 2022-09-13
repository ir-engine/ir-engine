import React from 'react'
import Hotkeys, { OnKeyFun } from 'react-hot-keys'

import { ContextMenu, MenuItem, showMenu, SubMenu } from '../layout/ContextMenu'
import ToolButton from '../toolbar/ToolButton'

interface Command {
  name: string
  action: Function
  hotkey?: string
  subCommnads?: Command[]
}

interface MainMenuProp {
  commands: Command[]
  icon: any
  isMenuOpen: boolean
  setMenuOpen: (open: boolean) => void
}

const MainMenu = (props: MainMenuProp) => {
  const { commands, icon, isMenuOpen, setMenuOpen } = props

  const toggleMenu = (e) => {
    if (isMenuOpen) {
      setMenuOpen(!isMenuOpen)
      return
    }

    const x = 0
    const y = e.currentTarget.offsetHeight
    showMenu({
      position: { x, y },
      target: e.currentTarget,
      id: 'menu'
    })

    setMenuOpen(true)
  }

  const hideMenu = () => setMenuOpen(false)

  const renderMenu = (command: Command) => {
    if (!command.subCommnads || command.subCommnads.length === 0) {
      const menuItem = (
        <MenuItem key={command.name} onClick={command.action}>
          {command.name}
          {command.hotkey && <div>{command.hotkey}</div>}
        </MenuItem>
      )

      if (command.hotkey) {
        return (
          <Hotkeys key={command.name} keyName={command.hotkey} onKeyUp={command.action as OnKeyFun}>
            {menuItem}
          </Hotkeys>
        )
      }
      return menuItem
    } else {
      return (
        <SubMenu key={command.name} title={command.name} hoverDelay={0}>
          {command.subCommnads.map((subcommand) => {
            return renderMenu(subcommand)
          })}
        </SubMenu>
      )
    }
  }

  return (
    <>
      <ToolButton icon={icon} onClick={toggleMenu} isSelected={isMenuOpen} id="menu" />
      <ContextMenu id="menu" onHide={hideMenu}>
        {commands.map((command: Command) => renderMenu(command))}
      </ContextMenu>
    </>
  )
}

export default MainMenu
