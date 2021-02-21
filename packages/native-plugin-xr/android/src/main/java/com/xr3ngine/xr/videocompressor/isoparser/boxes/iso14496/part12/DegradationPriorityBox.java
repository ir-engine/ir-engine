package com.xr3ngine.xr.videocompressor.isoparser.boxes.iso14496.part12;

import com.xr3ngine.xr.videocompressor.isoparser.support.AbstractFullBox;
import com.xr3ngine.xr.videocompressor.isoparser.tools.IsoTypeReader;
import com.xr3ngine.xr.videocompressor.isoparser.tools.IsoTypeWriter;

import java.nio.ByteBuffer;

public class DegradationPriorityBox extends AbstractFullBox {
    int[] priorities = new int[0];

    public DegradationPriorityBox() {
        super("stdp");
    }

    @Override
    protected long getContentSize() {
        return 4 + priorities.length * 2;
    }

    @Override
    protected void getContent(ByteBuffer byteBuffer) {
        writeVersionAndFlags(byteBuffer);
        for (int priority : priorities) {
            IsoTypeWriter.writeUInt16(byteBuffer, priority);
        }
    }

    @Override
    protected void _parseDetails(ByteBuffer content) {
        parseVersionAndFlags(content);
        priorities = new int[content.remaining() / 2];
        for (int i = 0; i < priorities.length; i++) {
            priorities[i] = IsoTypeReader.readUInt16(content);
        }
    }

    public int[] getPriorities() {
        return priorities;
    }

    public void setPriorities(int[] priorities) {
        this.priorities = priorities;
    }

    /*
    aligned(8) class DegradationPriorityBox
 extends FullBox(‘stdp’, version = 0, 0) {
int i;
 for (i=0; i < sample_count; i++) {
unsigned int(16) priority;
}
}
     */

}
