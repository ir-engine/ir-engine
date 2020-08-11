import React from 'react'
import './style.scss'

const Loader = (): any => {
  return (
    <div className='multicolor-loader'>
      <div className='loader' />
      <span className='text'>Loading...</span>
    </div>
  )
}

export default Loader
