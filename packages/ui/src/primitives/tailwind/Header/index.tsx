import { EllipsisHorizontalIcon, UserCircleIcon } from '@heroicons/react/20/solid'
import React from 'react'

import ThemeSwitcher from '../../tailwind/ThemeSwitcher/index'

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
    <nav className="navbar w-full fixed">
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
