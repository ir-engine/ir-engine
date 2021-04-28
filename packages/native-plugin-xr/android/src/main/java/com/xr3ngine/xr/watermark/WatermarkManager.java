package com.xr3ngine.xr.watermark;

import android.util.Log;

import com.arthenica.mobileffmpeg.ExecuteCallback;
import com.arthenica.mobileffmpeg.FFmpeg;
import com.arthenica.mobileffmpeg.Config;

import java.io.File;

import static com.arthenica.mobileffmpeg.Config.RETURN_CODE_CANCEL;
import static com.arthenica.mobileffmpeg.Config.RETURN_CODE_SUCCESS;


public class WatermarkManager
{

    public static WMStatus wmStatusInterface;
    /**
     * Adds watermark to given video file and saves as
     * givenname_w
     * @param videoFilePath path to input video file
     * @param watermarkFilePath path to watermark file
     * @param overwrite boolean to over write existing file
     */
    public static void addWatermark(String videoFilePath, String watermarkFilePath,boolean overwrite)
    {
        //Insert a transparent PNG logo in the bottom left corner of the input, using the ffmpeg tool with the -filter_complex option
        //ffmpeg -i input -i logo -filter_complex 'overlay=10:main_h-overlay_h-10' output

        String[] tokens = videoFilePath.split("\\.");
        String outputFilePath="";
        if(tokens.length>1)
        {
            outputFilePath= tokens[0]+"_w."+tokens[1];
        }

        String command = "";
        if(overwrite)
            command="-i "+videoFilePath+" -i "+watermarkFilePath+" -filter_complex 'overlay=10:main_h-overlay_h-10' -y "+outputFilePath;
        else
            command = "-i "+videoFilePath+" -i "+watermarkFilePath+" -filter_complex 'overlay=10:main_h-overlay_h-10' "+outputFilePath;

        long executionId = FFmpeg.executeAsync("-i "+videoFilePath+" -i "+watermarkFilePath+" -filter_complex 'overlay=10:main_h-overlay_h-10' "+outputFilePath, new ExecuteCallback()
        {

            @Override
            public void apply(final long executionId, final int returnCode) {

                wmStatusInterface.watermarkStatus(returnCode);

                if (returnCode == RETURN_CODE_SUCCESS) {
                    Log.i(Config.TAG, "Async command execution completed successfully.");
                } else if (returnCode == RETURN_CODE_CANCEL) {
                    Log.i(Config.TAG, "Async command execution cancelled by user.");
                } else {
                    Log.i(Config.TAG, String.format("Async command execution failed with returnCode=%d.", returnCode));
                }
            }
        });
    }


    /**
     * Adds watermark to given video file and saves as
     * givenname_w
     * @param ipVideoFilePath path to input video file
*      @param opVideoFilePath path to output video file
     * @param watermarkFilePath path to watermark file
     * @param overwrite boolean to over write existing file
     */
    public static void addWatermark(String ipVideoFilePath,String opVideoFilePath, String watermarkFilePath,boolean overwrite)
    {
        //Insert a transparent PNG logo in the bottom left corner of the input, using the ffmpeg tool with the -filter_complex option
        //ffmpeg -i input -i logo -filter_complex 'overlay=10:main_h-overlay_h-10' output

        String outputFilePath=opVideoFilePath;


        String command = "";
        if(overwrite)
            command="-i "+ipVideoFilePath+" -i "+watermarkFilePath+" -filter_complex 'overlay=5:main_h-overlay_h' -y "+outputFilePath;
        else
            command = "-i "+ipVideoFilePath+" -i "+watermarkFilePath+" -filter_complex 'overlay=1:main_h-overlay_h-1' "+outputFilePath;

        long executionId = FFmpeg.executeAsync("-i "+ipVideoFilePath+" -i "+watermarkFilePath+" -filter_complex 'overlay=10:main_h-overlay_h-10' "+outputFilePath, new ExecuteCallback()
        {

            @Override
            public void apply(final long executionId, final int returnCode) {

                wmStatusInterface.watermarkStatus(returnCode);

                if (returnCode == RETURN_CODE_SUCCESS) {
                    Log.i(Config.TAG, "Async command execution completed successfully.");
                } else if (returnCode == RETURN_CODE_CANCEL) {
                    Log.i(Config.TAG, "Async command execution cancelled by user.");
                } else {
                    Log.i(Config.TAG, String.format("Async command execution failed with returnCode=%d.", returnCode));
                }
            }
        });
    }

