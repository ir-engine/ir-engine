import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const SkipBackMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M4.166 15.834V4.167m9.5.9L8.801 8.959c-.445.356-.668.534-.748.749a.83.83 0 0 0 0 .585c.08.215.303.393.748.749l4.865 3.892c.694.555 1.04.832 1.332.833a.83.83 0 0 0 .653-.314c.182-.228.182-.672.182-1.56V6.108c0-.888 0-1.332-.182-1.56a.83.83 0 0 0-.653-.314c-.291 0-.638.278-1.332.833"
    />
  </svg>
)
const ForwardRef = forwardRef(SkipBackMd)
export default ForwardRef
