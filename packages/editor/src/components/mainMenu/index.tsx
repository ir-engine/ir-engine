import React from 'react'
import { Bars } from '@styled-icons/fa-solid/Bars'
import ToolButton from '../toolbar/ToolButton'
import { ContextMenu, MenuItem, SubMenu, showMenu } from '../layout/ContextMenu'
import { withTranslation, TFunction } from 'react-i18next'

interface Command {
  name: string
  action: Function
  hotkey?: string
  subCommnads?: Command[]
}

interface MainMenuProp {
  commands: Command[]
  t: TFunction
}

interface MainMenuState {
  isMenuOpen: boolean
}

class MainMenu extends React.Component<MainMenuProp, MainMenuState> {
  constructor(props: MainMenuProp) {
    super(props)

    this.state = {
      isMenuOpen: false
    }

    this.t = this.props.t
  }

  t: TFunction

  toggleMenu = (e): void => {
    if (this.state.isMenuOpen) {
      this.setState({ isMenuOpen: false })
      return
    }

    const x = 0
    const y = e.currentTarget.offsetHeight
    showMenu({
      position: { x, y },
      target: e.currentTarget,
      id: 'menu'
    })

    this.setState({ isMenuOpen: true })
  }

  renderMenu = (command: Command) => {
    if (!command.subCommnads || command.subCommnads.length === 0) {
      return (
        <MenuItem key={command.name} onClick={command.action}>
          {command.name}
          {command.hotkey && <div>{command.hotkey}</div>}
        </MenuItem>
      )
    } else {
      return (
        <SubMenu key={command.name} title={command.name} hoverDelay={0}>
          {command.subCommnads.map((subcommand) => {
            return this.renderMenu(subcommand)
          })}
        </SubMenu>
      )
    }
  }

  render() {
    return (
      <>
        <ToolButton icon={Bars} onClick={this.toggleMenu} isSelected={this.state.isMenuOpen} id="menu" />
        <ContextMenu id="menu" onHide={() => this.setState({ isMenuOpen: false })}>
          {this.props.commands.map((command: Command) => this.renderMenu(command))}
        </ContextMenu>
      </>
    )
  }
}

export default withTranslation()(MainMenu)
