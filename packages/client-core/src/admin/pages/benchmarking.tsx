import Benchmarking from '../components/Benchmarking'
import { AuthService } from '../../user/services/AuthService'
import React, { useEffect } from 'react'

interface Props {}

function benchmarkingRoute(props: Props) {
  useEffect(() => {
    AuthService.doLoginAuto(false)
  }, [])
  return <Benchmarking />
}

export default benchmarkingRoute
