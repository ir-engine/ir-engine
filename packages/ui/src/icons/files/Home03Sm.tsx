import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Home03Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 16 16" ref={ref} {...props}>
    <path
      stroke="#080808"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M6 14V9.067c0-.374 0-.56.072-.703a.67.67 0 0 1 .292-.291C6.506 8 6.693 8 7.066 8h1.867c.373 0 .56 0 .703.073a.67.67 0 0 1 .291.291c.073.143.073.33.073.703V14M1.333 6.333l6.027-4.52c.23-.172.344-.258.47-.291a.67.67 0 0 1 .34 0c.125.033.24.12.47.291l6.026 4.52m-12-1v6.534c0 .746 0 1.12.146 1.405.127.25.331.455.582.583C3.68 14 4.053 14 4.8 14h6.4c.746 0 1.12 0 1.405-.145.25-.128.455-.332.583-.583.145-.285.145-.659.145-1.405V5.333L9.28 2.293c-.46-.344-.689-.516-.94-.582a1.33 1.33 0 0 0-.68 0c-.252.066-.481.238-.94.582z"
    />
  </svg>
)
const ForwardRef = forwardRef(Home03Sm)
export default ForwardRef
