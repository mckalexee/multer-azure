"use strict";
var azure = require('azure-storage');
var Blob = (function () {
    function Blob(opts) {
        this.container = opts.container;
        this.blobSvc = azure.createBlobService(opts.account, opts.key);
        this.createContainer(this.container);
    }
    Blob.prototype.createContainer = function (name) {
        this.blobSvc.createContainerIfNotExists(name, function (error, result, response) {
            if (!error) {
            }
            else {
                throw error;
            }
        });
    };
    Blob.prototype._handleFile = function (req, file, cb) {
        var re = /(?:\.([^.]+))?$/;
        var ext = re.exec(file.originalname)[1];
        var newName = Date.now() + '-' + encodeURIComponent(new Buffer(file.originalname).toString('base64')) + '.' + ext;
        var writestream = this.blobSvc.createWriteStreamToBlockBlob(this.container, newName, function (err, result) {
            if (err)
                throw err;
        });
        file.stream.pipe(writestream);
        console.log('Uploading:', file.originalname);
        writestream.on('error', cb);
        writestream.on('finish', function () {
            console.log('Uploaded:', file.originalname);
            cb(null, {
                filename: newName,
                originalname: file.originalname,
                encoding: file.encoding,
                mimetype: file.mimetype
            });
        });
    };
    Blob.prototype._removeFile = function (req, file, cb) {
        this.blobSvc.deleteBlob(this.container, file.filename, cb);
    };
    return Blob;
}());
module.exports = function (opts) {
    return new Blob(opts);
};
//# sourceMappingURL=index.js.map