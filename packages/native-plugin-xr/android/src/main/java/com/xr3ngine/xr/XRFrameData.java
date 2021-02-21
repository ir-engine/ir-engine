package com.xr3ngine.xr;

public class XRFrameData {
    public int currentFrame = 0;
    public Vector3 cameraPosition = new Vector3(0,0,0);
    public Quaternion cameraRotation = new Quaternion(1,0,0,0);
    public Vector3 stagePosition = new Vector3(0,0,0);
    public Quaternion stageRotation = new Quaternion(1,0,0,0);
}