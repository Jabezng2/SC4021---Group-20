# V2Api.CoreReplicationApi

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**fetchFile**](CoreReplicationApi.md#fetchFile) | **GET** /cores/{coreName}/replication/files/{filePath} | Get a stream of a specific file path of a core



## fetchFile

> fetchFile(coreName, filePath, dirType, opts)

Get a stream of a specific file path of a core

### Example

```javascript
import V2Api from 'v2_api';

let apiInstance = new V2Api.CoreReplicationApi();
let coreName = "coreName_example"; // String | 
let filePath = "filePath_example"; // String | 
let dirType = "dirType_example"; // String | Directory type for specific filePath (cf or tlogFile). Defaults to Lucene index (file) directory if empty
let opts = {
  'offset': "offset_example", // String | Output stream read/write offset
  'len': "len_example", // String | 
  'compression': false, // Boolean | Compress file output
  'checksum': false, // Boolean | Write checksum with output stream
  'maxWriteMBPerSec': 3.4, // Number | Limit data write per seconds. Defaults to no throttling
  'generation': 789 // Number | The generation number of the index
};
apiInstance.fetchFile(coreName, filePath, dirType, opts, (error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
});
```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **coreName** | **String**|  | 
 **filePath** | **String**|  | 
 **dirType** | **String**| Directory type for specific filePath (cf or tlogFile). Defaults to Lucene index (file) directory if empty | 
 **offset** | **String**| Output stream read/write offset | [optional] 
 **len** | **String**|  | [optional] 
 **compression** | **Boolean**| Compress file output | [optional] [default to false]
 **checksum** | **Boolean**| Write checksum with output stream | [optional] [default to false]
 **maxWriteMBPerSec** | **Number**| Limit data write per seconds. Defaults to no throttling | [optional] 
 **generation** | **Number**| The generation number of the index | [optional] 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: */*

