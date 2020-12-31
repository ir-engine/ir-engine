import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import os
import copy
from plyfile import PlyData, PlyElement
import json
from numpy.lib.recfunctions import merge_arrays
import pyprogmesh

np.set_printoptions(precision=3)

current_keyframe = 0
frame_number = 0
vertex_count_in_last_ply = 0
meshes_in_group = []

axes = ['x', 'y', 'z']



# short_data_type = [('x', '<f4'), ('y', '<f4'), ('z', '<f4'), ('texture_u', '<f4'), ('texture_v', '<f4')]

# full_data_type = [('x', '<f4'), ('y', '<f4'), ('z', '<f4'), ('texture_u', '<f4'), ('texture_v', '<f4'), ('x0', '<f4'), ('x1', '<f4'), ('x2', '<f4'), ('x3', '<f4'), ('y0', '<f4'), ('y1', '<f4'), ('y2', '<f4'), ('y3', '<f4'), ('z0', '<f4'), ('z1', '<f4'), ('z2', '<f4'), ('z3', '<f4')]


short_data_type = [('x', '<f4'), ('y', '<f4'), ('z', '<f4')]

full_data_type = [('x', '<f4'), ('y', '<f4'), ('z', '<f4'), ('x0', '<f4'), ('x1', '<f4'), ('x2', '<f4'), ('x3', '<f4'), ('y0', '<f4'), ('y1', '<f4'), ('y2', '<f4'), ('y3', '<f4'), ('z0', '<f4'), ('z1', '<f4'), ('z2', '<f4'), ('z3', '<f4')]

def create_poly_mesh_from_sequence(meshes):
    mesh_count_is_one = len(meshes) == 1
    number_of_vertices = len(meshes[0]['vertex']['x'])
    p = meshes[0]
    v = p.elements[0]
    f = p.elements[1]

    if(mesh_count_is_one != True):
        for mesh in range(len(meshes)):
            for i in axes:
                for vert in range(len(meshes[mesh].elements[0].data[i])):
                    # offset meshes so first mesh is always 0 vals
                    meshes[mesh].elements[0].data[i][vert] = meshes[mesh].elements[0].data[i][vert]# - meshes[0].elements[0].data[i][vert]
            # For all meshes in group, subtract position from self and add to offset mesh group

        # vertex_positions_to_polynomial(vertex_positions) # Convert X to polynomial, Y to polynomial, Z to polynomial
        # Set polynomial mesh vertex to this value
        number_of_meshes = len(meshes)
        number_of_vertices = len(meshes[0]['vertex']['x'])

        polynomial_array = []

        # for each vert in total length
        for current_vertex in range(number_of_vertices):
            # get an axis
            polyAxes = []
            # for each in xyz
            for axis in axes:
                # new array of vertex positions
                vPositions = []
                frameCounter = []
                frame = 0
                # for each mesh in count
                for m in range(number_of_meshes):
                    frameCounter.append(frame)
                    frame = frame + 1
                    # add to new array
                    vPositions.append(meshes[m]['vertex'][axis][current_vertex])
                # model = polyfit
                model = np.polyfit(frameCounter, vPositions, 4)
                polyAxes.append( model[:-1] )
                # add poly
            polynomial_array.append(polyAxes)


        encoded_vertices = []

        for i in range(len(polynomial_array)):
            encoded_vertex = []
            for a in range(len(polynomial_array[i])):
                for n in range(len(polynomial_array[i][a])):
                    encoded_vertex.append(polynomial_array[i][a][n])
            vals = []
            for val in v[i]:
                vals.append(val)
            for val in encoded_vertex:
                vals.append(val)
            valsArray = np.array(vals)
            encoded_vertices.append(valsArray)

        poly_data = encoded_vertices

        poly_data_transpose = np.array(poly_data).T

    x = meshes[0]['vertex']['x']
    y = meshes[0]['vertex']['y']
    z = meshes[0]['vertex']['z']

    # texU = meshes[0]['vertex']['texture_u']
    # texV = meshes[0]['vertex']['texture_v']

    if(mesh_count_is_one != True):
        x0 = poly_data_transpose[3]
        x1 = poly_data_transpose[4]
        x2 = poly_data_transpose[5]
        x3 = poly_data_transpose[6]
        y0 = poly_data_transpose[7]
        y1 = poly_data_transpose[8]
        y2 = poly_data_transpose[9]
        y3 = poly_data_transpose[10]
        z0 = poly_data_transpose[11]
        z1 = poly_data_transpose[12]
        z2 = poly_data_transpose[13]
        z3 = poly_data_transpose[14]

        # x0 = poly_data_transpose[5]
        # x1 = poly_data_transpose[6]
        # x2 = poly_data_transpose[7]
        # x3 = poly_data_transpose[8]
        # y0 = poly_data_transpose[9]
        # y1 = poly_data_transpose[10]
        # y2 = poly_data_transpose[11]
        # y3 = poly_data_transpose[12]
        # z0 = poly_data_transpose[13]
        # z1 = poly_data_transpose[14]
        # z2 = poly_data_transpose[15]
        # z3 = poly_data_transpose[16]

    # connect the proper data structures
    vertices = np.empty(len(x), dtype=(short_data_type if mesh_count_is_one else full_data_type))
    vertices['x'] = x.astype('f4')
    vertices['y'] = y.astype('f4')
    vertices['z'] = z.astype('f4')

    # vertices['texture_u'] = texU.astype('f4')
    # vertices['texture_v'] = texV.astype('f4')

    if(mesh_count_is_one != True):
        vertices['x0'] = x0.astype('f4')
        vertices['x1'] = x1.astype('f4')
        vertices['x2'] = x2.astype('f4')
        vertices['x3'] = x3.astype('f4')
        vertices['y0'] = y0.astype('f4')
        vertices['y1'] = y1.astype('f4')
        vertices['y2'] = y2.astype('f4')
        vertices['y3'] = y3.astype('f4')
        vertices['z0'] = z0.astype('f4')
        vertices['z1'] = z1.astype('f4')
        vertices['z2'] = z2.astype('f4')
        vertices['z3'] = z3.astype('f4')

    poly_mesh_path = './encoded/poly' + str(current_keyframe) + '.ply'
    ply = PlyData([PlyElement.describe(vertices, 'vertex'), f], text=True)
    ply.write(poly_mesh_path)