    /*
    Trims the given video from time stamp and duration
    * @param videoFilePath path to video file
    * @param h hours of time stamp
    * @param m minutes of time stamp
    * @param s seconds of time stamp
    * @duration duration from time stamp to trime
    * @param boolean to over write existing file
    * */
    public static void trimVideo(String videoFilePath,int h,int m,int s,int duration,boolean overwrite)
    {
        //-i input.mkv -c:av copy -ss 00:01:00 -t 10 output.mkv

        String[] tokens = videoFilePath.split("\\.");
        String outputFilePath="";
        if(tokens.length>1)
        {
            outputFilePath= tokens[0]+"_t."+tokens[1];
        }

        String command = "";
        if(overwrite)
        {
            command = "-i "+videoFilePath+" -c:a copy -c:v copy -ss " +h+":"+m+":"+s+" -t "+duration+" -y "+outputFilePath;
        }
        else
            command = "-i "+videoFilePath+" -c:a copy -c:v copy -ss " +h+":"+m+":"+s+" -t "+duration+" "+outputFilePath;

        long executionId = FFmpeg.executeAsync("-i "+videoFilePath+" -c:a copy -c:v copy -ss " +h+":"+m+":"+s+" -t "+duration+" "+outputFilePath, new ExecuteCallback()
        {

            @Override
            public void apply(final long executionId, final int returnCode) {
                wmStatusInterface.trimStatus(returnCode);
                if (returnCode == RETURN_CODE_SUCCESS) {
                    Log.i(Config.TAG, "Async command execution completed successfully.");
                } else if (returnCode == RETURN_CODE_CANCEL) {
                    Log.i(Config.TAG, "Async command execution cancelled by user.");
                } else {
                    Log.i(Config.TAG, String.format("Async command execution failed with returnCode=%d.", returnCode));
                }
            }
        });
    }

    /*
    Trims the given video from time stamp and duration
    * @param videoFilePath path to video file
    * @param trimmedvideoPath path to trimmed video file
    * @param h hours of time stamp
    * @param m minutes of time stamp
    * @param s seconds of time stamp
    * @duration duration from time stamp to trime
    * @param boolean to over write existing file
    * */
    public static void trimVideo(String videoFilePath,String trimmedVideoPath,int h,int m,int s,int duration,boolean overwrite)
    {
        //-i input.mkv -c:av copy -ss 00:01:00 -t 10 output.mkv

        String[] tokens = videoFilePath.split("\\.");
        String outputFilePath=trimmedVideoPath;


        String command = "";
        if(overwrite)
        {
            command = "-i "+videoFilePath+" -c:a copy -c:v copy -ss " +h+":"+m+":"+s+" -t "+duration+" -y "+outputFilePath;
        }
        else
            command = "-i "+videoFilePath+" -c:a copy -c:v copy -ss " +h+":"+m+":"+s+" -t "+duration+" "+outputFilePath;

        long executionId = FFmpeg.executeAsync("-i "+videoFilePath+" -c:a copy -c:v copy -ss " +h+":"+m+":"+s+" -t "+duration+" "+outputFilePath, new ExecuteCallback()
        {

            @Override
            public void apply(final long executionId, final int returnCode) {
                wmStatusInterface.trimStatus(returnCode);
                if (returnCode == RETURN_CODE_SUCCESS) {
                    Log.i(Config.TAG, "Async command execution completed successfully.");
                } else if (returnCode == RETURN_CODE_CANCEL) {
                    Log.i(Config.TAG, "Async command execution cancelled by user.");
                } else {
                    Log.i(Config.TAG, String.format("Async command execution failed with returnCode=%d.", returnCode));
                }
            }
        });
    }

    /*
    Interface to let status of video operations
    * */
    public interface WMStatus
    {
        void watermarkStatus(int code);
        void trimStatus(int code);
    }
}
