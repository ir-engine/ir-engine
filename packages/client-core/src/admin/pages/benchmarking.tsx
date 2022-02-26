import React, { useEffect } from 'react'

import { AuthService } from '../../user/services/AuthService'
import Benchmarking from '../components/Benchmarking'

interface Props {}

function benchmarkingRoute(props: Props) {
  useEffect(() => {
    AuthService.doLoginAuto(false)
  }, [])
  return <Benchmarking />
}

export default benchmarkingRoute
