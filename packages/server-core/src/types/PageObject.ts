/* eslint-disable semi */
export default interface Page<D> {
  total: number
  limit: number
  skip: number
  data: D[]
}
