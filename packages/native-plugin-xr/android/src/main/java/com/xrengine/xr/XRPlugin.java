package com.xrengine.xr;

import android.Manifest;
import android.app.FragmentManager;
import android.app.FragmentTransaction;
import android.content.ContentUris;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.graphics.Point;
import android.media.MediaMetadataRetriever;
import android.media.projection.MediaProjection;
import android.media.projection.MediaProjectionManager;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.DocumentsContract;
import android.provider.MediaStore;
import android.util.DisplayMetrics;
import android.util.Log;
import android.util.TypedValue;
import android.view.Display;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.widget.FrameLayout;
import android.widget.Toast;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.NativePlugin;

import com.getcapacitor.PluginResult;
import com.google.ar.core.Pose;
import com.google.ar.core.RecordingConfig;
import com.xrengine.xr.videocompressor.VideoCompress;
import com.xrengine.xr.watermark.WatermarkManager;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.net.URL;
import java.net.URLDecoder;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

import androidx.core.content.ContextCompat;

import static android.app.Activity.RESULT_OK;
import static android.content.Context.MEDIA_PROJECTION_SERVICE;
import static com.xrengine.xr.XRPlugin.SCREEN_RECORD_CODE;

import static com.xrengine.xr.MediaProjectionHelper.mediaProjection;
import static com.xrengine.xr.MediaProjectionHelper.data;

@NativePlugin(
        permissions = {
                Manifest.permission.CAMERA,
                Manifest.permission.RECORD_AUDIO,
                Manifest.permission.WRITE_EXTERNAL_STORAGE,
                Manifest.permission.READ_EXTERNAL_STORAGE,
                Manifest.permission.SYSTEM_ALERT_WINDOW
        },
        requestCodes = {
                CameraPreview.REQUEST_CAMERA_PERMISSION,
                SCREEN_RECORD_CODE
        }
)
public class XRPlugin extends Plugin {
    static final int REQUEST_CAMERA_PERMISSION = 1234;
    private static String VIDEO_FILE_PATH = "";
    private static String VIDEO_FILE_EXTENSION = ".mp4";

    private ARActivity fragment;
    private int containerViewId = 20;

    @PluginMethod()
    public void initialize(PluginCall call) {
        Log.d("XRPLUGIN", "Initializing");

        //Start the service to get screen recording permission
        Intent serviceIntent = new Intent(getContext(), MediaProjectionHelperService.class);
        serviceIntent.putExtra("inputExtra", "asdf");
        ContextCompat.startForegroundService(getContext(), serviceIntent);

        JSObject ret = new JSObject();
        ret.put("status", "native");
        call.success(ret);
    }

    @PluginMethod()
    public void handleTap(PluginCall call){
        saveCall(call);
        Toast t = Toast.makeText(getContext(), "Tapped", Toast.LENGTH_SHORT);
        t.show();

        fragment.handleTap(this);
    }

    @PluginMethod()
    public void playVideo(PluginCall call)
    {
        Log.d(TAG,"playvideo");
    }

    @PluginMethod()
    public void clearAnchors(PluginCall call){
        fragment.clearAnchors();
    }

    // CAMERA PREVIEW METHOD =====================================

    @PluginMethod()
    public void start(PluginCall call) {
        Log.d("XRPLUGIN", "Starting camera");
        saveCall(call);
        getBridge().getWebView().setBackgroundColor(Color.TRANSPARENT);

        if (hasRequiredPermissions()) {
            startCamera(call);
        } else {
            Log.d("XRPLUGIN", "Couldn't start camera");

            pluginRequestPermissions(new String[]{
                    Manifest.permission.CAMERA,
                    Manifest.permission.RECORD_AUDIO,
                    Manifest.permission.WRITE_EXTERNAL_STORAGE,
                    Manifest.permission.READ_EXTERNAL_STORAGE
            }, REQUEST_CAMERA_PERMISSION);
        }
    }

    @PluginMethod()
    public void stop(final PluginCall call) {
        bridge.getActivity().runOnUiThread(new Runnable() {
            @Override
            public void run() {
                FrameLayout containerView = getBridge().getActivity().findViewById(containerViewId);

                if (containerView != null) {
                    ((ViewGroup)getBridge().getWebView().getParent()).removeView(containerView);
                    getBridge().getWebView().setBackgroundColor(Color.WHITE);
                    FragmentManager fragmentManager = getActivity().getFragmentManager();
                    FragmentTransaction fragmentTransaction = fragmentManager.beginTransaction();
                    fragmentTransaction.remove(fragment);
                    fragmentTransaction.commit();
                    fragment = null;

                    call.success();
                } else {
                    call.reject("camera already stopped");
                }
            }
        });
    }

