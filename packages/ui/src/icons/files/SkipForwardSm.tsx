import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const SkipForwardSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M12.667 3.333v9.333m-7.6-.72 3.892-3.113c.356-.285.534-.427.599-.6a.67.67 0 0 0 0-.467c-.065-.172-.243-.315-.599-.6L5.067 4.054c-.555-.444-.832-.666-1.066-.666a.67.67 0 0 0-.521.25c-.146.183-.146.538-.146 1.249v6.228c0 .71 0 1.065.146 1.248a.67.67 0 0 0 .521.25c.234 0 .511-.222 1.066-.665"
    />
  </svg>
)
const ForwardRef = forwardRef(SkipForwardSm)
export default ForwardRef