class Mesh:
    vertices = []
    has_normals = False
    has_uvs = False
    num_uv_sets = 0
    normals = []
    faces = []
    uv_sets = []
class Vertex:
    x = 0
    y = 0
    z = 0

class Face:
    v_1 = 0
    v_2 = 0
    v_3 = 0

def DecimateMesh(mesh):

    processMesh = Mesh()

    number_of_vertices = len(mesh['vertex']['x'])
    (x, y, z) = (mesh['vertex'][t] for t in ('x', 'y', 'z'))

    originalMeshVerts = []
    for i in range(0, number_of_vertices):
        vertex = Vertex()
        vertex.x = x[i]
        vertex.y = y[i]
        vertex.z = z[i]
        originalMeshVerts.append(vertex)

    processMesh.vertices = originalMeshVerts

    verts = list()
    faces = list()
    PMSettings = pyprogmesh.ProgMeshSettings()
    PMSettings.ProtectTexture = True
    PMSettings.RemoveDuplicate = False
    PMSettings.KeepBorder = True

    for i in range(0, number_of_vertices):
        _v = processMesh.vertices[i]
        v = [_v.x, _v.y, _v.z]
        # _uv = [mesh.uv_sets[0][i].u, mesh.uv_sets[0][i].v]
        _uv = None
        # if mesh.has_normals:
        #     _normal = [mesh.normals[i].x, mesh.normals[i].y, mesh.normals[i].z]
        # else:
        _normal = None
        verts.append(pyprogmesh.RawVertex(Position=v, UV=_uv, Normal=_normal, RGBA=None))
    #HANDLE FACES
    print("********** # FACES")
    print(mesh.elements[1].count)

    print("******** mesh['face'].data['vertex_indices']")
    print(mesh.elements[1].data)
    print("**************** VERTEX INDICES")
    print(mesh['face'].data['vertex_indices'])

    print("**************** VERTEX INDICES 0 v_1")
    print(mesh['face'].data['vertex_indices'][0][0])

    # For each in vertex indicies
    # Create a new face
    # populate with v_1, v_2, v_3
    # append to face list
    processMesh.faces = []
    for i in range(0, mesh.elements[1].count):
        face = Face()
        face.v_1 = mesh['face'].data['vertex_indices'][i][0]
        face.v_2 = mesh['face'].data['vertex_indices'][i][1]
        face.v_3 = mesh['face'].data['vertex_indices'][i][2]
        processMesh.faces.append(face)

    for i in range(0, mesh.elements[1].count):
        _t = processMesh.faces[i]
        print(_t)
        f = [_t.v_1, _t.v_2, _t.v_3]
        faces.append(f)
    print ("PREP: old verts = %d, old faces = %d" % (len(verts), len(faces)))
    pm = pyprogmesh.ProgMesh(len(verts), len(faces), verts, faces, PMSettings)
    pm.ComputeProgressiveMesh()
    result = pm.DoProgressiveMesh(0.25)
    if result == 0:
        return
    else:
        numVerts, verts, numFaces, faces = result[0], result[1], result[2], result[3]
        print ("RESULTS: new verts = %d, new faces = %d" % (numVerts, numFaces))
        processMesh.num_vertices = numVerts

        newVertices = []
        newUVs = []
        newNormals = []
        for i in range(0, numVerts):
            rawVert = verts[i]
            v = processMesh.vertices[i]
            v.x = rawVert.Position[0]
            v.y = rawVert.Position[1]
            v.z = rawVert.Position[2]
            if processMesh.num_uv_sets > 0:
                uv = processMesh.uv_sets[0][i]
                uv.u = rawVert.UV[0]
                uv.v = rawVert.UV[1]
                newUVs.append(uv)
            if processMesh.has_normals:
                normals = processMesh.normals[i]
                normals.x = rawVert.Normal[0]
                normals.y = rawVert.Normal[1]
                normals.z = rawVert.Normal[2]
                newNormals.append(normals)
            newVertices.append(v)
        processMesh.vertices = newVertices
        processMesh.normals = newNormals
        processMesh.uv_sets = newUVs
        processMesh.num_faces = numFaces

        newFaces = []

        for i in range(0, numFaces):
            triangle = faces[i]
            t = processMesh.faces[i]
            t.v_1 = triangle[0]
            t.v_2 = triangle[1]
            t.v_3 = triangle[2]
            newFaces.append(triangle)
        
        processMesh.faces = newFaces

        print("Finished with decimation")
        return processMesh

for subdir, dirs, files in os.walk('./encode'):
    for file in sorted(files):     #for each mesh
        if frame_number >= len(files):
            print("FINISHED")
            break

        mesh = PlyData.read('./encode/' + file)
        (x, y, z) = (mesh['vertex'][t] for t in ('x', 'y', 'z'))
        vertex_count_in_current_ply = len(x)

        if frame_number > 0 and (vertex_count_in_current_ply != vertex_count_in_last_ply or frame_number >= len(files)):
            create_poly_mesh_from_sequence(meshes_in_group) #end of coherent meshes / keyframe max reached? start encoding
            current_keyframe = frame_number
            meshes_in_group = [mesh] # set meshes in group to new keyframe mesh
            print("Encoded mesh at " + str(frame_number))
        else:
            meshes_in_group.append(mesh)
            print("Adding mesh to group" + str(frame_number))
        frame_number = frame_number + 1
        vertex_count_in_last_ply = vertex_count_in_current_ply # set new vertex count
    # create_poly_mesh_from_sequence(meshes_in_group) #end of coherent meshes / keyframe max reached? start encoding
    DecimateMesh(mesh)
    current_keyframe = frame_number
    meshes_in_group = [mesh] # set meshes in group to new keyframe mesh
