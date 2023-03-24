import React, { ReactNode } from 'react'

const Drawer = ({ children }: { children: ReactNode }) => {
  return (
    <div className="drawer drawer-end">
      <input id="capture-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">{children}</div>
      <div className="drawer-side">
        <label htmlFor="capture-drawer" className="drawer-overlay"></label>
        <ul className="menu p-4 w-80 bg-base-100 text-base-content">
          <li>
            <a>Sidebar Item 1</a>
          </li>
          <li>
            <a>Sidebar Item 2</a>
          </li>
        </ul>
      </div>
    </div>
  )
}

Drawer.displayName = 'Drawer'

Drawer.defaultProps = {}

export default Drawer
