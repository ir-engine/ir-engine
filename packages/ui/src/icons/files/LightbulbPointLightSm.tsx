import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const LightbulbPointLightSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 16 17"
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
        strokeWidth={1.5}
        d="M6.334 14.805h3.333m.334-4.45a4.667 4.667 0 1 0-4 0v.45c0 .621 0 .932.101 1.177.135.327.395.586.722.722.245.101.555.101 1.177.101.62 0 .932 0 1.177-.101.326-.136.586-.395.721-.722.102-.245.102-.556.102-1.177z"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 .139h16v16H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(LightbulbPointLightSm)
export default ForwardRef
