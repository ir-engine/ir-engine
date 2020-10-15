import React from 'react';
import './style.module.css';

const Loader = (): any => {
  return (
    <div className='multicolor-loader'>
      <div className='loader' />
      <span className='text'>Loading...</span>
    </div>
  );
};

export default Loader;
