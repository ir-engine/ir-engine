import { EllipsisHorizontalIcon, UserCircleIcon } from '@heroicons/react/20/solid'
import React from 'react'

import ThemeSwitcher from '@etherealengine/ui/src/components/tailwind/ThemeSwitcher'

const Header = () => {
  return (
    <nav className="w-full navbar">
      <div className="flex-1">
        <a className="btn btn-ghost normal-case text-xl">Ethereal Capture</a>
      </div>
      <div className="navbar-end w-full">
        <label htmlFor="capture-drawer" className="btn btn-square btn-ghost drawer-button">
          <EllipsisHorizontalIcon className="w-6 h-6" />
        </label>
        <ThemeSwitcher />
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-square avatar">
            <UserCircleIcon className="w-6 h-6" />
          </label>
        </div>
      </div>
    </nav>
  )
}

Header.displayName = 'Header'

Header.defaultProps = {}

export default Header
