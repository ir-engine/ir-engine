/*
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an AS IS BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.xrengine.xr.videocompressor.isoparser.tools;

import com.xrengine.xr.videocompressor.isoparser.IsoFile;
import com.xrengine.xr.videocompressor.isoparser.MemoryAllocationException;


import java.nio.ByteBuffer;

public class MemoryUtils {

    public static ByteBuffer allocateByteBuffer(long lengthLong, long max) throws MemoryAllocationException {
        if (lengthLong < 0) {
            throw new IllegalArgumentException("Length must be >= 0");
        }
        long localMax = IsoFile.MAX_RECORD_SIZE_OVERRIDE > -1 ? IsoFile.MAX_RECORD_SIZE_OVERRIDE : max;
        if (lengthLong > localMax) {
            throw new MemoryAllocationException(lengthLong, localMax);
        }
        int length = CastUtils.l2i(lengthLong);
        return ByteBuffer.allocate(length);
    }

    public static byte[] allocateByteArray(long lengthLong, long max) throws MemoryAllocationException {
        if (lengthLong < 0) {
            throw new IllegalArgumentException("Length must be >=0");
        }
        long localMax = IsoFile.MAX_RECORD_SIZE_OVERRIDE > -1 ? IsoFile.MAX_RECORD_SIZE_OVERRIDE : max;
        if (lengthLong > localMax) {
            throw new MemoryAllocationException(lengthLong, localMax);
        }
        int length = CastUtils.l2i(lengthLong);
        return new byte[length];
    }
}
