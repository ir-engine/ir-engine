package com.xrengine.xr.videocompressor.isoparser.boxes.iso14496.part12;


import com.xrengine.xr.videocompressor.isoparser.BoxParser;
import com.xrengine.xr.videocompressor.isoparser.boxes.sampleentry.AbstractSampleEntry;
import com.xrengine.xr.videocompressor.isoparser.tools.IsoTypeReader;
import com.xrengine.xr.videocompressor.isoparser.tools.IsoTypeWriter;
import com.xrengine.xr.videocompressor.isoparser.tools.MemoryUtils;

import java.io.IOException;
import java.nio.Buffer;
import java.nio.ByteBuffer;
import java.nio.channels.ReadableByteChannel;
import java.nio.channels.WritableByteChannel;

public class HintSampleEntry extends AbstractSampleEntry {
    private final long MAX_RECORD_SIZE = 1_000_000;
    protected byte[] data;

    public HintSampleEntry(String type) {
        super(type);
    }

    @Override
    public void parse(ReadableByteChannel dataSource, ByteBuffer header, long contentSize, BoxParser boxParser) throws IOException {
        ByteBuffer b1 = ByteBuffer.allocate(8);
        dataSource.read(b1);
        ((Buffer)b1).position(6);
        dataReferenceIndex = IsoTypeReader.readUInt16(b1);
        data = MemoryUtils.allocateByteArray(contentSize - 8, MAX_RECORD_SIZE);
        dataSource.read(ByteBuffer.wrap(data));
    }

    @Override
    public void getBox(WritableByteChannel writableByteChannel) throws IOException {
        writableByteChannel.write(getHeader());

        ByteBuffer byteBuffer = ByteBuffer.allocate(8);
        ((Buffer)byteBuffer).position(6);
        IsoTypeWriter.writeUInt16(byteBuffer, dataReferenceIndex);
        ((Buffer)byteBuffer).rewind();
        writableByteChannel.write(byteBuffer);
        writableByteChannel.write(ByteBuffer.wrap(data));
    }

    public byte[] getData() {
        return data;
    }

    public void setData(byte[] data) {
        this.data = data;
    }


    @Override
    public long getSize() {
        long s = 8 + data.length;
        return s + ((largeBox || (s + 8) >= (1L << 32)) ? 16 : 8);
    }
}
