import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import os
import copy
from plyfile import PlyData, PlyElement
import json
from numpy.lib.recfunctions import merge_arrays

np.set_printoptions(precision=3)

current_keyframe = 0
frame_number = 0
vertex_count_in_last_ply = 0
meshes_in_group = []

axes = ['x', 'y', 'z']

# data_type = [('x0', '<f4'), ('x1', '<f4'), ('x2', '<f4'), ('x3', '<f4'), ('y0', '<f4'), ('y1', '<f4'), ('y2', '<f4'), ('y3', '<f4'), ('z0', '<f4'), ('z1', '<f4'), ('z2', '<f4'), ('z3', '<f4')]
short_data_type = [('x', '<f4'), ('y', '<f4'), ('z', '<f4'), ('texture_u', '<f4'), ('texture_v', '<f4')]

full_data_type = [('x', '<f4'), ('y', '<f4'), ('z', '<f4'), ('texture_u', '<f4'), ('texture_v', '<f4'), ('x0', '<f4'), ('x1', '<f4'), ('x2', '<f4'), ('x3', '<f4'), ('y0', '<f4'), ('y1', '<f4'), ('y2', '<f4'), ('y3', '<f4'), ('z0', '<f4'), ('z1', '<f4'), ('z2', '<f4'), ('z3', '<f4')]

def create_poly_mesh_from_sequence(meshes):
    mesh_count_is_one = len(meshes) == 1
    number_of_vertices = len(meshes[0]['vertex']['x'])
    p = meshes[0]
    v = p.elements[0]
    f = p.elements[1]

    if(mesh_count_is_one != True):
        for mesh in range(len(meshes)):
            for i in axes:
                print("Axes: ", i, " meshes[mesh].elements[0].data[i]: ", meshes[mesh].elements[0].data[i])
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
                    print("Encoding", polynomial_array[i][a][n])
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
    texU = meshes[0]['vertex']['texture_u']
    texV = meshes[0]['vertex']['texture_v']

    print(texU)
    print(texV)

    if(mesh_count_is_one != True):
        x0 = poly_data_transpose[5]
        x1 = poly_data_transpose[6]
        x2 = poly_data_transpose[7]
        x3 = poly_data_transpose[8]
        y0 = poly_data_transpose[9]
        y1 = poly_data_transpose[10]
        y2 = poly_data_transpose[11]
        y3 = poly_data_transpose[12]
        z0 = poly_data_transpose[13]
        z1 = poly_data_transpose[14]
        z2 = poly_data_transpose[15]
        z3 = poly_data_transpose[16]

    # connect the proper data structures
    vertices = np.empty(len(x), dtype=(short_data_type if mesh_count_is_one else full_data_type))
    vertices['x'] = x.astype('f4')
    vertices['y'] = y.astype('f4')
    vertices['z'] = z.astype('f4')
    vertices['texture_u'] = texU.astype('f4')
    vertices['texture_v'] = texV.astype('f4')

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
    create_poly_mesh_from_sequence(meshes_in_group) #end of coherent meshes / keyframe max reached? start encoding
    current_keyframe = frame_number
    meshes_in_group = [mesh] # set meshes in group to new keyframe mesh
    