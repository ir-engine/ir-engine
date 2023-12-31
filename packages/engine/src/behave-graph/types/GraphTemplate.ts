import { Edge, Node } from 'reactflow'

export interface GraphTemplate {
  id: string
  name: string
  nodes: Node[]
  edges: Edge[]
}
