import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const LightbulbPointLightLg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 24 25"
    role="img"
    stroke="currentColor"
    ref={ref}
    {...props}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9.5 22.139h5m.5-6.674a7 7 0 1 0-6 0v.674c0 .932 0 1.398.152 1.765a2 2 0 0 0 1.083 1.082c.367.153.833.153 1.765.153s1.398 0 1.765-.153a2 2 0 0 0 1.083-1.082c.152-.367.152-.833.152-1.765z"
    />
  </svg>
)
const ForwardRef = forwardRef(LightbulbPointLightLg)
export default ForwardRef
