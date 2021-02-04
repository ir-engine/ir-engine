import React from 'react';
import styles from './style.module.scss';

const OrbitLoader = (): any => {
  return (
    <div className="spinner-box-wrapper">
      <div className="spinner-box">
        <div className="blue-orbit leo">
        </div>

        <div className="green-orbit leo">
        </div>

        <div className="red-orbit leo">
        </div>

        <div className="white-orbit w1 leo">
        </div><div className="white-orbit w2 leo">
        </div><div className="white-orbit w3 leo">
        </div>
      </div>
    </div>
  );
};

export default OrbitLoader;