    @Override
    protected void handleRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.handleRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == REQUEST_CAMERA_PERMISSION) {
            boolean permissionsGranted = true;
            for (int grantResult: grantResults) {
                if (grantResult != 0) {
                    permissionsGranted = false;
                }
            }

            PluginCall savedCall = getSavedCall();
            if (permissionsGranted) {
                startCamera(savedCall);
            } else {
                savedCall.reject("permission failed");
            }
        }
    }

    private void startCamera(final PluginCall call) {
        Log.d("XRPLUGIN", "Start camera native function called");
        final Integer x = call.getInt("x", 0);
        final Integer y = call.getInt("y", 0);
        final Integer width = call.getInt("width", 0);
        final Integer height = call.getInt("height", 0);
        final Integer paddingBottom = call.getInt("paddingBottom", 0);
        final Boolean toBack = call.getBoolean("toBack", true);

        fragment = new ARActivity();

        getBridge().getActivity().runOnUiThread(new Runnable() {
            @Override
            public void run() {
                DisplayMetrics metrics = getBridge().getActivity().getResources().getDisplayMetrics();
                // offset
                int computedX = (int) TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, x, metrics);
                int computedY = (int) TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, y, metrics);

                // size
                int computedWidth;
                int computedHeight;
                int computedPaddingBottom;

                if(paddingBottom != 0) {
                    computedPaddingBottom = (int) TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, paddingBottom, metrics);
                } else {
                    computedPaddingBottom = 0;
                }

                if(width != 0) {
                    computedWidth = (int) TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, width, metrics);
                } else {
                    Display defaultDisplay = getBridge().getActivity().getWindowManager().getDefaultDisplay();
                    final Point size = new Point();
                    defaultDisplay.getSize(size);

                    computedWidth = (int) TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_PX, size.x, metrics);
                }

                if(height != 0) {
                    computedHeight = (int) TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, height, metrics) - computedPaddingBottom;
                } else {
                    Display defaultDisplay = getBridge().getActivity().getWindowManager().getDefaultDisplay();
                    final Point size = new Point();
                    defaultDisplay.getSize(size);

                    computedHeight = (int) TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_PX, size.y, metrics) - computedPaddingBottom;
                }

                fragment.setRect(computedX, computedY, computedWidth, computedHeight);

                FrameLayout containerView = getBridge().getActivity().findViewById(containerViewId);
                if(containerView == null){
                    containerView = new FrameLayout(getActivity().getApplicationContext());
                    containerView.setId(containerViewId);

                    ((ViewGroup)getBridge().getWebView().getParent()).addView(containerView);
                    if(toBack == true) {
                        getBridge().getWebView().getParent().bringChildToFront(getBridge().getWebView());
                    }

                    FragmentManager fragmentManager = getBridge().getActivity().getFragmentManager();
                    FragmentTransaction fragmentTransaction = fragmentManager.beginTransaction();
                    fragmentTransaction.add(containerView.getId(), fragment);
                    fragmentTransaction.commitAllowingStateLoss();

                    call.success();
                } else {
                    call.reject("camera already started");
                }
            }
        });
    }

    // VIDEO EDITOR METHODS =====================================================

    private static final String TAG = "VideoEditor";

    PluginCall videoEditorCallbackContext = null;
    @PluginMethod()
    public boolean startVideoEditor(PluginCall call) throws JSONException {
        Log.d(TAG, "execute method starting");

        String action = call.getString("action");
        JSObject args = call.getObject("args");
        videoEditorCallbackContext = call;
        if (action.equals("transcodeVideo")) {
            try {
                this.transcodeVideo(args);
            } catch (IOException e) {
                videoEditorCallbackContext.error(e.toString());
            }
            return true;
        } else if (action.equals("createThumbnail")) {
            try {
                this.createThumbnail(args);
            } catch (IOException e) {
                videoEditorCallbackContext.error(e.toString());
            }
            return true;
        } else if (action.equals("getVideoInfo")) {
            try {
                this.getVideoInfo(args);
            } catch (IOException e) {
                videoEditorCallbackContext.error(e.toString());
            }
            return true;
        }

        return false;
    }

    /**
     * transcodeVideo
     *
     * Transcodes a video
     *
     * ARGUMENTS
     * =========
     *
     * fileUri              - path to input video
     * outputFileName       - output file name
     * saveToLibrary        - save to gallery
     * deleteInputFile      - optionally remove input file
     * width                - width for the output video
     * height               - height for the output video
     * fps                  - fps the video
     * videoBitrate         - video bitrate for the output video in bits
     * duration             - max video duration (in seconds?)
     *
     * RESPONSE
     * ========
     *
     * outputFilePath - path to output file
     *
     */
    private void transcodeVideo(JSONObject options) throws JSONException, IOException {
        Log.d(TAG, "transcodeVideo firing");
        Log.d(TAG, "options: " + options.toString());

        final File inFile = this.resolveLocalFileSystemURI(options.getString("fileUri"));
        if (!inFile.exists()) {
            Log.d(TAG, "input file does not exist");
            videoEditorCallbackContext.error("input video does not exist.");
            return;
        }

        final String videoSrcPath = inFile.getAbsolutePath();
        final String outputFileName = options.optString(
                "outputFileName",
                new SimpleDateFormat("yyyyMMdd_HHmmss", Locale.ENGLISH).format(new Date())
        );

        final boolean deleteInputFile = options.optBoolean("deleteInputFile", false);
        final int width = options.optInt("width", 0);
        final int height = options.optInt("height", 0);
        final int fps = options.optInt("fps", 24);
        final int videoBitrate = options.optInt("videoBitrate", 1000000); // default to 1 megabit
        final long videoDuration = options.optLong("duration", 0) * 1000 * 1000;

        Log.d(TAG, "videoSrcPath: " + videoSrcPath);

        final String outputExtension = ".mp4";

        final Context appContext = getActivity().getApplicationContext();
        final PackageManager pm = appContext.getPackageManager();

        ApplicationInfo ai;
        try {
            ai = pm.getApplicationInfo(getActivity().getPackageName(), 0);
        } catch (final PackageManager.NameNotFoundException e) {
            ai = null;
        }
        final String appName = (String) (ai != null ? pm.getApplicationLabel(ai) : "Unknown");

        final boolean saveToLibrary = options.optBoolean("saveToLibrary", true);
        File mediaStorageDir;

        /*if (saveToLibrary) {
            mediaStorageDir = new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_MOVIES), appName);
        } else {
            mediaStorageDir = new File(appContext.getExternalFilesDir(null).getAbsolutePath() + "/Android/data/" + cordova.getActivity().getPackageName() + "/files/files/videos");
        }*/
        mediaStorageDir = new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_MOVIES), appName);

        if (!mediaStorageDir.exists()) {
            if (!mediaStorageDir.mkdirs()) {
                videoEditorCallbackContext.error("Can't access or make Movies directory");
                return;
            }
        }

        final String outputFilePath = new File(
                mediaStorageDir.getPath(),
                outputFileName + outputExtension
        ).getAbsolutePath();

        Log.d(TAG, "outputFilePath: " + outputFilePath);

        try {
            VideoCompress.compressVideoLow(videoSrcPath,
                    outputFilePath,
                    new VideoCompress.CompressListener() {
                        @Override
                        public void onStart() {
                            Log.d(TAG, "transcoding started");
                        }

                        @Override
                        public void onSuccess() {
                            File outFile = new File(outputFilePath);
                            if (!outFile.exists()) {
                                Log.d(TAG, "outputFile doesn't exist!");
                                videoEditorCallbackContext.error("an error ocurred during transcoding");
                                return;
                            }

                            // make the gallery display the new file if saving to library
                            if (saveToLibrary) {
                                Intent scanIntent = new Intent(Intent.ACTION_MEDIA_SCANNER_SCAN_FILE);
                                scanIntent.setData(Uri.fromFile(inFile));
                                scanIntent.setData(Uri.fromFile(outFile));
                                appContext.sendBroadcast(scanIntent);
                            }

                            if (deleteInputFile) {
                                inFile.delete();
                            }
                            JSObject data = new JSObject();
                            data.put("outputFilePath", outputFilePath);
                            videoEditorCallbackContext.success(data);
                        }

                        @Override
                        public void onFail() {
                            videoEditorCallbackContext.error("Erreur d'encodage");
                            Log.d(TAG, "transcode exception");
                        }

                        @Override
                        public void onProgress(float percent) {
                            Log.d(TAG, "transcode running " + percent);

                            JSONObject jsonObj = new JSONObject();
                            try {
                                jsonObj.put("progress", percent);
                            } catch (JSONException e) {
                                e.printStackTrace();
                            }

                            JSObject data = new JSObject();
                            data.put("outputFilePath", outputFilePath);
                            videoEditorCallbackContext.success(data);
                            // TODO: ADD EVENT
//                                    PluginResult progressResult = new PluginResult(PluginResult.Status.OK, jsonObj);
//                                    progressResult.setKeepCallback(true);
//                                    videoEditorCallbackContext.(progressResult);
                        }
                    }
            );
        } catch (Throwable e) {
            Log.d(TAG, "transcode exception ", e);
            videoEditorCallbackContext.error(e.toString());
        }
    }

    /**
     * createThumbnail
     *
     * Creates a thumbnail from the start of a video.
     *
     * ARGUMENTS
     * =========
     * fileUri        - input file path
     * outputFileName - output file name
     * atTime         - location in the video to create the thumbnail (in seconds)
     * width          - width for the thumbnail (optional)
     * height         - height for the thumbnail (optional)
     * quality        - quality of the thumbnail (optional, between 1 and 100)
     *
     * RESPONSE
     * ========
     *
     * outputFilePath - path to output file
     *
     */
    private void createThumbnail(JSONObject options) throws JSONException, IOException {
        Log.d(TAG, "createThumbnail firing");

        Log.d(TAG, "options: " + options.toString());

        String fileUri = options.getString("fileUri");
        if (!fileUri.startsWith("file:/")) {
            fileUri = "file:/" + fileUri;
        }

        File inFile = this.resolveLocalFileSystemURI(fileUri);
        if (!inFile.exists()) {
            Log.d(TAG, "input file does not exist");
            videoEditorCallbackContext.error("input video does not exist.");
            return;
        }
        final String srcVideoPath = inFile.getAbsolutePath();
        String outputFileName = options.optString(
                "outputFileName",
                new SimpleDateFormat("yyyyMMdd_HHmmss", Locale.ENGLISH).format(new Date())
        );

        final int quality = options.optInt("quality", 100);
        final int width = options.optInt("width", 0);
        final int height = options.optInt("height", 0);
        long atTimeOpt = options.optLong("atTime", 0);
        final long atTime = (atTimeOpt == 0) ? 0 : atTimeOpt * 1000000;

        final Context appContext = getActivity().getApplicationContext();
        PackageManager pm = appContext.getPackageManager();

        ApplicationInfo ai;
        try {
            ai = pm.getApplicationInfo(getActivity().getPackageName(), 0);
        } catch (final PackageManager.NameNotFoundException e) {
            ai = null;
        }
        final String appName = (String) (ai != null ? pm.getApplicationLabel(ai) : "Unknown");

        File externalFilesDir =  new File(appContext.getExternalFilesDir(null).getAbsolutePath() + "/Android/data/" + getActivity().getPackageName() + "/files/files/videos");

        if (!externalFilesDir.exists()) {
            if (!externalFilesDir.mkdirs()) {
                videoEditorCallbackContext.error("Can't access or make Movies directory");
                return;
            }
        }

        final File outputFile =  new File(
                externalFilesDir.getPath(),
                outputFileName + ".jpg"
        );
        final String outputFilePath = outputFile.getAbsolutePath();

        OutputStream outStream = null;

        try {
            MediaMetadataRetriever mmr = new MediaMetadataRetriever();
            mmr.setDataSource(srcVideoPath);

            Bitmap bitmap = mmr.getFrameAtTime(atTime);

            if (width > 0 || height > 0) {
                int videoWidth = bitmap.getWidth();
                int videoHeight = bitmap.getHeight();

                final Bitmap resizedBitmap = Bitmap.createScaledBitmap(bitmap, 480, 360, false);
                bitmap.recycle();
                bitmap = resizedBitmap;
            }

            outStream = new FileOutputStream(outputFile);
            bitmap.compress(Bitmap.CompressFormat.JPEG, quality, outStream);

            JSObject data = new JSObject();
            data.put("outputFilePath", outputFilePath);
            videoEditorCallbackContext.success(data);

        } catch (Throwable e) {
            if (outStream != null) {
                try {
                    outStream.close();
                } catch (IOException e1) {
                    e1.printStackTrace();
                }
            }

            Log.d(TAG, "exception on thumbnail creation", e);
            videoEditorCallbackContext.error(e.toString());
        }
    }

    /**
     * getVideoInfo
     *
     * Gets info on a video
     *
     * ARGUMENTS
     * =========
     *
     * fileUri:      - path to input video
     *
     * RESPONSE
     * ========
     *
     * width         - width of the video
     * height        - height of the video
     * orientation   - orientation of the video
     * duration      - duration of the video (in seconds)
     * size          - size of the video (in bytes)
     * bitrate       - bitrate of the video (in bits per second)
     *
     */
    private void getVideoInfo(JSONObject options) throws JSONException, IOException {
        Log.d(TAG, "getVideoInfo firing");
        Log.d(TAG, "options: " + options.toString());

        File inFile = this.resolveLocalFileSystemURI(options.getString("fileUri"));
        if (!inFile.exists()) {
            Log.d(TAG, "input file does not exist");
            videoEditorCallbackContext.error("input video does not exist.");
            return;
        }

        String videoSrcPath = inFile.getAbsolutePath();
        Log.d(TAG, "videoSrcPath: " + videoSrcPath);

        MediaMetadataRetriever mmr = new MediaMetadataRetriever();
        mmr.setDataSource(videoSrcPath);
        float videoWidth = Float.parseFloat(mmr.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_WIDTH));
        float videoHeight = Float.parseFloat(mmr.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_HEIGHT));

        String orientation;
        String mmrOrientation = mmr.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_ROTATION);
        Log.d(TAG, "mmrOrientation: " + mmrOrientation); // 0, 90, 180, or 270

        if (videoWidth < videoHeight) {
            if (mmrOrientation.equals("0") || mmrOrientation.equals("180")) {
                orientation = "portrait";
            } else {
                orientation = "landscape";
            }
        } else {
            if (mmrOrientation.equals("0") || mmrOrientation.equals("180")) {
                orientation = "landscape";
            } else {
                orientation = "portrait";
            }
        }

        double duration = Double.parseDouble(mmr.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION)) / 1000.0;
        long bitrate = Long.parseLong(mmr.extractMetadata(MediaMetadataRetriever.METADATA_KEY_BITRATE));

        JSObject response = new JSObject();
        response.put("width", videoWidth);
        response.put("height", videoHeight);
        response.put("orientation", orientation);
        response.put("duration", duration);
        response.put("size", inFile.length());
        response.put("bitrate", bitrate);

        videoEditorCallbackContext.success(response);
    }


    @SuppressWarnings("deprecation")
    private File resolveLocalFileSystemURI(String url) throws IOException, JSONException {
        String decoded = URLDecoder.decode(url, "UTF-8");

        File fp = null;

        // Handle the special case where you get an Android content:// uri.
        if (decoded.startsWith("content:")) {
            fp = new File(getPath(getActivity().getApplicationContext(), Uri.parse(decoded)));
        } else {
            // Test to see if this is a valid URL first
            @SuppressWarnings("unused")
            URL testUrl = new URL(decoded);

            if (decoded.startsWith("file://")) {
                int questionMark = decoded.indexOf("?");
                if (questionMark < 0) {
                    fp = new File(decoded.substring(7, decoded.length()));
                } else {
                    fp = new File(decoded.substring(7, questionMark));
                }
            } else if (decoded.startsWith("file:/")) {
                fp = new File(decoded.substring(6, decoded.length()));
            } else {
                fp = new File(decoded);
            }
        }

        if (!fp.exists()) {
            throw new FileNotFoundException( "" + url + " -> " + fp.getCanonicalPath());
        }
        if (!fp.canRead()) {
            throw new IOException("can't read file: " + url + " -> " + fp.getCanonicalPath());
        }
        return fp;
    }

    /**
     * Get a file path from a Uri. This will get the the path for Storage Access
     * Framework Documents, as well as the _data field for the MediaStore and
     * other file-based ContentProviders.
     *
     * @param context The context.
     * @param uri The Uri to query.
     * @author paulburke
     */
    public static String getPath(final Context context, final Uri uri) {


        // DocumentProvider
        if (DocumentsContract.isDocumentUri(context, uri)) {
            // ExternalStorageProvider
            if (isExternalStorageDocument(uri)) {
                final String docId = DocumentsContract.getDocumentId(uri);
                final String[] split = docId.split(":");
                final String type = split[0];

                if ("primary".equalsIgnoreCase(type)) {
                    return context.getExternalFilesDir(null) + "/" + split[1];
                }

                // TODO handle non-primary volumes
            }
            // DownloadsProvider
            else if (isDownloadsDocument(uri)) {

                final String id = DocumentsContract.getDocumentId(uri);
                final Uri contentUri = ContentUris.withAppendedId(
                        Uri.parse("content://downloads/public_downloads"), Long.valueOf(id));

                return getDataColumn(context, contentUri, null, null);
            }
            // MediaProvider
            else if (isMediaDocument(uri)) {
                final String docId = DocumentsContract.getDocumentId(uri);
                final String[] split = docId.split(":");
                final String type = split[0];

                Uri contentUri = null;
                if ("image".equals(type)) {
                    contentUri = MediaStore.Images.Media.EXTERNAL_CONTENT_URI;
                } else if ("video".equals(type)) {
                    contentUri = MediaStore.Video.Media.EXTERNAL_CONTENT_URI;
                } else if ("audio".equals(type)) {
                    contentUri = MediaStore.Audio.Media.EXTERNAL_CONTENT_URI;
                }

                final String selection = "_id=?";
                final String[] selectionArgs = new String[] {
                        split[1]
                };

                return getDataColumn(context, contentUri, selection, selectionArgs);
            }
        }
        // MediaStore (and general)
        else if ("content".equalsIgnoreCase(uri.getScheme())) {
            return getDataColumn(context, uri, null, null);
        }
        // File
        else if ("file".equalsIgnoreCase(uri.getScheme())) {
            return uri.getPath();
        }

        return null;
    }

    /**
     * Get the value of the data column for this Uri. This is useful for
     * MediaStore Uris, and other file-based ContentProviders.
     *
     * @param context The context.
     * @param uri The Uri to query.
     * @param selection (Optional) Filter used in the query.
     * @param selectionArgs (Optional) Selection arguments used in the query.
     * @return The value of the _data column, which is typically a file path.
     */
    public static String getDataColumn(Context context, Uri uri, String selection,
                                       String[] selectionArgs) {

        Cursor cursor = null;
        final String column = "_data";
        final String[] projection = {
                column
        };

        try {
            cursor = context.getContentResolver().query(uri, projection, selection, selectionArgs,
                    null);
            if (cursor != null && cursor.moveToFirst()) {
                final int column_index = cursor.getColumnIndexOrThrow(column);
                return cursor.getString(column_index);
            }
        } finally {
            if (cursor != null)
                cursor.close();
        }
        return null;
    }


    /**
     * @param uri The Uri to check.
     * @return Whether the Uri authority is ExternalStorageProvider.
     */
    public static boolean isExternalStorageDocument(Uri uri) {
        return "com.android.externalstorage.documents".equals(uri.getAuthority());
    }

    /**
     * @param uri The Uri to check.
     * @return Whether the Uri authority is DownloadsProvider.
     */
    public static boolean isDownloadsDocument(Uri uri) {
        return "com.android.providers.downloads.documents".equals(uri.getAuthority());
    }

    /**
     * @param uri The Uri to check.
     * @return Whether the Uri authority is MediaProvider.
     */
    public static boolean isMediaDocument(Uri uri) {
        return "com.android.providers.media.documents".equals(uri.getAuthority());
    }

    // Camera recording methods ===================================

    @PluginMethod
    public void getRecordingStatus(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("status", "success");
        call.success(ret);
    }

    @PluginMethod
    public void takePhoto(PluginCall call) {

    }

    @PluginMethod
    public void saveRecordingToVideo(PluginCall call) {

    }

    @PluginMethod
    public void shareMedia(PluginCall call) {

    }

    @PluginMethod
    public void showVideo(PluginCall call) {

    }

    @PluginMethod
    public void scrubTo(PluginCall call) {

    }

    @PluginMethod
    public void deleteVideo(PluginCall call) {

    }

    @PluginMethod
    public void saveVideoTo(PluginCall call) {

    }

