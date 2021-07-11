import React, { useContext } from 'react'
import Stats from './Stats'
import { EditorContext } from '../contexts/EditorContext'

const StatsFuc = () => {
  const editor = useContext(EditorContext)
  return <Stats editor={editor} />
}

export default StatsFuc
