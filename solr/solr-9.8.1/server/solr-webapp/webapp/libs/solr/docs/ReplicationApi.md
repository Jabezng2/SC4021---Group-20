# V2Api.ReplicationApi

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**fetchFileList**](ReplicationApi.md#fetchFileList) | **GET** /cores/{coreName}/replication/files | Return the list of index file that make up the specified core.
[**fetchIndexVersion**](ReplicationApi.md#fetchIndexVersion) | **GET** /cores/{coreName}/replication/indexversion | Return the index version of the specified core.



## fetchFileList

> FileListResponse fetchFileList(coreName, generation)

Return the list of index file that make up the specified core.

### Example

```javascript
import V2Api from 'v2_api';

let apiInstance = new V2Api.ReplicationApi();
let coreName = "coreName_example"; // String | 
let generation = 789; // Number | The generation number of the index
apiInstance.fetchFileList(coreName, generation, (error, data, response) => {
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
 **coreName** | **String**|  | 
 **generation** | **Number**| The generation number of the index | 

### Return type

[**FileListResponse**](FileListResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: */*


## fetchIndexVersion

> IndexVersionResponse fetchIndexVersion(coreName)

Return the index version of the specified core.

### Example

```javascript
import V2Api from 'v2_api';

let apiInstance = new V2Api.ReplicationApi();
let coreName = "coreName_example"; // String | 
apiInstance.fetchIndexVersion(coreName, (error, data, response) => {
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
 **coreName** | **String**|  | 

### Return type

[**IndexVersionResponse**](IndexVersionResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: */*

