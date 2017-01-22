"use strict";
const azure = require("azure-storage");
class Blob {
    constructor(opts) {
        this.container = opts.container;
        this.blobSvc = azure.createBlobService(opts.account, opts.key);
        this.createContainer(this.container);
        this.blobPathResolver = opts.blobPathResolver;
    }
    ;
    createContainer(name) {
        this.blobSvc.createContainerIfNotExists(name, function (error, result, response) {
            if (error) {
                throw error;
            }
        });
    }
    uploadToBlob(req, file, cb) {
        var that = this;
        return function (something, blobPath) {
            var blobStream = that.blobSvc.createWriteStreamToBlockBlob(that.container, blobPath, function (error) {
                if (error) {
                    cb(error);
                }
            });
            file.stream.pipe(blobStream);
            blobStream.on("close", function () {
                var fullUrl = that.blobSvc.getUrl(that.container, blobPath);
                cb(null, Object.assign({}, file, { container: that.container, blobPath: blobPath, url: fullUrl }));
            });
            blobStream.on("error", function (error) {
                cb(error);
            });
        };
    }
    _handleFile(req, file, cb) {
        if (this.blobPathResolver) {
            this.blobPathResolver(req, file, this.uploadToBlob(req, file, cb));
        }
        else {
            var re = /(?:\.([^.]+))?$/;
            var ext = re.exec(file.originalname)[1];
            var newName = Date.now() + '-' + encodeURIComponent(new Buffer(file.originalname).toString('base64')) + '.' + ext;
            this.uploadToBlob(req, file, cb)(null, newName);
        }
    }
    _removeFile(req, file, cb) {
        this.blobSvc.deleteBlob(this.container, file.filename, cb);
    }
}
module.exports = function (opts) {
    return new Blob(opts);
};
//# sourceMappingURL=index.js.map