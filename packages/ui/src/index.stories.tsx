import { Meta, StoryObj } from '@storybook/react/*'
import React from 'react'
const meta = {
  title: 'UI/Viewer',
  parameters: {
    layout: 'fullscreen'
  },
  tags: ['autodocs']
} satisfies Meta

export default meta

export const Default: StoryObj = {
  render: () => {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-transparent">
        <div className="max-[30ch] rounded-md bg-white/60 p-4">
          Toggle the IR Engine and Location butons in the toolbar to change the scene
        </div>
      </div>
    )
  }
}
