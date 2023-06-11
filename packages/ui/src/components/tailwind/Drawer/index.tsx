import React, { ReactNode } from 'react'

const Drawer = ({ children, settings }: { children: ReactNode; settings: ReactNode }) => {
  return (
    <div className="drawer drawer-end">
      <input id="capture-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">{children}</div>
      <div className="drawer-side">
        <label htmlFor="capture-drawer" className="drawer-overlay"></label>
        {settings}
      </div>
    </div>
  )
}

Drawer.displayName = 'Drawer'

Drawer.defaultProps = {
  children: <div>Drawer</div>,
  settings: <div>Settings</div>
}

export default Drawer
