import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const VolumePlusMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M15.416 12.916V7.083M12.499 10h5.834M8.028 3.638 5.39 6.276c-.144.144-.216.216-.3.267a.8.8 0 0 1-.241.1c-.096.023-.198.023-.402.023H3c-.466 0-.7 0-.878.091a.83.83 0 0 0-.364.364c-.091.179-.091.412-.091.879v4c0 .466 0 .7.09.878.08.157.208.284.365.364.178.09.412.09.878.09h1.448c.204 0 .306 0 .402.024q.128.03.24.1c.085.051.157.123.3.268l2.639 2.637c.357.357.535.536.689.548a.42.42 0 0 0 .35-.145c.099-.117.099-.369.099-.874V4.11c0-.506 0-.758-.1-.875a.42.42 0 0 0-.35-.145c-.153.012-.331.19-.688.548"
    />
  </svg>
)
const ForwardRef = forwardRef(VolumePlusMd)
export default ForwardRef
