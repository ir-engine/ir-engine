import React from 'react';
import getConfig from 'next/config';
const LogoImg = getConfig().publicRuntimeConfig.logo;

interface Props {
  onClick: any;
}

const Logo = (props: Props): any => {
  return (
    <div className="logo">
      <img
        src={LogoImg}
        alt="logo"
        crossOrigin="anonymous"
        className="logo"
        onClick={props.onClick ?? null}
      />
    </div>
  );
};

export default Logo;
