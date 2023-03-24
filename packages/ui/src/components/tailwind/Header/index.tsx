import { EllipsisHorizontalIcon, UserCircleIcon } from '@heroicons/react/20/solid'
import React from 'react'

import ThemeSwitcher from '@etherealengine/ui/src/components/tailwind/ThemeSwitcher'

// const Header = (props: any) => {
//   return (
//     <div className="navbar bg-base-100 w-full">
//       <div className="flex-none w-full">
//         <h1 className="w-full whitespace-nowrap">Capture Pose</h1>
//       </div>
//       <div className="flex-1" />
//       <div className="navbar-end w-full">
//         <ThemeSwitcher />
//         <label htmlFor="capture-drawer" className="drawer-button">
//           <CogIcon className="w-6 h-6" />
//           Settings
//         </label>
//         {/* <Button
//           className="drawer-button"
//           icon={
//             <FilmIcon className="h-full w-full mr-2" />
//           }
//           title="Recordings"
//         /> */}
//       </div>
//     </div>
//   )
// }

const Header = () => {
  return (
    <nav className="navbar border-solid border-2 border-sky-500 w-full">
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
          <ul tabIndex={0} className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52">
            <li>
              <a className="justify-between">
                Profile
                <span className="badge">New</span>
              </a>
            </li>
            <li>
              <a>Settings</a>
            </li>
            <li>
              <a>Logout</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}

Header.displayName = 'Header'

Header.defaultProps = {}

export default Header
