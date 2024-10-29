import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const LightbulbPointLightMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 20 21"
    role="img"
    stroke="currentColor"
    ref={ref}
    {...props}
  >
    <g clipPath="url(#prefix__a)">
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M7.916 18.472h4.167m.416-5.561a5.834 5.834 0 1 0-5 0v.561c0 .777 0 1.165.127 1.472.17.408.494.732.902.901.306.127.695.127 1.471.127s1.165 0 1.471-.127c.409-.169.733-.493.902-.902.127-.306.127-.694.127-1.47z"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 .139h20v20H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(LightbulbPointLightMd)
export default ForwardRef
