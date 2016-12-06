/**
 * This module is a Multer Engine for Azure Blog Storage
 */

import * as azure from 'azure-storage';

interface iOpts {
  account: string,
  key: string,
  container: string
}


class Blob {
  private container: string;
  private blobSvc: azure.BlobService

  //Creates a new service to interact with azure blob storage
  constructor(opts: iOpts) {
    this.container = opts.container;
    this.blobSvc = azure.createBlobService(opts.account, opts.key);
    this.createContainer(this.container);
  }


  //This creates the container if one doesn't exist
  private createContainer(name: string) {
    this.blobSvc.createContainerIfNotExists(name, function (error, result, response) {
      if (!error) {
      } else {
        throw error;
      }
    });
  }

  //Handles the files delivered from Multer and sends them to Azure Blob storage. _handleFile is a required function for multer storage engines
  public _handleFile(req: any, file: any, cb: any) {

    //Extracts the extension for the filename
    var re = /(?:\.([^.]+))?$/;
    var ext = re.exec(file.originalname)[1];

    //Creates a unique filename based on the time and appends the extension
    var newName = Date.now() + '-' + encodeURIComponent(new Buffer(file.originalname).toString('base64'))  + '.' + ext;


    //The file is streamed to azure storage through a normal filestream 
    var writestream = this.blobSvc.createWriteStreamToBlockBlob(this.container, newName, function (err, result) {
      if(err) throw err;
    });
    file.stream.pipe(writestream);
    console.log('Uploading:', file.originalname);
    writestream.on('error', cb);
    writestream.on('finish', function(){
      console.log('Uploaded:', file.originalname);
      cb(null, {
        filename: newName,
        originalname: file.originalname,
        encoding: file.encoding,
        mimetype: file.mimetype
      });
    });
  }

  //Removes files for Multer when it chooses to. _removeFile is a required function for multer storage engines
  public _removeFile (req: any, file: any, cb: any) {
    this.blobSvc.deleteBlob(this.container, file.filename, cb);
  }
}


module.exports = function (opts: iOpts) {
  return new Blob(opts);
}



