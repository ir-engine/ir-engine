import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Pencil01Md = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
        d="m3.084 17.917 4.624-1.779c.296-.114.444-.17.582-.245q.185-.099.35-.228c.125-.096.237-.208.46-.432l9.4-9.4A2.357 2.357 0 0 0 15.168 2.5l-9.4 9.4c-.224.224-.336.336-.432.46q-.128.165-.227.35c-.075.138-.132.286-.245.582zm0 0 1.715-4.46c.123-.319.184-.478.29-.551a.42.42 0 0 1 .315-.067c.126.024.247.145.489.386l1.882 1.883c.242.242.363.362.387.488a.42.42 0 0 1-.067.316c-.073.105-.233.167-.552.29z"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h20v20H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(Pencil01Md)
export default ForwardRef
