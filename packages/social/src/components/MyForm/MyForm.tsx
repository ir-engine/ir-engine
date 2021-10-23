import React from 'react'

const MyForm = ({ children }) => {
  const MyContext = React.createContext({})
  return (
    <></>
    // <MyContext.Provider>
    //     {children}
    // </MyContext.Provider>
  )
}

export default MyForm
