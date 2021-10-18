import { NavMesh, NavNode, NavEdge } from 'yuka'

export default class MutableNavMesh extends NavMesh {
  _buildGraph() {
    const graph = this.graph
    const regions = this.regions

    // for each region, the code creates an array of directly accessible regions

    const regionNeighbourhood = new Array()

    for (let i = 0, l = regions.length; i < l; i++) {
      const region = regions[i]

      const nodeIndices = new Array()
      regionNeighbourhood.push(nodeIndices)

      let edge = region.edge

      // iterate through all egdes of the region (in other words: along its contour)

      do {
        // check for a portal edge

        if (edge!.twin !== null) {
          const nodeIndex = this.getNodeIndex(edge!.twin.polygon!)

          if (nodeIndex !== -1) {
            nodeIndices.push(nodeIndex) // the node index of the adjacent region
          }

          // add node for this region to the graph if necessary

          if (graph.hasNode(this.getNodeIndex(edge!.polygon!)) === false) {
            const node = new NavNode(this.getNodeIndex(edge!.polygon!), edge!.polygon!.centroid)

            graph.addNode(node)
          }
        }

        edge = edge!.next
      } while (edge !== region.edge)
    }

    // add navigation edges

    for (let i = 0, il = regionNeighbourhood.length; i < il; i++) {
      const indices = regionNeighbourhood[i]
      const from = i

      for (let j = 0, jl = indices.length; j < jl; j++) {
        const to = indices[j]

        if (from !== to) {
          if (graph.hasEdge(from, to) === false) {
            const nodeFrom = graph.getNode(from)
            const nodeTo = graph.getNode(to)

            const cost = (nodeFrom as any).position.distanceTo((nodeTo as any).position)

            graph.addEdge(new NavEdge(from, to, cost))
          }
        }
      }
    }

    return this
  }
}
