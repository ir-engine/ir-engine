---
title: "Video Conversion and Caching"
linkTitle: "Video Conversion and Caching"
date: 2017-01-05
description: >
  Downloading, converting, and caching videos from an external URL
---


## Structure

XRChat can download and convert videos hosted on external sites into an easily-streamable DASH format and cache them
on a storage provider you control, such as an S3 bucket in AWS.

The conversion endpoint will download the video, run it through ffmpeg to turn it into 1080p/s at a maximum bitrate of
7 Mbps using the x264 codec, and then output a DASH manifest.mpd file pointing to related chunks of the video, as well
as .m3u8 files for playing on Apple devices. These will all be stored in a folder in your storage provider.

### Public Videos 
If the files are marked as publicly available (currently the default state), they will be stored in 
```<storage_provider_path>/public/<video_source_name>/<source_video_id>/video/<filename>```. For example, if caching a 
video from Youtube whose URL is https://www.youtube.com/watch?v=0XrH2WO1Mzs, the path for the manifest.mpd file would be
```https://s3.amazonaws.com/<bucket_name>/public/youtube/0XrH2WO1Mzs/video/manifest.mpd```; all of its associated files 
would be located alongside it in the /video folder.

### Private Videos
If the files are not public, the UUID identifying the manifest.mpd file will be used to encompass all of the generated
files on the storage provider. The files will be located at ```<UUID>/video/<filename>```. For example, a cached
non-public video's manifest.mpd could be found at 
```https://s3.amazonaws.com/<bucket_name>/cebac911-8ef9-11ea-8abe-093e24568d56/video/manifest.mpd```; all of its
associated files would be located alongside it in the /video folder. 

### Thumbnails
A thumbnail can be provided via a URL when calling the API. If no URL is provided, then the conversion backend will
obtain the default thumbnail from the provider source and use that instead. In either case, the thumbnail will be
located in the /image folder alongside the /video folder, and will be titled ```thumbnail.<extension>```
To use the public example above, if the manifest.mpd file is located at 
```https://s3.amazonaws.com/<bucket_name>/public/youtube/0XrH2WO1Mzs/video/manifest.mpd```, the thumbnail would be at
```https://s3.amazonaws.com/<bucket_name>/public/youtube/0XrH2WO1Mzs/image/thumbnail.jpg```

### Attribution
If the 'creator' field is specified, an 'attribution' entity will be created that is referenced by the database entry
for the manifest.mpd file. The attribution will have the name specified in 'creator' as well as the original URL of the
video.

### Resulting static-resources
Many files will be generated from the conversion process. They will all be referenced in the database as a
'static-resource'; a cached video may have several dozen associated static-resources.

The manifest.mpd file is the main point of entry. All other files generated will reference this static-resource as their
parent; this is the only file that does not have a parent. 
This database entry will have the ```mime_type``` 'application/dash+xml'.

All of the .m4s chunks that manifest.mpd references will have the ```mime_type``` 'video/iso.segment'.

The .m3u8 files for Apple playback will have the ```mime_type``` 'application/x-mpegURL'.

All of the above file types will have the ```type``` 'video' to indicate that they are associated with video playback.

The thumbnail file will have whatever ```mime_type``` the image is of, e.g. 'image/jpg', 'image/png', etc. 
Thumbnails will that the ```type``` of 'image'.

## API

The path for creating cached videos is /video. All of the files generated from this process are of type 
'static-resource', so to retrieve/update/delete the resulting files, one will need to interact with them through the 
/static-resource endpoint.

### Create a Cached Video

```POST /video```

A JSON body will contain information about the video. This endpoint accepts arrays and can
process multiple videos simultaneously.

#### Fields

##### name (string)[required]

The name of the video.

##### url (string)[required]

The URL from which to download the video.

##### description (string)
A longer description of the video. 

##### metadata (object)
Additional information about the video. None of the sub-fields are explicitly specified in the schema, but some that
the front-end client can use are listed here:

###### thumbnail_url (string)
A URL from which to get and cache a thumbnail for this video. If not specified, a thumbnail will be retrieved from 
the video provider source.

###### rating (string)
A content rating for the video, e.g. 'All', 'Teen',  'Youth', etc. Does not have to follow any established rating system.

###### categories (array[string])
An array of categories associated with this video. Categories do not have to follow any established system.

###### runtime (string)
The length of the video in hours:minutes:seconds

##### creator (string)
The person or entity that created/claims ownership over the video. An 'attribution' entity will be created from this
value.

### Example Post Body

```
[
	{
		"name": "Example Video #1",
		"url": "https://www.youtube.com/watch?v=AbCDefg",
		"description": "Learn about examples in this thrilling video",
		"metadata": {
			"thumbnail_url": "https://hosting-site.com/1234/image.png",
			"rating": "Teen",
			"categories": [
				"Category 1",
				"Category C"
			],
			"runtime": "3:45"
		},
		"creator": "The Example Channel"
	},
	{
		"name": "Another Example",
		"url": "https://www.youtube.com/watch?v=1j4_37bh",
		"description": "Even more thrilling example footage",
		"metadata": {
			"rating": "All",
			"categories": [
				"Category 1"
			],
			"runtime": "5:08"
		},
		"creator": "Steve Jones"
	}
]
```

