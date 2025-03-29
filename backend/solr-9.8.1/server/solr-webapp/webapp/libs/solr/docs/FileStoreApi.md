# V2Api.FileStoreApi

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**deleteFile**](FileStoreApi.md#deleteFile) | **DELETE** /cluster/files{path} | Delete a file or directory from the filestore.
[**getFile**](FileStoreApi.md#getFile) | **GET** /node/files{path} | Retrieve file contents or metadata from the filestore.
[**uploadFile**](FileStoreApi.md#uploadFile) | **PUT** /cluster/files{filePath} | Upload a file to the filestore.



## deleteFile

> SolrJerseyResponse deleteFile(path, opts)

Delete a file or directory from the filestore.

### Example

```javascript
import V2Api from 'v2_api';

let apiInstance = new V2Api.FileStoreApi();
let path = "path_example"; // String | Path to a file or directory within the filestore
let opts = {
  'localDelete': true // Boolean | Indicates whether the deletion should only be done on the receiving node.  For internal use only
};
apiInstance.deleteFile(path, opts, (error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
});
```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **path** | **String**| Path to a file or directory within the filestore | 
 **localDelete** | **Boolean**| Indicates whether the deletion should only be done on the receiving node.  For internal use only | [optional] 

### Return type

[**SolrJerseyResponse**](SolrJerseyResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: */*


## getFile

> SolrJerseyResponse getFile(path, opts)

Retrieve file contents or metadata from the filestore.

### Example

```javascript
import V2Api from 'v2_api';

let apiInstance = new V2Api.FileStoreApi();
let path = "path_example"; // String | Path to a file or directory within the filestore
let opts = {
  'sync': true, // Boolean | If true, triggers syncing for this file across all nodes in the filestore
  'getFrom': "getFrom_example", // String | An optional Solr node name to fetch the file from
  'meta': true // Boolean | Indicates that (only) file metadata should be fetched
};
apiInstance.getFile(path, opts, (error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
});
```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **path** | **String**| Path to a file or directory within the filestore | 
 **sync** | **Boolean**| If true, triggers syncing for this file across all nodes in the filestore | [optional] 
 **getFrom** | **String**| An optional Solr node name to fetch the file from | [optional] 
 **meta** | **Boolean**| Indicates that (only) file metadata should be fetched | [optional] 

### Return type

[**SolrJerseyResponse**](SolrJerseyResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: */*


## uploadFile

> UploadToFileStoreResponse uploadFile(filePath, body, opts)

Upload a file to the filestore.

### Example

```javascript
import V2Api from 'v2_api';

let apiInstance = new V2Api.FileStoreApi();
let filePath = "filePath_example"; // String | File store path
let body = {key: null}; // Object | 
let opts = {
  'sig': ["null"] // [String] | Signature(s) for the file being uploaded
};
apiInstance.uploadFile(filePath, body, opts, (error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
});
```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **filePath** | **String**| File store path | 
 **body** | **Object**|  | 
 **sig** | [**[String]**](String.md)| Signature(s) for the file being uploaded | [optional] 

### Return type

[**UploadToFileStoreResponse**](UploadToFileStoreResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: */*

