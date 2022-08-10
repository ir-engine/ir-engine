import {
  Material as glMaterial,
  Mesh as glMesh,
  Texture as glTexture,
  Node,
  Primitive,
  PrimitiveTarget,
  Property
} from '@gltf-transform/core'
import React, { Fragment, useEffect, useState } from 'react'
import { BufferAttribute, BufferGeometry, Mesh, PerspectiveCamera, Scene, WebGLRenderer } from 'three'

import { initialize3D, renderScene } from '@xrengine/client-core/src/user/components/UserMenu/menus/helperFunctions'
import { getOrbitControls } from '@xrengine/engine/src/input/functions/loadOrbitControl'

import { Button, List, ListItemButton, Stack, Typography } from '@mui/material'
import Box from '@mui/material/Box'

export default function ModelResourceProperties({ prop, ...rest }) {
  const glProp: Property = prop
  const PropInspector = () => {
    function ListExtensions(targetProp: glMaterial | glMesh | Node | Primitive | glTexture) {
      return (
        <Stack>
          <label>Extensions</label>
          <List>
            {targetProp.listExtensions().map((extension, idx) => {
              return <ListItemButton key={idx}>{`${idx}: ${extension.getName()}`}</ListItemButton>
            })}
          </List>
        </Stack>
      )
    }
    switch (glProp.propertyType) {
      case 'Mesh':
        const meshProp = glProp as glMesh
        return (
          <Stack>
            <label>Primitives</label>
            <List>
              {meshProp.listPrimitives().map((primitive, idx) => {
                let primName = primitive.getName()
                primName = primName === '' ? '[Unnamed]' : primName
                return <ListItemButton key={idx}>{`${idx}: ${primName}`}</ListItemButton>
              })}
            </List>
            {ListExtensions(meshProp)}
          </Stack>
        )
      case 'Texture':
        const textureProp = glProp as glTexture
        const srcBlob = URL.createObjectURL(new Blob([textureProp.getImage()!]))
        const dimensions = textureProp.getSize()!
        return (
          <Stack>
            <img src={srcBlob} style={{ maxWidth: '80%', maxHeight: '80%', width: 'auto', height: 'auto' }} />
            <Stack direction="row">
              <label>Type: </label>
              <p>{textureProp.getMimeType()}</p>
            </Stack>
            <Stack direction="row">
              <label>Size: </label>
              <p>{`${dimensions[0]} x ${dimensions[1]}`}</p>
            </Stack>
            {ListExtensions(textureProp)}
          </Stack>
        )

      case 'Material':
        const materialProp = glProp as glMaterial
        return <Stack>{ListExtensions(materialProp)}</Stack>
      case 'Node':
        const nodeProp = glProp as Node
        return <Stack>{ListExtensions(nodeProp)}</Stack>
      case 'Primitive':
        const primProp = glProp as Primitive
        return <Stack>{ListExtensions(primProp)}</Stack>
      default:
        return <p>dud</p>
    }
  }
  return (
    <Box {...rest}>
      <Typography variant="body2" sx={{ textAlign: 'center' }}>
        {glProp.getName()}
      </Typography>
      <PropInspector />
    </Box>
  )
}
