import React from 'react'

const Paragraph = ({ children, noIndentation }: any) => {
  const thisStyle = {
    fontSize: '11pt',
    fontFamily: '&quot;Times New Roman&quot;, serif',
    margin: '0'
  }
  return (
    <>
      <p style={thisStyle}>{children}</p>
      {noIndentation ? null : <br />}
    </>
  )
}

export default Paragraph