//    // SCREEN RECORD =============================================

    public MediaProjectionManager mProjectionManager;

    public ScreenRecordService screenRecord;

    public MediaRecordService mediaRecord;

    public JSONObject options;

    public String filePath;

    public boolean isAudio;     // true: MediaRecord, false: ScreenRecord

    public int width, height, bitRate, dpi;

    public static final int PERMISSION_DENIED_ERROR = 20;
    public static final int RECORD_AUDIO= 0;

    protected final static String permission = Manifest.permission.RECORD_AUDIO;

    public final static int SCREEN_RECORD_CODE = 1337;

    PluginCall callbackContext;

    @PluginMethod
    public void startRecording(PluginCall callbackContext) {
        this.callbackContext = callbackContext;

        Log.d(TAG, callbackContext.toString());
        isAudio = callbackContext.getBoolean("isAudio");
        width = callbackContext.getInt("width");
        height = callbackContext.getInt("height");
        bitRate = callbackContext.getInt("bitRate");
        dpi = callbackContext.getInt("dpi");
        filePath = callbackContext.getString("filePath");


        if (screenRecord != null) {
            callbackContext.error("screenRecord service is running");
        }
        else if(data==null)
        {
            callbackContext.error("No permission to record video");
            Toast t = Toast.makeText(getContext(), "No permission to record video", Toast.LENGTH_SHORT);
            t.show();
        }
        else {
            saveCall(callbackContext);

            //mProjectionManager = (MediaProjectionManager) getActivity().getSystemService(MEDIA_PROJECTION_SERVICE);
            //Intent captureIntent = mProjectionManager.createScreenCaptureIntent();
            //startActivityForResult(this.callbackContext, captureIntent, SCREEN_RECORD_CODE);

            doStartRecording((Intent) data.clone());
        }
        Log.d(TAG, "CALLBACK CONTEXT:" + this.callbackContext);
        Log.d(TAG, "IS AUDIO:" + isAudio);

    }

    @PluginMethod
    public void stopRecording(PluginCall callbackContext) {

        if(screenRecord != null){

            Intent serviceIntent = new Intent(getContext(), MediaProjectionHelperService.class);
            getContext().stopService(serviceIntent);

            screenRecord.quit();
            screenRecord = null;
            final Context appContext = getActivity().getApplicationContext();
            final PackageManager pm = appContext.getPackageManager();

            ApplicationInfo ai;

            try {
                ai = pm.getApplicationInfo(getActivity().getPackageName(), 0);
            } catch (final PackageManager.NameNotFoundException e) {
                ai = null;
            }
            final String appName = (String) (ai != null ? pm.getApplicationLabel(ai) : "Unknown");

            File mediaStorageDir = new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_MOVIES), appName);

            callbackContext.success(new JSObject().put("result", "success").put("filePath", mediaStorageDir.getPath() + filePath));

            saveImageFromResourceId(R.drawable.watermark,mediaStorageDir.getPath(),"watermark.png");

            //WatermarkManager.addWatermark(mediaStorageDir.getPath() + filePath,mediaStorageDir.getPath()+"/watermark.png",true);
            //WatermarkManager.trimVideo(mediaStorageDir.getPath() + filePath,0,0,0,2,true);
            //show recored video
            fragment.showVideo(mediaStorageDir.getPath() + filePath,mediaStorageDir.getPath()+"/watermark.png");
        }else {
            callbackContext.error("no ScreenRecord in process XX");
        }



        Log.d(TAG, "CALLBACK CONTEXT:" + String.valueOf(this.callbackContext));

    }

    /**
     * mediaprojection
     */
    @Override
    public void handleOnActivityResult(int requestCode, int resultCode, Intent data) {
        PluginCall savedCall = getSavedCall();


        if (mediaProjection == null) {
            Log.e(TAG, "media projection is null");
            callbackContext.error("no ScreenRecord in process");
            return;
        }
        try {

            ApplicationInfo ai;
            final Context appContext = getActivity().getApplicationContext();
            final PackageManager pm = appContext.getPackageManager();

            try {
                ai = pm.getApplicationInfo(getActivity().getPackageName(), 0);
            } catch (final PackageManager.NameNotFoundException e) {
                ai = null;
            }
            final String appName = (String) (ai != null ? pm.getApplicationLabel(ai) : "Unknown");

            File mediaStorageDir = new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_MOVIES), appName);

            if (!mediaStorageDir.exists()) {
                   /*if (!mediaStorageDir.mkdirs()) {
                       videoEditorCallbackContext.error("Can't access or make Movies directory");
                       return;
                   }*/
            }
            File file = new File(
                    mediaStorageDir.getPath(),
                    filePath
            );
            Log.d(TAG, "*************** filePath: " + mediaStorageDir.getPath() + filePath);
            screenRecord = new ScreenRecordService(width, height, bitRate, dpi,
                    mediaProjection, file.getAbsolutePath());
            screenRecord.start();

            Log.d(TAG, "screenrecord service is running");
            PluginResult result = new PluginResult();
            result.put("status", data.getStringExtra("ScreenRecord file at" + file.getAbsolutePath()));
            savedCall.successCallback(result);

