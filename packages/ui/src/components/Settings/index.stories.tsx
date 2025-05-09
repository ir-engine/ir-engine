import { Meta } from '@storybook/react/*'
import React, { useState } from 'react'
import SettingsMenu from '.'

const meta = {
  title: 'Viewer/ Settings Menu',
  component: SettingsMenu
} as Meta
export default meta
export const Default = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <button className="rounded-md bg-blue-300 p-4 font-bold" onClick={() => setOpen(!open)}>
          {open ? 'Open' : 'Close'}
        </button>
        {open && <SettingsMenu />}
      </>
    )
  }
} as Meta<typeof meta>
