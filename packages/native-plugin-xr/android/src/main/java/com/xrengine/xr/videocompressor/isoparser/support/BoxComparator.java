package com.xrengine.xr.videocompressor.isoparser.support;

import com.xrengine.xr.videocompressor.isoparser.Box;
import com.xrengine.xr.videocompressor.isoparser.Container;
import com.xrengine.xr.videocompressor.isoparser.tools.Path;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.channels.Channels;
import java.util.Iterator;

/**
 * Compares boxes for testing purposes.
 */
public class BoxComparator {


    public static boolean isIgnore(Container ref, Box b, String[] ignores) {
        for (String ignore : ignores) {
            if (Path.isContained(ref, b, ignore)) {
                return true;
            }
        }
        return false;
    }


    public static void check(Container root1, Box b1, Container root2, Box b2, String... ignores) throws IOException {
        //System.err.println(b1.getType() + " - " + b2.getType());
        if (!isIgnore(root1, b1, ignores)) {
            //    System.err.println(b1.getType());
            if (b1 instanceof Container ^ !(b2 instanceof Container)) {
                if (b1 instanceof Container) {
                    check(root1, (Container) b1, root2, (Container) b2, ignores);
                } else {
                    checkBox(root1, b1, root2, b2, ignores);
                }
            } else {

            }
        }
    }

    private static void checkBox(Container root1, Box b1, Container root2, Box b2, String[] ignores) throws IOException {
        if (!isIgnore(root1, b1, ignores)) {
            ByteArrayOutputStream baos1 = new ByteArrayOutputStream();
            ByteArrayOutputStream baos2 = new ByteArrayOutputStream();

            b1.getBox(Channels.newChannel(baos1));
            b2.getBox(Channels.newChannel(baos2));

            baos1.close();
            baos2.close();
        }
    }

    public static void check(Container cb1, Container cb2, String... ignores) throws IOException {
        check(cb1, cb1, cb2, cb2, ignores);
    }


    public static void check(Container root1, Container cb1, Container root2, Container cb2, String... ignores) throws IOException {
        Iterator<Box> it1 = cb1.getBoxes().iterator();
        Iterator<Box> it2 = cb2.getBoxes().iterator();

        while (it1.hasNext() && it2.hasNext()) {
            Box b1 = it1.next();
            Box b2 = it2.next();

            check(root1, b1, root2, b2, ignores);
        }

    }


}
