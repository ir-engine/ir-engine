import * as fs from "fs";
import { execFile } from "child_process";
import * as basisu from "basisu";
import * as draco3d from "draco3d";
export function decodeDracoData(rawBuffer, decoder) {
    const buffer = new this.decoderModule.DecoderBuffer();
    buffer.Init(new Int8Array(rawBuffer), rawBuffer.byteLength);
    const geometryType = decoder.GetEncodedGeometryType(buffer);
    let dracoGeometry;
    let status;
    if (geometryType === this.decoderModule.TRIANGULAR_MESH) {
        dracoGeometry = new this.decoderModule.Mesh();
        status = decoder.DecodeBufferToMesh(buffer, dracoGeometry);
    }
    else if (geometryType === this.decoderModule.POINT_CLOUD) {
        dracoGeometry = new this.decoderModule.PointCloud();
        status = decoder.DecodeBufferToPointCloud(buffer, dracoGeometry);
    }
    else {
        const errorMsg = "Error: Unknown geometry type.";
        console.error(errorMsg);
    }
    this.decoderModule.destroy(buffer);
    return dracoGeometry;
}
export function encodeMeshToDraco(mesh) {
    const encoderModule = draco3d.createEncoderModule({});
    const encoder = new encoderModule.Encoder();
    const meshBuilder = new encoderModule.MeshBuilder();
    const dracoMesh = new encoderModule.Mesh();
    const numFaces = mesh.faces.length;
    const numPoints = mesh.vertices.length;
    const numIndices = numFaces * 3;
    const indices = new Uint32Array(numIndices);
    console.log("Number of faces " + numFaces);
    console.log("Number of vertices " + numPoints);
    const vertices = new Float32Array(mesh.vertices.length * 3);
    const normals = new Float32Array(mesh.vertices.length * 3);
    // Add Faces to mesh
    for (let i = 0; i < numFaces; i++) {
        const index = i * 3;
        indices[index] = mesh.faces[i].a;
        indices[index + 1] = mesh.faces[i].b;
        indices[index + 2] = mesh.faces[i].c;
    }
    meshBuilder.AddFacesToMesh(dracoMesh, numFaces, indices);
    // Add POSITION to mesh (Vertices)
    for (let i = 0; i < mesh.vertices.length; i++) {
        const index = i * 3;
        vertices[index] = mesh.vertices[i].x;
        vertices[index + 1] = mesh.vertices[i].y;
        vertices[index + 2] = mesh.vertices[i].z;
    }
    meshBuilder.AddFloatAttributeToMesh(dracoMesh, encoderModule.POSITION, numPoints, 3, vertices);
    // Add NORMAL to mesh
    for (const face of mesh.faces) {
        normals[face["a"] * 3] = face.vertexNormals[0].x;
        normals[face["a"] * 3 + 1] = face.vertexNormals[0].y;
        normals[face["a"] * 3 + 2] = face.vertexNormals[0].z;
        normals[face["b"] * 3] = face.vertexNormals[1].x;
        normals[face["b"] * 3 + 1] = face.vertexNormals[1].y;
        normals[face["b"] * 3 + 2] = face.vertexNormals[1].z;
        normals[face["c"] * 3] = face.vertexNormals[2].x;
        normals[face["c"] * 3 + 1] = face.vertexNormals[2].y;
        normals[face["c"] * 3 + 2] = face.vertexNormals[2].z;
    }
    meshBuilder.AddFloatAttributeToMesh(dracoMesh, encoderModule.NORMAL, numPoints, 3, normals);
    console.log("//DRACO UNCOMPRESSED MESH STATS//////////");
    console.log("Number of faces " + dracoMesh.num_faces());
    console.log("Number of Vertices " + dracoMesh.num_points());
    console.log("Number of Attributes " + dracoMesh.num_attributes());
    // Compressing using DRACO
    const encodedData = new encoderModule.DracoInt8Array();
    encoder.SetSpeedOptions(5, 5);
    encoder.SetAttributeQuantization(encoderModule.POSITION, 10);
    encoder.SetEncodingMethod(encoderModule.MESH_EDGEBREAKER_ENCODING);
    console.log("Encoding...");
    const encodedLen = encoder.EncodeMeshToDracoBuffer(dracoMesh, encodedData);
    encoderModule.destroy(dracoMesh);
    if (encodedLen > 0)
        console.log("Encoded size is " + encodedLen);
    else
        console.log("Error: Encoding failed.");
    // Copy encoded data to buffer.
    const outputBuffer = new ArrayBuffer(encodedLen);
    encoderModule.destroy(encodedData);
    encoderModule.destroy(encoder);
    encoderModule.destroy(meshBuilder);
    console.log("DRACO ENCODED////////////////////////////");
    console.log("Length of buffer: " + outputBuffer.byteLength);
    return outputBuffer;
}
export function PNGToBasis(inPath) {
    const basisFilePath = inPath.replace(".png", ".basis");
    execFile(basisu.path, [inPath]);
    // Read file into array
    const basisData = fs.readFileSync(basisFilePath);
    // destroy file
    fs.unlinkSync(basisFilePath);
    // Return array
    return basisData;
}
