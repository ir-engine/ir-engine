import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const DeleteMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 20 20"
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
        d="m15.167 7.5-5 5m0-5 5 5m-11.9-1.7 3.6 4.8c.293.39.44.586.626.727q.248.189.55.275c.224.064.468.064.957.064h6.333c1.4 0 2.1 0 2.635-.272a2.5 2.5 0 0 0 1.093-1.093c.272-.534.272-1.235.272-2.635V7.333c0-1.4 0-2.1-.272-2.635a2.5 2.5 0 0 0-1.093-1.093c-.535-.272-1.235-.272-2.635-.272H9c-.489 0-.733 0-.958.064-.198.057-.385.15-.55.275-.185.141-.332.337-.625.728l-3.6 4.8c-.215.287-.323.43-.365.588a.83.83 0 0 0 0 .424c.042.157.15.3.365.588"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h20v20H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(DeleteMd)
export default ForwardRef