As mentioned earlier, this endpoint can accept an array of JSON objects to do a multi-post. You can also pass it one
JSON object at a time if you'd prefer; you do not have to post an array.

### Find Cached Videos

```GET /static-resource``` 

As mentioned in 'Resulting static-resources', the database entries created from caching a video are all 
'static-resources'. You cannot do a GET on /video, but instead must interact with the API using the /static-resource
endpoint.

As mentioned earlier, the database entry for the manifest.mpd file is considered the master entry for the cached video.
Adding the query '?mime_type=application/dash%2bxml' to all GETs will limit the results to just the important ones, e.g.
```GET /static-resource?mime_type=application/dash%2bxml``` will retrieve all of the public manifest.mpd entries.

#### Fields
The following static-resource fields will be returned:

##### id (string)
The UUID of the static-resource.

##### name (string)
The name of the video.

##### description (string)
A description of the video.

##### url (string)
The URL of the file in XRChat's storage cache. This will NOT be the original URL of where the video was downloaded from.

##### mime_type (string)
The mime_type of the file. For the manifest.mpd, this will be 'application/dash+xml'. For the associated chunk .m4s
files, this will be 'video/iso.segment'. For the .m3u8 files, this will be 'application/x-mpegURL'.

##### metadata (string)
This will be a stringified form of the JSON object. Run JSON.parse(), or the equivalent in the language you're using,
to get the metadata object.

##### createdAt (string)
The datetime at which the static-resource was created.

##### updatedAt (string)
The datetime at which the static-resource was last modified.

##### type (string)
The general type of the object to which the static-resource refers. For cached videos, this will be 'video' regardless
of the mime_type; the associated thumbnail will be of type 'image'.

##### attributionId (string)
The UUID of the attribution of this video. Will be null if no 'creator' was passed during creation.

##### userId (string)
The UUID of the User that owns this cached video. Will be null if it's a public video.

##### parentResourceId (string)
The UUID of the parent static-resource represeting the manifest.mpd file for this cached video. Will be null for the 
manifest.mpd static-resource, as it is the 'master' resource.

##### attribution (object)
The associated attribution for the video. Will be null if no 'creator' was passed during creation.

### Get a single Cached Video

```GET /static-resource/<UUID>``` 

As mentioned in 'Resulting static-resources', the database entries created from caching a video are all 
'static-resources'. You cannot do a GET on /video/<UUID>, but instead must interact with the API using the 
/static-resource endpoint.

#### Fields
The following static-resource fields will be returned:

##### id (string)
The UUID of the static-resource.

##### name (string)
The name of the video.

##### description (string)
A description of the video.

##### url (string)
The URL of the file in XRChat's storage cache. This will NOT be the original URL of where the video was downloaded from.

##### mime_type (string)
The mime_type of the file. For the manifest.mpd, this will be 'application/dash+xml'. For the associated chunk .m4s
files, this will be 'video/iso.segment'. For the .m3u8 files, this will be 'application/x-mpegURL'.

##### metadata (string)
This will be a stringified form of the JSON object. Run JSON.parse(), or the equivalent in the language you're using,
to get the metadata object.

##### createdAt (string)
The datetime at which the static-resource was created.

##### updatedAt (string)
The datetime at which the static-resource was last modified.

##### type (string)
The general type of the object to which the static-resource refers. For cached videos, this will be 'video' regardless
of the mime_type; the associated thumbnail will be of type 'image'.

##### attributionId (string)
The UUID of the attribution of this video. Will be null if no 'creator' was passed during creation.

##### userId (string)
The UUID of the User that owns this cached video. Will be null if it's a public video.

##### parentResourceId (string)
The UUID of the parent static-resource represeting the manifest.mpd file for this cached video. Will be null for the 
manifest.mpd static-resource, as it is the 'master' resource.

### Patch Cached Video

```PATCH /static-resource/<UUID>```

As mentioned in 'Resulting static-resources', the database entries created from caching a video are all 
'static-resources'. You cannot do a PATCH on /video, but instead must interact with the API using the /static-resource
endpoint.

To update specific fields on a static-resource, make a PATCH to /static-resource/<the UUID of the resource>. As this is
 a PATCH, you only need to include the fields you want to change. Updating a manifest.mpd resource will not propagate 
 changes to any children of that resource, though since all information such as metadata, name, description, 
 attribution, etc. should be read off of the 'master' static-resource, there's no need to update all of its children 
 anyway.

**NOTE ON PATCHING METADATA**
The metadata field is stored in SQL as a JSON field, meaning as stringified JSON. If you are patching a subfield in
there, you should make sure to set every subfield that is remaining the same, as well.

If you wanted to change the thumbnail_url subfield in 
 
 ```
 {
     "metadata": {
        "thumbnail_url": "https://some-url.com/image.jpg",
        "rating": "All"
     }
 }
 ```
