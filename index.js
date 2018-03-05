"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var azure = require("azure-storage");
var Blob = (function () {
    function Blob(opts) {
        this.container = opts.container;
        this.blobSvc = opts.connectionString ? azure.createBlobService(opts.connectionString) : azure.createBlobService(opts.account, opts.key);
        this.createContainer(this.container);
        this.blobPathResolver = opts.blobPathResolver;
        this.error = null;
    }
    ;
    Blob.prototype.createContainer = function (name) {
        var _this = this;
        this.blobSvc.createContainerIfNotExists(name, function (error, result, response) {
            if (error) {
                _this.error = error;
            }
        });
    };
    Blob.prototype.uploadToBlob = function (req, file, cb) {
        var that = this;
        return function (something, blobPath) {
            var blobStream = that.blobSvc.createWriteStreamToBlockBlob(that.container, blobPath, req.uploadOptions || {}, function (error) {
                if (error) {
                    cb(error);
                }
            });
            file.stream.pipe(blobStream);
            blobStream.on("close", function () {
                that.blobSvc.getBlobProperties(that.container, blobPath, function (error, result, response) {
                    if (error) {
                        cb(error);
                    }
                    var fullUrl = that.blobSvc.getUrl(that.container, blobPath);
                    var fileClone = __assign({}, file, { container: that.container, blobPath: blobPath, url: fullUrl, size: result.contentLength, blobType: result.blobType, metadata: result.metadata });
                    cb(null, fileClone);
                });
            });
            blobStream.on("error", function (error) {
                cb(error);
            });
        };
    };
    Blob.prototype._handleFile = function (req, file, cb) {
        if (this.error) {
            cb(this.error);
        }
        else if (this.blobPathResolver) {
            this.blobPathResolver(req, file, this.uploadToBlob(req, file, cb));
        }
        else {
            var re = /(?:\.([^.]+))?$/;
            var ext = re.exec(file.originalname)[1];
            var newName = Date.now() + '-' + encodeURIComponent(new Buffer(file.originalname).toString('base64')) + '.' + ext;
            this.uploadToBlob(req, file, cb)(null, newName);
        }
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