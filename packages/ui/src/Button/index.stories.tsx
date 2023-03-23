import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import Button from './index'

const argTypes = {}

export default {
  title: 'MUI/Button',
  component: Button,
  parameters: {
    componentSubtitle: 'Button',
    jest: 'Button.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
} as ComponentMeta<typeof Button>

const Template: ComponentStory<typeof Button> = (args) => <Button {...args} />

export const Default = Template.bind({})
Default.args = Button.defaultProps

// import React from "react";
// import {Meta, Story} from '@storybook/react';
// import { Button, Props } from '/home/arnav/etherealengine/packages/ui/src/Button/index';
// const meta: Meta ={
//   title: 'Button',
//   component:Button
// }
// export default meta;
// export const Default = ()=><Button variant = "primary">Click Me</Button>
