package com.xr3ngine.xr;

import com.getcapacitor.JSObject;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;

import android.content.Intent;

@NativePlugin
public class XRPlugin extends Plugin {
    static final int REQUEST_CAMERA_PERMISSION = 1234;

    private boolean xrIsEnabled = false;
    private boolean recordingIsEnabled = false;
    private XRFrameData currentXrFrameData = new XRFrameData();

    @PluginMethod
    public void initialize(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("status", "success");
        call.success(ret);
    }

    @PluginMethod()
    public void start(PluginCall call) {
        saveCall(call);

        if (hasRequiredPermissions()) {
            startCamera(call);
        } else {
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

    @PluginMethod
    public void startXR(PluginCall call) {

//        Intent intent = new Intent(getContext(), XRActivity.class);
//        getActivity().startActivity(intent);

        JSObject ret = new JSObject();
        ret.put("status", "success");
        call.success(ret);
    }

    @PluginMethod
    public void stopXR(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("status", "success");
        call.success(ret);
    }

    @PluginMethod
    public void getXRDataForFrame(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("data", "test");
        call.success(ret);
    }

    @PluginMethod
    public void startRecording(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("status", "success");
        call.success(ret);
    }

    @PluginMethod
    public void stopRecording(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("status", "success");
        call.success(ret);
    }

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

    }w

    @PluginMethod
    public void deleteVideo(PluginCall call) {

    }

    @PluginMethod
    public void saveVideoTo(PluginCall call) {

    }

    // ARCORE =================================================


	public boolean startXR(final String action) {
            Intent intent = new Intent(getContext(), XRActivity.class);
            getActivity().startActivity(intent);
		return true;
	}
//
//    // SCREEN RECORD =============================================
//
//     public final static String TAG = "ScreenRecord";
//
//    public MediaProjectionManager mProjectionManager;
//
//    public ScreenRecordService screenRecord;
//
//    public MediaRecordService mediaRecord;
//
//    public CallbackContext callbackContext;
//
//    public JSONObject options;
//
//    public String filePath;
//
//    public boolean isAudio;     // true: MediaRecord, false: ScreenRecord
//
//    public int width, height, bitRate, dpi;
//
//    public static final int PERMISSION_DENIED_ERROR = 20;
//    public static final int RECORD_AUDIO= 0;
//
//    protected final static String permission = Manifest.permission.RECORD_AUDIO;
//
//    public final static int SCREEN_RECORD_CODE = 0;
//
//    @Override
//    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
//        this.callbackContext = callbackContext;
//        if (action.equals("startRecord")) {
//            options = args.getJSONObject(0);
//            Log.d(TAG, options.toString());
//            isAudio = options.getBoolean("isAudio");
//            width = options.getInt("width");
//            height = options.getInt("height");
//            bitRate = options.getInt("bitRate");
//            dpi = options.getInt("dpi");
//            filePath = args.getString(1);
//            this.startRecord(callbackContext);
//            return true;
//        }else if (action.equals("stopRecord")) {
//            this.stopRecord(callbackContext);
//            return true;
//        }
//        return false;
//    }
//
//    private void startRecord(CallbackContext callbackContext) {
//        if (screenRecord != null) {
//            callbackContext.error("screenRecord service is running");
//        } else {
//            if(cordova != null) {
//                try {
//                    callScreenRecord();
//                }catch(IllegalArgumentException e) {
//                    callbackContext.error("Illegal Argument Exception");
//                    PluginResult r = new PluginResult(PluginResult.Status.ERROR);
//                    callbackContext.sendPluginResult(r);
//                }
//            }
//        }
//    }
//
//    private void stopRecord(CallbackContext callbackContext) {
//        if(isAudio){
//            if(mediaRecord != null){
//                mediaRecord.release();
//                mediaRecord = null;
//                callbackContext.success("ScreenRecord finish.");
//            }else {
//                callbackContext.error("no ScreenRecord in process");
//            }
//        }else {
//            if(screenRecord != null){
//                screenRecord.quit();
//                screenRecord = null;
//                callbackContext.success("ScreenRecord finish.");
//            }else {
//                callbackContext.error("no ScreenRecord in process");
//            }
//        }
//    }
//
//    private void callScreenRecord() {
//        mProjectionManager = (MediaProjectionManager)this.cordova.getActivity().getSystemService("media_projection");
//        Intent captureIntent = mProjectionManager.createScreenCaptureIntent();
//        cordova.startActivityForResult(this, captureIntent, SCREEN_RECORD_CODE);
//    }
//
//    /**
//     * mediaprojection回调
//     */
//    @Override
//    public void onActivityResult(int requestCode, int resultCode, Intent data) {
//
//        MediaProjection mediaProjection = mProjectionManager.getMediaProjection(resultCode, data);
//        if (mediaProjection == null) {
//            Log.e(TAG, "media projection is null");
//            callbackContext.error("no ScreenRecord in process");
//            return;
//        }
//        if(requestCode == 0){
//           try {
//               File file = new File(filePath);
//
//               if(isAudio){
//                mediaRecord = new MediaRecordService(width, height, bitRate, dpi, mediaProjection, file.getAbsolutePath());
//                mediaRecord.start();
//               }else {
//                screenRecord = new ScreenRecordService(width, height, bitRate, dpi,
//                mediaProjection, file.getAbsolutePath());
//                screenRecord.start();
//               }
//
//               Log.d(TAG, "screenrecord service is running");
//               this.callbackContext.success("screenrecord service is running");
//               cordova.getActivity().moveTaskToBack(true);
//           }catch (Exception e){
//              e.printStackTrace();
//          }
//      }
//  }

}
