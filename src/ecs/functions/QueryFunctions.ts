import { Component } from "../classes/Component"
import { queryKey } from "./Utils"
import Query from "../classes/Query"

export function getQuery(components: Component<any>[]): Query {
  const key = queryKey(components)
  let query = this.queries[key]
  if (!query) {
    this.queries[key] = query = new Query(components)
  }
  return query
}