you should send the following body

```
{
     "metadata": {
        "thumbnail_url": "https://some-new-url.com/image.png",
        "rating": "All"
     }
}
``` 
and NOT

```
{
     "metadata": {
        "thumbnail_url": "https://this-is-incorrect.com/image.png"
     }
}
```

The latter would result in the loss of the 'rating' subfield (and any other subfields that weren't explicitly defined).
 
 #### Fields
 The following static-resource fields will be returned:
 
 ##### id (string)
 The UUID of the static-resource.
 
 ##### name (string)
 The name of the video.
 
 ##### description (string)
 A description of the video.
 
 ##### url (string)
 The URL of the file in XRChat's storage cache. This will NOT be the original URL of where the video was downloaded from.
 
 ##### mime_type (string)
 The mime_type of the file. For the manifest.mpd, this will be 'application/dash+xml'. For the associated chunk .m4s
 files, this will be 'video/iso.segment'. For the .m3u8 files, this will be 'application/x-mpegURL'.
 
 ##### metadata (string)
 This will be a stringified form of the JSON object. Run JSON.parse(), or the equivalent in the language you're using,
 to get the metadata object.
 
 ##### createdAt (string)
 The datetime at which the static-resource was created.
 
 ##### updatedAt (string)
 The datetime at which the static-resource was last modified.
 
 ##### type (string)
 The general type of the object to which the static-resource refers. For cached videos, this will be 'video' regardless
 of the mime_type; the associated thumbnail will be of type 'image'.
 
 ##### attributionId (string)
 The UUID of the attribution of this video. Will be null if no 'creator' was passed during creation.
 
 ##### userId (string)
 The UUID of the User that owns this cached video. Will be null if it's a public video.
 
 ##### parentResourceId (string)
 The UUID of the parent static-resource representing the manifest.mpd file for this cached video. Will be null for the 
 manifest.mpd static-resource, as it is the 'master' resource.
 
 ### PUT Cached Video
 
 ```PUT /static-resource/<UUID>```
 
 As mentioned in 'Resulting static-resources', the database entries created from caching a video are all 
 'static-resources'. You cannot do a PUT on /video, but instead must interact with the API using the /static-resource
 endpoint.
 
 To update the entirety of a static-resource, make a PUT to /static-resource/<the UUID of the resource>. Updating a 
 manifest.mpd resource will not propagate changes to any children of that resource, though since all information such as
 metadata, name, description, attribution, etc. should be read off of the 'master' static-resource, there's no need to 
 update all of its children anyway.
  
  #### Fields
  The following static-resource fields will be returned:
  
  ##### id (string)
  The UUID of the static-resource.
  
  ##### name (string)
  The name of the video.
  
  ##### description (string)
  A description of the video.
  
  ##### url (string)
  The URL of the file in XRChat's storage cache. This will NOT be the original URL of where the video was downloaded from.
  
  ##### mime_type (string)
  The mime_type of the file. For the manifest.mpd, this will be 'application/dash+xml'. For the associated chunk .m4s
  files, this will be 'video/iso.segment'. For the .m3u8 files, this will be 'application/x-mpegURL'.
  
  ##### metadata (string)
  This will be a stringified form of the JSON object. Run JSON.parse(), or the equivalent in the language you're using,
  to get the metadata object.
  
  ##### createdAt (string)
  The datetime at which the static-resource was created.
  
  ##### updatedAt (string)
  The datetime at which the static-resource was last modified.
  
  ##### type (string)
  The general type of the object to which the static-resource refers. For cached videos, this will be 'video' regardless
  of the mime_type; the associated thumbnail will be of type 'image'.
  
  ##### attributionId (string)
  The UUID of the attribution of this video. Will be null if no 'creator' was passed during creation.
  
  ##### userId (string)
  The UUID of the User that owns this cached video. Will be null if it's a public video.
  
  ##### parentResourceId (string)
  The UUID of the parent static-resource representing the manifest.mpd file for this cached video. Will be null for the 
  manifest.mpd static-resource, as it is the 'master' resource.
 
 ### Delete Cached Videos
 
 ```DELETE /static-resource/<UUID>```
 
 As mentioned in 'Resulting static-resources', the database entries created from caching a video are all 
 'static-resources'. You cannot do a DELETE on /video, but instead must interact with the API using the /static-resource
 endpoint.
 
 To delete a static-resource, make a DELETE to /static-resource/<the UUID of the resource>. All children of that
 resource will be deleted, as will the cached file referenced in the 'url' field. This means that if you delete the
 'master' static-resource pointing to the manifest.mpd file, ALL of the associated .m4s and .m3u8 resources and stored 
 files will be removed, as will the thumbnail. This is the proper way to remove a cached video from the system. 
 
 Since public videos all get uploaded to a standardized path instead of having unique UUIDs in the stored paths,
 if there are multiple database references to a single video, and one of those references is deleted, the remaining
 one will point to nonexistent files.