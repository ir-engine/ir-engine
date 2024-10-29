import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Cursor03Default = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M3.926 3.062c-.45-.177-.676-.266-.82-.218a.42.42 0 0 0-.263.264c-.048.143.04.368.218.819L7.48 15.14c.142.363.214.544.33.617.102.063.226.08.34.046.132-.04.25-.196.483-.508l1.784-2.378 2.874 3.952c.159.218.238.326.338.372.088.04.188.047.281.022.107-.03.202-.124.392-.314l2.647-2.647c.19-.19.285-.285.314-.391a.42.42 0 0 0-.022-.282c-.046-.1-.154-.18-.372-.338l-3.952-2.874 2.378-1.784c.312-.234.468-.35.508-.482a.42.42 0 0 0-.046-.34c-.073-.117-.254-.189-.617-.332z"
    />
  </svg>
)
const ForwardRef = forwardRef(Cursor03Default)
export default ForwardRef
