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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { useArgs } from '@storybook/preview-api'
import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import CheckboxItem from './CheckboxItem'

interface CheckboxItemProps {
  label?: string
  checked?: boolean
  onClick?: () => void
  disabled?: boolean
}

const meta = {
  title: 'Components/Settings/CheckboxItem',
  component: CheckboxItem,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A checkbox item component for settings screens with smooth animations and consistent styling.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'The label text for the checkbox'
    },
    checked: {
      control: 'boolean',
      description: 'Whether the checkbox is checked'
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the checkbox is disabled'
    },
    onClick: {
      action: 'clicked',
      description: 'Callback function when checkbox is clicked'
    }
  },
  args: {
    label: 'I agree to the Infinite Reality Terms of Service',
    checked: false,
    disabled: false
  }
} satisfies Meta<typeof CheckboxItem>

export default meta
type Story = StoryObj<typeof meta>

const CheckboxItemRenderer = (args: CheckboxItemProps) => {
  const [currentArgs, updateArgs] = useArgs<{ checked: boolean }>()

  return (
    <div className="w-96 rounded-lg bg-gradient-to-br from-pink-500 via-purple-500 to-orange-400 p-4">
      <CheckboxItem
        {...args}
        checked={currentArgs.checked}
        onClick={() => updateArgs({ checked: !currentArgs.checked })}
      />
    </div>
  )
}

export const Default: Story = {
  name: 'Default',
  render: CheckboxItemRenderer
}

export const Checked: Story = {
  name: 'Checked',
  args: {
    checked: true
  },
  render: CheckboxItemRenderer
}

export const Disabled: Story = {
  name: 'Disabled',
  args: {
    disabled: true
  },
  render: CheckboxItemRenderer
}

export const DisabledChecked: Story = {
  name: 'Disabled Checked',
  args: {
    checked: true,
    disabled: true
  },
  render: CheckboxItemRenderer
}

export const AgeVerification: Story = {
  name: 'Age Verification',
  args: {
    label: 'I am 18 years of age or older'
  },
  render: CheckboxItemRenderer
}

export const WithCustomContent: Story = {
  name: 'With Custom Content',
  render: (args) => {
    const [currentArgs, updateArgs] = useArgs<{ checked: boolean }>()

    return (
      <div className="w-96 rounded-lg bg-gradient-to-br from-pink-500 via-purple-500 to-orange-400 p-4">
        <CheckboxItem
          {...args}
          checked={currentArgs.checked}
          onClick={() => updateArgs({ checked: !currentArgs.checked })}
        >
          <div className="flex flex-col">
            <span className="font-medium">Custom Content</span>
            <span className="text-sm text-white/70">This checkbox has custom children content</span>
          </div>
        </CheckboxItem>
      </div>
    )
  }
}

export const MultipleItems: Story = {
  name: 'Multiple Items',
  render: () => {
    const [termsChecked, setTermsChecked] = React.useState(false)
    const [ageChecked, setAgeChecked] = React.useState(false)
    const [newsletterChecked, setNewsletterChecked] = React.useState(true)

    return (
      <div className="w-96 space-y-2 rounded-lg bg-gradient-to-br from-pink-500 via-purple-500 to-orange-400 p-4">
        <CheckboxItem
          label="I agree to the Infinite Reality Terms of Service"
          checked={termsChecked}
          onClick={() => setTermsChecked(!termsChecked)}
        />
        <CheckboxItem
          label="I am 18 years of age or older"
          checked={ageChecked}
          onClick={() => setAgeChecked(!ageChecked)}
        />
        <CheckboxItem
          label="Subscribe to newsletter"
          checked={newsletterChecked}
          onClick={() => setNewsletterChecked(!newsletterChecked)}
        />
      </div>
    )
  }
}
