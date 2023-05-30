import React from 'react'

import Button from '@etherealengine/ui/src/primitives/mui/Button'

import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/MUI/Popover',
  component: Component,
  decorators: [
    (Story) => {
      const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
      const openMenu = Boolean(anchorEl)

      const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget)
      }

      const handleClose = () => {
        setAnchorEl(null)
      }

      return (
        <>
          <Button onClick={handleClick}></Button>
          <Story open={openMenu} anchorEl={anchorEl} onClose={handleClose} />
        </>
      )
    }
  ],
  parameters: {
    componentSubtitle: 'Popover',
    jest: 'Popover.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Primary = { args: Component.defaultProps }