//               getActivity().moveTaskToBack(true);
        }catch (Exception e){
            e.printStackTrace();
            savedCall.errorCallback("Error in screenrecord");
        }
    }

    void doStartRecording(Intent data)
    {
        PluginCall savedCall = getSavedCall();

        if (mediaProjection == null) {
            Log.e(TAG, "media projection is null");
            callbackContext.error("no ScreenRecord in process");
            return;
        }
        try {

            ApplicationInfo ai;
            final Context appContext = getActivity().getApplicationContext();
            final PackageManager pm = appContext.getPackageManager();

            try {
                ai = pm.getApplicationInfo(getActivity().getPackageName(), 0);
            } catch (final PackageManager.NameNotFoundException e) {
                ai = null;
            }
            final String appName = (String) (ai != null ? pm.getApplicationLabel(ai) : "Unknown");

            File mediaStorageDir = new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_MOVIES), appName);

            if (!mediaStorageDir.exists()) {

                if (!mediaStorageDir.mkdirs()) {
                    videoEditorCallbackContext.error("Can't access or make Movies directory");
                    return;
                }
            }
            File file = new File(
                    mediaStorageDir.getPath(),
                    filePath
            );
            Log.d(TAG, "*************** filePath: " + mediaStorageDir.getPath() + filePath);
            screenRecord = new ScreenRecordService(width, height, bitRate, dpi,
                    mediaProjection, file.getAbsolutePath());
            screenRecord.start();

            Log.d(TAG, "screenrecord service is running");
            PluginResult result = new PluginResult();
            result.put("status", data.getStringExtra("ScreenRecord file at" + file.getAbsolutePath()));
            savedCall.successCallback(result);

