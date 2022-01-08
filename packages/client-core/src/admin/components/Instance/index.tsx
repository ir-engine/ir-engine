import React from 'react'

import InstanceTable from './InstanceTable'
import Search from './SearchInstance'
import { useInstanceStyles } from './styles'

const Instance = () => {
  const classes = useInstanceStyles()

  return (
    <div>
      <div className={classes.marginBottm}>
        <Search />
      </div>

      <div className={classes.rootTable}>
        <InstanceTable />
      </div>
    </div>
  )
}

export default Instance
