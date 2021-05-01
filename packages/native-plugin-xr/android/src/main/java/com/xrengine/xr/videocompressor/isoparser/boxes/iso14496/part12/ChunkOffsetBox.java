package com.xrengine.xr.videocompressor.isoparser.boxes.iso14496.part12;

import com.xrengine.xr.videocompressor.isoparser.support.AbstractFullBox;

/**
 * Abstract Chunk Offset Box
 */
public abstract class ChunkOffsetBox extends AbstractFullBox {

    public ChunkOffsetBox(String type) {
        super(type);
    }

    public abstract long[] getChunkOffsets();

    public abstract void setChunkOffsets(long[] chunkOffsets);

    public String toString() {
        return this.getClass().getSimpleName() + "[entryCount=" + getChunkOffsets().length + "]";
    }

}
