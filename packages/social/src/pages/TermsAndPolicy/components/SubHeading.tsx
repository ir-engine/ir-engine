import React from 'react'

const SubHeading = ({ children }) => {
  const thisStyle = {
    fontSize: '11pt',
    fontFamily: '&quot;Times New Roman&quot;, serif',
    margin: '0'
  }
  return (
    <>
      <p style={thisStyle}>
        <b>{children}</b>
      </p>
      <br />
    </>
  )
}

export default SubHeading
