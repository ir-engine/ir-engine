import * as fs from "fs";
import { execFile } from "child_process";
import * as basisu from "basisu";

export function PNGToBasis(inPath: string): Buffer {
    const basisFilePath = inPath.replace(".png", ".basis");

    execFile(basisu.path, [inPath]);

    // Read file into array
    const basisData: Buffer = fs.readFileSync(basisFilePath);

    // destroy file
    fs.unlinkSync(basisFilePath);

    // Return array
    return basisData;
}
