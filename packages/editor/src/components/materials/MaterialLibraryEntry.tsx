import React, { StyleHTMLAttributes } from 'react'

export type MaterialLibraryEntryType = {
  name: string
}

export type MaterialLibraryEntryData = {
  nodes: MaterialLibraryEntryType[]
}

export type MaterialLibraryEntryProps = {
  index: number
  data: MaterialLibraryEntryData
  style: StyleHTMLAttributes<HTMLElement>
}

export default function MaterialLibraryEntry(props: MaterialLibraryEntryProps) {
  const node = props.data.nodes[props.index]
  return (
    <li>
      <p>{node.name}</p>
    </li>
  )
}
