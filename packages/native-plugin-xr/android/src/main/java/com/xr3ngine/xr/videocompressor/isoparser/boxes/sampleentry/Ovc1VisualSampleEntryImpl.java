package com.xr3ngine.xr.videocompressor.isoparser.boxes.sampleentry;

import com.xr3ngine.xr.videocompressor.isoparser.BoxParser;
import com.xr3ngine.xr.videocompressor.isoparser.tools.MemoryUtils;
import com.xr3ngine.xr.videocompressor.isoparser.tools.IsoTypeReader;
import com.xr3ngine.xr.videocompressor.isoparser.tools.IsoTypeWriter;

import java.io.IOException;
import java.nio.Buffer;
import java.nio.ByteBuffer;
import java.nio.channels.ReadableByteChannel;
import java.nio.channels.WritableByteChannel;

/**
 * <h1>4cc = "{@value #TYPE}"</h1>
 */
public class Ovc1VisualSampleEntryImpl extends AbstractSampleEntry {
    public static final String TYPE = "ovc1";
    private static final long MAX_RECORD_SIZE = 1_000_000;
    private byte[] vc1Content = new byte[0];

    public Ovc1VisualSampleEntryImpl() {
        super(TYPE);
    }

    public byte[] getVc1Content() {
        return vc1Content;
    }

    public void setVc1Content(byte[] vc1Content) {
        this.vc1Content = vc1Content;
    }

    @Override
    public void parse(ReadableByteChannel dataSource, ByteBuffer header, long contentSize, BoxParser boxParser) throws IOException {
        ByteBuffer byteBuffer = MemoryUtils.allocateByteBuffer(contentSize, MAX_RECORD_SIZE);
        dataSource.read(byteBuffer);
        ((Buffer)byteBuffer).position(6);
        dataReferenceIndex = IsoTypeReader.readUInt16(byteBuffer);
        vc1Content = new byte[byteBuffer.remaining()];
        byteBuffer.get(vc1Content);
    }


    @Override
    public void getBox(WritableByteChannel writableByteChannel) throws IOException {
        writableByteChannel.write(getHeader());
        ByteBuffer byteBuffer = ByteBuffer.allocate(8);
        ((Buffer)byteBuffer).position(6);
        IsoTypeWriter.writeUInt16(byteBuffer, dataReferenceIndex);
        writableByteChannel.write((ByteBuffer) ((Buffer)byteBuffer).rewind());
        writableByteChannel.write(ByteBuffer.wrap(vc1Content));
    }

    @Override
    public long getSize() {
        long header = (largeBox || (vc1Content.length + 16) >= (1L << 32)) ? 16 : 8;
        return header + vc1Content.length + 8;
    }

}
