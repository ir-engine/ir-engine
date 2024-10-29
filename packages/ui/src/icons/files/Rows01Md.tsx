import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Rows01Md = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
    <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}>
      <path d="M14.833 8.333c.934 0 1.4 0 1.757-.181.314-.16.569-.415.728-.729.182-.356.182-.823.182-1.756v-.5c0-.934 0-1.4-.182-1.757a1.67 1.67 0 0 0-.728-.728c-.357-.182-.823-.182-1.757-.182H5.167c-.934 0-1.4 0-1.757.182-.314.16-.569.414-.728.728-.182.357-.182.823-.182 1.757v.5c0 .933 0 1.4.182 1.756.16.314.414.569.728.729.357.181.823.181 1.757.181zM14.833 17.5c.934 0 1.4 0 1.757-.182.314-.16.569-.414.728-.728.182-.357.182-.823.182-1.757v-.5c0-.933 0-1.4-.182-1.756a1.67 1.67 0 0 0-.728-.729c-.357-.181-.823-.181-1.757-.181H5.167c-.934 0-1.4 0-1.757.181-.314.16-.569.415-.728.729-.182.356-.182.823-.182 1.756v.5c0 .934 0 1.4.182 1.757.16.314.414.569.728.728.357.182.823.182 1.757.182z" />
    </g>
  </svg>
)
const ForwardRef = forwardRef(Rows01Md)
export default ForwardRef
