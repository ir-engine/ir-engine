import React from 'react';
import './style.module.css';

interface Props {
  loadPercent: number;
}
const LoadingBar = ({ loadPercent }: Props): any => {
  return (
    <div className="LoadingBar">
      <div className="loading-bar-outline" />
      <div
        className="progress-bar"
        style={{
          width: `${loadPercent}%`
        }}
      />
    </div>
  );
};
export default LoadingBar;
