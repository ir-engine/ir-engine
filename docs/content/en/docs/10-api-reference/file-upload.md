---
title: "Uploading Files"
linkTitle: "Uploading Files"
date: 2017-01-05
description: >
  Uploading files directly to a storage provider
---


## Structure

XRChat can host various types of files on a storage provider you control, such as an S3 bucket in AWS.
Directly uploading files like this, as opposed to going through one of the conversion endpoints, will not alter the
file in any way.

### Upload path
Each upload will have a UUID associated with the top-level resource, e.g. the main file that's being uploaded.
In the storage provider, this file will be stored at ```<provider path>/<UUID>/<filetype>/<file.extension>```
For example, a video that was uploaded to S3 would be stored at 
```https://s3.amazonaws.com/<bucket_name>/<UUID>/video/example-video.mp4```

### Thumbnails
A thumbnail can be provided as a separate file when making a POST. The thumbnail will be
located in the /image folder at <UUID of parent>/image and will be named whatever the name of the thumbnail file is.
If the previous example video was uploaded with a thumbnail that was titled 'example-image.jpg', the video would be at 
```https://s3.amazonaws.com/<bucket_name>/<video UUID>/video/example-video.mp4```
 and the thumbnail would be at
```https://s3.amazonaws.com/<bucket_name>/<video UUID>/image/example-image.jpg```
If the main file was an image, both it and its thumbnail would be in /image

## API

The path for uploading files is /upload. All of the files generated from this process are of type 
'static-resource', so to retrieve/update/delete the resulting files, one will need to interact with them through the 
/static-resource endpoint.

### Uploading a file (and optionally a thumbnail)

```POST /upload```

A multipart/form-data body will contain a buffer of the file contents, an optional string for 'name' and 'description',
and optionally another buffer of the thumbnail contents.

#### Fields

##### file (buffer)[required]

A buffer of the file contents. In a browser, it's easiest to have an input field of type 'file', then make a new
instance of FormData() and then do formdata.append('file', <file instance from input field>). Finally, POST this 
instance of FormData to /upload with the header 'Content-Type: multipart/form-data'

##### name (string)[required]

The name of the file. 

##### description (string)
A description of the file

###### thumbnail (buffer)
A buffer of the thumbnail file contents. See above under 'file' for a quick overview on how to append this file
to the FormData

This endpoint does NOT do multi-posts.

### Get Uploaded File

```GET /static-resource/<UUID>``` 

The database entries created from uploading a file are all 'static-resources'. You cannot do a GET on /upload, but 
instead must interact with the API using the /static-resource endpoint.


#### Fields
The following static-resource fields will be returned:

##### id (string)
The UUID of the static-resource.

##### name (string)
The name of the file.

##### description (string)
A description of the file.

##### url (string)
The URL of the file in XRChat's storage cache.

##### mime_type (string)
The mime_type of the file. 

##### metadata (string)
This will be a stringified form of the JSON object. Run JSON.parse(), or the equivalent in the language you're using,
to get the metadata object.

##### createdAt (string)
The datetime at which the static-resource was created.

##### updatedAt (string)
The datetime at which the static-resource was last modified.

##### type (string)
The general type of the object to which the static-resource refers. 

##### attributionId (string)
The UUID of the attribution of this file. Will be null if no 'creator' was passed during creation.

##### userId (string)
The UUID of the User that owns this cached file.

##### parentResourceId (string)
The UUID of the parent static-resource 

##### attribution (object)
The associated attribution for the file. Will be null if no 'creator' was passed during creation.

### Patch Uploaded File

```PATCH /static-resource/<UUID>``` 

The database entries created from uploading a file are all 'static-resources'. You cannot do a PATCH on /upload, but 
instead must interact with the API using the /static-resource endpoint.

To update specific fields on a static-resource, make a PATCH to /static-resource/<the UUID of the resource>. As this is
 a PATCH, you only need to include the fields you want to change. Patches to a resource will not propagate to its
 children.

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
The name of the file.

##### description (string)
A description of the file.

##### url (string)
The URL of the file in XRChat's storage cache.

##### mime_type (string)
The mime_type of the file. 

##### metadata (string)
This will be a stringified form of the JSON object. Run JSON.parse(), or the equivalent in the language you're using,
to get the metadata object.

##### createdAt (string)
The datetime at which the static-resource was created.

##### updatedAt (string)
The datetime at which the static-resource was last modified.

##### type (string)
The general type of the object to which the static-resource refers. 

##### attributionId (string)
The UUID of the attribution of this file. Will be null if no 'creator' was passed during creation.

##### userId (string)
The UUID of the User that owns this cached file.

##### parentResourceId (string)
The UUID of the parent static-resource 

##### attribution (object)
The associated attribution for the file. Will be null if no 'creator' was passed during creation.


### Put Uploaded File

```PUT /static-resource/<UUID>``` 

The database entries created from uploading a file are all 'static-resources'. You cannot do a PUT on /upload, but 
instead must interact with the API using the /static-resource endpoint.

 To update the entirety of a static-resource, make a PUT to /static-resource/<the UUID of the resource>. Puts to a 
 resource will not propagate to its children.



#### Fields
The following static-resource fields will be returned:

##### id (string)
The UUID of the static-resource.

##### name (string)
The name of the file.

##### description (string)
A description of the file.

##### url (string)
The URL of the file in XRChat's storage cache.

##### mime_type (string)
The mime_type of the file. 

##### metadata (string)
This will be a stringified form of the JSON object. Run JSON.parse(), or the equivalent in the language you're using,
to get the metadata object.

##### createdAt (string)
The datetime at which the static-resource was created.

##### updatedAt (string)
The datetime at which the static-resource was last modified.

##### type (string)
The general type of the object to which the static-resource refers. 

##### attributionId (string)
The UUID of the attribution of this file. Will be null if no 'creator' was passed during creation.

##### userId (string)
The UUID of the User that owns this cached file.

##### parentResourceId (string)
The UUID of the parent static-resource 

##### attribution (object)
The associated attribution for the file. Will be null if no 'creator' was passed during creation.

 ### Delete Uploaded File
 
 ```DELETE /static-resource/<UUID>```
 
 The database entries created from uploading a file are all 'static-resources'. You cannot do a DELETE on /upload, but 
 instead must interact with the API using the /static-resource endpoint.
 
 To delete a static-resource, make a DELETE to /static-resource/<the UUID of the resource>. All children of that
 resource will be deleted, as will the cached file referenced in the 'url' field. This means that deleting a file that
 has a thumbnail will delete the thumbnail as well.