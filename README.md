# Multer Azure
This is a multer storage engine for Azure's blob storage.

## Installation
```sh
npm install --save multer-azure
```

## Usage
```javascript
var express = require('express')
var multer = require('multer')
var multerAzure = require('multer-azure')

var app = express()

var upload = multer({ 
  storage: multerAzure({
    account: '[Azure Storage Account]', //The name of the Azure storage account
    key: '[Azure Storage Account Key]', //A key listed under Access keys in the storage account pane
    container: '[Blob Container Name]'  //Any container name, it will be created if it doesn't exist
  })
})

app.post('/', upload.any(), function (req, res, next) {
  console.log(req.files)
  res.status(200).send('Uploaded: ' + req.files)
})
```

### File Information
`multer-azure` will return the following information in each file in the `req.files` parameter:

Key|Description
---|---
`fieldname`| The field name/key sent in the post request with the image.
`originalname`| The full original name of the file.
`encoding`| The file encoding.
`mimetype`| The MIME type of the file.
`filename`| The file name in the azure storage.

### File Naming

Files in an Azure container have to have a unique name. Currently, `multer-azure` only uses one nameing convention:

`Date.now()` + `encodeURIComponent(new Buffer([FILENAME]).toString('base64'))` + extension.

This results in a url safe filename that looks like `"1480994807566-Qmx1ZVBUQ0xvZ29MQVJHRTIwMTYuanBn.jpg"`, which is most likely overkill.

TODO: Add multiple naming options, and reduce the name size of the default option.

### Azure Requirements

The `account` is just the name of your storage account that you've created in Azure. For information on how to do this, check out [this tutorial.](https://docs.microsoft.com/en-us/azure/storage/storage-create-storage-account#create-a-storage-account)

The `key` for the key field can be obtained under the **Access keys** section in the storage account pane in Azure.

The `container` name can be anything you choose, as long as it's unique to the storage account and as long as it fits Azure's naming restrictions. If the container does not exist the storage engine will create it.