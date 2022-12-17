import React from 'react'

const InputFile = React.forwardRef(
  (
    props: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>,
    ref: React.LegacyRef<HTMLInputElement> | undefined
  ) => {
    return <input ref={ref} style={{ display: 'none' }} type="file" {...props} />
  }
)

export default InputFile
