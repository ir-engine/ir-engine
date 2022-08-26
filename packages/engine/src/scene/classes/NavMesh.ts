import { AStar, Corridor, Edge, Graph, NavNode, Vector3, NavMesh as YukaNavMesh } from 'yuka'

export class NavMesh extends YukaNavMesh {
  declare graph: Graph<NavNode, Edge>

  /** @ts-ignore:next-line */
  findPath(from: Vector3, to: Vector3, debug: null | { polygonPath: number[] }) {
    const graph = this.graph
    const path = new Array()

    let fromRegion = this.getRegionForPoint(from, this.epsilonContainsTest)
    let toRegion = this.getRegionForPoint(to, this.epsilonContainsTest)

    if (fromRegion === null || toRegion === null) {
      // if source or target are outside the navmesh, choose the nearest convex region

      if (fromRegion === null) fromRegion = this.getClosestRegion(from)
      if (toRegion === null) toRegion = this.getClosestRegion(to)
    }

    // check if both convex region are identical

    if (fromRegion === toRegion) {
      // no search necessary, directly create the path

      path.push(new Vector3().copy(from))
      path.push(new Vector3().copy(to))
      return path
    } else {
      // source and target are not in same region, perform search

      const source = this.getNodeIndex(fromRegion)
      const target = this.getNodeIndex(toRegion)

      const astar = new AStar(graph, source, target)
      astar.search()

      if (astar.found === true) {
        const polygonPath = astar.getPath()

        const corridor = new Corridor()
        corridor.push(from, from)

        // push sequence of portal edges to corridor

        const portalEdge = { left: null, right: null }

        for (let i = 0, l = polygonPath.length - 1; i < l; i++) {
          const region = this.regions[polygonPath[i]]
          const nextRegion = this.regions[polygonPath[i + 1]]

          ;(this as any)._getPortalEdge(region, nextRegion, portalEdge)

          corridor.push(portalEdge.left!, portalEdge.right!)
        }

        corridor.push(to, to)

        const points = [...corridor.generate()]

        if (debug) {
          debug.polygonPath = polygonPath
        }

        path.push(...points)
      }

      return path
    }
  }
}
