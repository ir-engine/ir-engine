import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Pencil01Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 16 16"
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
        d="m2.666 14.333 3.7-1.423c.236-.091.354-.136.465-.196q.147-.08.28-.182c.1-.077.19-.167.369-.346L15 4.666A1.886 1.886 0 0 0 12.332 2l-7.52 7.52c-.18.179-.269.268-.346.368q-.103.132-.182.28c-.06.11-.105.229-.196.465zm0 0 1.372-3.568c.098-.255.147-.382.232-.44a.33.33 0 0 1 .252-.054c.1.019.198.115.391.309l1.506 1.506c.193.193.29.29.31.39a.33.33 0 0 1-.054.253c-.059.085-.186.134-.442.232z"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h16v16H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(Pencil01Sm)
export default ForwardRef
