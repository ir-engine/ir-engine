import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import Button from '../Button'
import Popover from './index'

const argTypes = {}

export default {
  title: 'MUI/Popover',
  component: Popover,
  parameters: {
    componentSubtitle: 'Popover',
    jest: 'Popover.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
} as ComponentMeta<typeof Popover>

const Template: ComponentStory<typeof Popover> = (args) => {
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
      <Popover {...args} open={openMenu} anchorEl={anchorEl} onClose={handleClose} />
    </>
  )
}

export const Default = Template.bind({})
Default.args = Popover.defaultProps