//               getActivity().moveTaskToBack(true);
        }catch (Exception e){
            e.printStackTrace();
            savedCall.errorCallback("Error in screenrecord");
        }
    }

    public void sendPoseData(float[] cameraPose, float[] anchorPose) {
        JSObject ret = new JSObject();

        ret.put("placed", anchorPose != null);

        ret.put("cameraPositionX", cameraPose[0]);
        ret.put("cameraPositionY", cameraPose[1]);
        ret.put("cameraPositionZ", cameraPose[2]);
        ret.put("cameraRotationW", cameraPose[3]);
        ret.put("cameraRotationX", cameraPose[4]);
        ret.put("cameraRotationY", cameraPose[5]);
        ret.put("cameraRotationZ", cameraPose[6]);

        if(anchorPose != null) {
            ret.put("anchorPositionX", anchorPose[0]);
            ret.put("anchorPositionY", anchorPose[1]);
            ret.put("anchorPositionZ", anchorPose[2]);
            ret.put("anchorRotationW", anchorPose[3]);
            ret.put("anchorRotationX", anchorPose[4]);
            ret.put("anchorRotationY", anchorPose[5]);
            ret.put("anchorRotationZ", anchorPose[6]);
        }
        notifyListeners("poseDataReceived", ret);
    }

    public void receiveCameraIntrinsics(float[] focalLength, float[] principalPoint, int[] imageDimensions) {
        JSObject ret = new JSObject();
        ret.put("fX", focalLength[0]);
        ret.put("fY", focalLength[1]);
        ret.put("cX", principalPoint[0]);
        ret.put("cY", principalPoint[1]);
        ret.put("x", imageDimensions[0]);
        ret.put("y", imageDimensions[1]);
        notifyListeners("cameraIntrinsicsReceived", ret);
    }

    private void saveImageFromResourceId(int resourceId,String path,String name) {
        //TODO Change logo.png in drawable folder for watermark
        Bitmap bm = BitmapFactory.decodeResource(bridge.getActivity().getResources(), resourceId);
        String extStorageDirectory = path;//Environment.getExternalStorageDirectory().toString();
        File file = new File(extStorageDirectory, name);
        if (!file.exists()) {
            try {
                FileOutputStream outStream = new FileOutputStream(file);
                bm.compress(Bitmap.CompressFormat.PNG, 100, outStream);
                outStream.flush();
                outStream.close();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

}
