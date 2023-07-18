import React, { useEffect, useState } from 'react'

import './PopUp.css'

// Import the external CSS file

const PopUp = ({ tag, message, visibleDuration = 3000, icon: Icon = InfoSharp, className }) => {
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
    }, visibleDuration)

    return () => clearTimeout(timer)
  }, [visibleDuration])

  return (
    <div className={`popup-container ${className}`} style={{ opacity: visible ? 1 : 0 }}>
      <div className={`popup-icon-box ${className}`}>
        <Icon />
      </div>
      <div className={`popup-content ${className}`}>{message}</div>
    </div>
  )
}

export default PopUp
