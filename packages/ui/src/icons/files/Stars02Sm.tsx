import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Stars02Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
        d="M3 14.805v-3.333m0-6.667V1.472M1.335 3.138h3.333m-3.333 10h3.333m4-11L7.511 5.144c-.188.49-.282.733-.428.94a2 2 0 0 1-.471.47c-.206.146-.45.24-.939.428L2.667 8.138l3.006 1.156c.489.188.733.282.939.429a2 2 0 0 1 .471.47c.146.206.24.45.428.94l1.156 3.005 1.156-3.006c.188-.488.282-.733.429-.938q.196-.276.47-.471c.206-.147.45-.24.94-.429l3.005-1.156-3.006-1.156c-.488-.188-.733-.282-.938-.428a2 2 0 0 1-.471-.47c-.147-.207-.24-.45-.429-.94z"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 .139h16v16H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(Stars02Sm)
export default ForwardRef
