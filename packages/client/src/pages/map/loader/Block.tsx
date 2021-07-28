import React from 'react'

const Block = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      style={{ margin: 'auto', display: 'block' }}
      width="482px"
      height="482px"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid"
    >
      <rect fill="#9df3ff" x="15" y="15" width="30" height="30" rx="3" ry="3">
        <animate
          attributeName="x"
          dur="2.941176470588235s"
          repeatCount="indefinite"
          keyTimes="0;0.083;0.25;0.333;0.5;0.583;0.75;0.833;1"
          values="15;55;55;55;55;15;15;15;15"
          begin="-2.6960784313725488s"
        />
        <animate
          attributeName="y"
          dur="2.941176470588235s"
          repeatCount="indefinite"
          keyTimes="0;0.083;0.25;0.333;0.5;0.583;0.75;0.833;1"
          values="15;55;55;55;55;15;15;15;15"
          begin="-1.96078431372549s"
        />
      </rect>
      <rect fill="#ffbbe8" x="15" y="15" width="30" height="30" rx="3" ry="3">
        <animate
          attributeName="x"
          dur="2.941176470588235s"
          repeatCount="indefinite"
          keyTimes="0;0.083;0.25;0.333;0.5;0.583;0.75;0.833;1"
          values="15;55;55;55;55;15;15;15;15"
          begin="-1.7156862745098038s"
        />
        <animate
          attributeName="y"
          dur="2.941176470588235s"
          repeatCount="indefinite"
          keyTimes="0;0.083;0.25;0.333;0.5;0.583;0.75;0.833;1"
          values="15;55;55;55;55;15;15;15;15"
          begin="-0.980392156862745s"
        />
      </rect>
      <rect fill="#8d7cf6" x="15" y="15" width="30" height="30" rx="3" ry="3">
        <animate
          attributeName="x"
          dur="2.941176470588235s"
          repeatCount="indefinite"
          keyTimes="0;0.083;0.25;0.333;0.5;0.583;0.75;0.833;1"
          values="15;55;55;55;55;15;15;15;15"
          begin="-0.7352941176470588s"
        />
        <animate
          attributeName="y"
          dur="2.941176470588235s"
          repeatCount="indefinite"
          keyTimes="0;0.083;0.25;0.333;0.5;0.583;0.75;0.833;1"
          values="15;55;55;55;55;15;15;15;15"
          begin="0s"
        />
      </rect>
    </svg>
  )
}

export default Block
