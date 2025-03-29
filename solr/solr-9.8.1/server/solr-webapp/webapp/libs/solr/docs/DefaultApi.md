# V2Api.DefaultApi

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**readSecurityJsonNode**](DefaultApi.md#readSecurityJsonNode) | **GET** /cluster/zookeeper/data/security.json | 



## readSecurityJsonNode

> ZooKeeperFileResponse readSecurityJsonNode()



### Example

```javascript
import V2Api from 'v2_api';

let apiInstance = new V2Api.DefaultApi();
apiInstance.readSecurityJsonNode((error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
});
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**ZooKeeperFileResponse**](ZooKeeperFileResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/vnd.apache.solr.raw, application/json

