import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const ScreenshotMenuMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      <path d="M1.666 6.981c0-.292 0-.438.012-.56A2.5 2.5 0 0 1 3.92 4.179c.122-.012.276-.012.584-.012.119 0 .178 0 .228-.003a1.67 1.67 0 0 0 1.446-1.042c.019-.047.036-.1.071-.205.036-.105.053-.158.072-.205A1.67 1.67 0 0 1 7.767 1.67c.05-.003.105-.003.217-.003h4.031c.111 0 .167 0 .217.003a1.67 1.67 0 0 1 1.446 1.042c.019.047.036.1.071.205s.053.158.072.205c.24.597.803 1.003 1.446 1.042.05.003.11.003.228.003.307 0 .461 0 .584.012A2.5 2.5 0 0 1 18.32 6.42c.013.123.013.27.013.561v6.52c0 1.4 0 2.1-.273 2.634a2.5 2.5 0 0 1-1.092 1.093c-.535.272-1.235.272-2.635.272H5.666c-1.4 0-2.1 0-2.635-.272a2.5 2.5 0 0 1-1.093-1.093c-.272-.535-.272-1.235-.272-2.635z" />
      <path d="M10 13.75a3.333 3.333 0 1 0 0-6.666 3.333 3.333 0 0 0 0 6.666" />
    </g>
  </svg>
)
const ForwardRef = forwardRef(ScreenshotMenuMd)
export default ForwardRef
