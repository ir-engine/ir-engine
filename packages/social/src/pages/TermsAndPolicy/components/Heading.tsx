import React from 'react'

const Heading = ({ children }) => {
  const thisStyle = {
    fontSize: '11pt',
    fontFamily: '&quot;Times New Roman&quot;, serif',
    margin: '0'
  }
  return (
    <>
      <p style={thisStyle}>
        <u>
          <b>{children}</b>
        </u>
      </p>
      <br />
    </>
  )
}

export default Heading
