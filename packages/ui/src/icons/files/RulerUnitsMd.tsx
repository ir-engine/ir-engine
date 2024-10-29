import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const RulerUnitsMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
        d="m12.084 4.583 1.25 1.25m-3.75 1.25 1.25 1.25m-3.75 1.25 1.25 1.25m-3.75 1.25 1.25 1.25m-3.695 1.305 3.224 3.223c.165.165.247.248.342.279a.4.4 0 0 0 .258 0c.095-.03.177-.114.342-.279L17.863 6.304c.165-.165.247-.247.278-.342a.4.4 0 0 0 0-.258c-.031-.095-.113-.177-.278-.342l-3.224-3.224c-.165-.165-.248-.248-.343-.279a.4.4 0 0 0-.257 0c-.096.031-.178.114-.343.279L2.139 13.695c-.165.165-.248.247-.279.342a.4.4 0 0 0 0 .258c.031.095.114.178.279.343"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h20v20H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(RulerUnitsMd)
export default ForwardRef
