//console.log('filehandler','is Smartix exist?',Smartix || {});
Smartix = Smartix || {};
Smartix.FileHandler = Smartix.FileHandler || {};
Smartix.FileHandler = (function () {
    
    var directDocumentMessage = function (documentArray){
        
        /*if (Meteor.user().profile.firstdocument) {
            analytics.track("First Document", {
                date: new Date(),
            });

            Meteor.call("updateProfileByPath", 'profile.firstdocument', false);
        }  */ 
             
        var target = Session.get('sendMessageSelectedClasses').selectArrId;
        log.info(target);
        var msg = "";
        var mediaObj = {};
        mediaObj.imageArr = [];
        mediaObj.soundArr = [];
        mediaObj.documentArr = documentArray;
        
        if(msg == "" && mediaObj.imageArr.length == 0 && mediaObj.soundArr.length
            == 0 && mediaObj.documentArr.length == 0 ){
        
            toastr.warning("please input some message");
            return;
        }
        
        /*else if(target.length > 0) {
        Meteor.call('sendMsg', target, msg, mediaObj, function () {
            Session.set("sendMessageSelectedClasses", {
            selectArrName: [],
            selectArrId: []
            });
            
                                       
        });
        } else {
        toastr.error("no class select!");
        } */
        
        addons = [];
        //add documents to addons one by one if any
        if(mediaObj.documentArr){
            console.log('there is doc');
            mediaObj.documentArr.map(function(eachDocument){
                addons.push({type:'documents',fileId:eachDocument});
            })
        }        
        
        GeneralMessageSender(target[0],'text',msg, addons)
            
        return true;      
    }

    return {
        openFile: function (e) {
            //open external url via cordova inappbrowser plugin so user can go back to the chat screen
            //https://blog.nraboy.com/2014/12/open-dynamic-links-using-cordova-inappbrowser/                  
            var element = e.target || e.srcElement;

            if (element.tagName == 'A') {
                if (element.href) {
                    var fileURL = element.href;
                        
                    //since IOS has built-in document viewer, we just pass the url directly to the system to handle it.   
                    if (isIOS()) {                  
                        //use _blank will open the link via inappbrowser, so no address bar would be shown. But file cannot be zoom-in and zoom-out
                        //use _system will open the link via safari, there is address bar. File can be zoom-in and out and pan freely.
                        //there is a back button to back to the app. <--only on ios 9.1, not working on 8.4                       
                        if( parseFloat(device.version) <= 8.4 ){
                         window.open(fileURL, "_blank", "location=no");                           
                        }else{
                         window.open(fileURL, "_system", "location=no");                            
                        }
                    } else if (Smartix.helpers.isAndroid()) {
                            
                        //for android, they dont have built-in document viewer, although google docs viewer can be used,
                        //the performance is sub-optimal.
                        //so we just just pass the url directly to the system. The system will let user choose to donwload it
                        //and open it in android native app
                        //like adobe reader for pdf or quickoffice for office files.                   
                        window.open(fileURL, "_system", "location=no");
                    } else { //for web, they dont have built-in document viewer, we pass the modified the url to point to
                        // google docs viewer
                            
                        //if it is a normal document url                
                        if (lodash.endsWith(fileURL, 'doc') || lodash.endsWith(fileURL, 'docx')
                            || lodash.endsWith(fileURL, 'ppt') || lodash.endsWith(fileURL, 'pptx')
                            || lodash.endsWith(fileURL, 'xls') || lodash.endsWith(fileURL, 'xlsx')
                            ) {
                            var modifiedFileURL = "https://docs.google.com/viewer?embedded=true&url=" + fileURL + "";
                            window.open(modifiedFileURL, "_system", "location=no");
                        } else {
                            //if it is other file type that google docs viewer can't handle, user would be prompted to download the file.
                            //modern desktop browser has built-in pdf viewer, so pdf will be opened here
                            window.open(fileURL, "_system", "location=no");
                        }
                    }
                    return false;
                }
            }
        },
        imageUpload: function (event, category, currentImageArray, callback) {
            FS.Utility.eachFile(event, function (file) {
                Images.insert(file, function (err, fileObj) {
                    if (err) {
                        // handle error
                        log.error(err);
                    }
                    else {

                        if (category == "chat") {
                            
                            GeneralMessageSender(Router.current().params.chatRoomId,'text','New Image',[{type:'images',fileId: fileObj._id}],
                                Smartix.helpers.getAllUserExceptCurrentUser()
                            );
                            

                        } else if (category == "class") {
                            // alert(fileObj._id);
                            var arr = currentImageArray;
                            arr.push(fileObj._id);

                            log.info(fileObj.name());
                            log.info(fileObj.extension());
                            log.info(fileObj.size());

                            log.info(fileObj.type());
                            log.info(fileObj.updatedAt());

                            if (Meteor.user().firstPicture) {
                                analytics.track("First Picture", {
                                    date: new Date(),
                                });

                                Meteor.call("updateProfileByPath", 'firstPicture', false);
                            }
                            log.info(fileObj._id);
                            callback(arr);
                        }

                    }
                });
            });
        },
        imageUploadForAndroidAndIOS: function (e) {
            var onSuccess = function (imageURI) {
                // var image = document.getElementById('myImage');
                // image.src = "data:image/jpeg;base64," + imageData;
                // alert(imageData);
                window.resolveLocalFileSystemURI(imageURI,
                    function (fileEntry) {
                        // alert("got image file entry: " + fileEntry.fullPath);
                        // log.info(fileEntry.)
                        fileEntry.file(function (file) {
                            // alert(file);
                            log.info(file);
                            Images.insert(file, function (err, fileObj) {
                                if (err) {
                                    // handle error
                                    log.error(err);
                                }
                                else {
                                    GeneralMessageSender(Router.current().params.chatRoomId,'text','New Image',[{type:'images',fileId: fileObj._id}],
                                        Smartix.helpers.getAllUserExceptCurrentUser()
                                    );
                                }
                            });
                        });
                    },
                    function () {
                        //error
                        // alert("ada");
                    }
                    );
            }

            var onFail = function (message) {
                toastr.error('Failed because: ' + message);
            }
            var callback = function (buttonIndex) {
                setTimeout(function () {
                    // like other Cordova plugins (prompt, confirm) the buttonIndex is 1-based (first button is index 1)
                    //  alert('button index clicked: ' + buttonIndex);
                    switch (buttonIndex) {
                        case 1:
                            navigator.camera.getPicture(onSuccess, onFail, {
                                quality: 50,
                                destinationType: Camera.DestinationType.FILE_URI,
                                limit: 1
                            });
                            break;
                        case 2:
                            navigator.camera.getPicture(onSuccess, onFail, {
                                quality: 50,
                                destinationType: Camera.DestinationType.FILE_URI,
                                sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
                                limit: 1
                            });
                            break;
                        default:

                    }
                });
            };
            var options = {
                'buttonLabels': ['Take Photo From Camera', 'Select From Gallery'],
                'androidEnableCancelButton': true, // default false
                'winphoneEnableCancelButton': true, // default false
                'addCancelButtonWithLabel': 'Cancel'
            };
            window.plugins.actionsheet.show(options, callback);
        },
        documentUpload: function (event,category,currentDocumentArray,callback) {
            FS.Utility.eachFile(event, function (file) {
                //log.info(file);
                Documents.insert(file, function (err, fileObj) {
                    if (err) {
                        // handle error
                        log.error(err);
                    }
                    else {                        
                        //for reason unknown, filename cannot be inserted directly if using iphone cordova,
                        //so we explicitly set the file obj name here.      
                        fileObj.name(file.name);
                        
                        if(category == 'chat'){
                            
                            GeneralMessageSender(Router.current().params.chatRoomId,'text','New Document',[{type:'documents',fileId: fileObj._id}],
                                Smartix.helpers.getAllUserExceptCurrentUser()
                            );                                                    
                           
                        }else if (category =='class'){                                      
                            var arr = currentDocumentArray;
                            arr.push(fileObj._id);
                            callback(directDocumentMessage(arr))                                   
                        }

                    }
                });
            });
        },
        documentUploadForAndroid: function (e,category,currentDocumentArray,callback) {
            var successCallback = function (uri) {
                log.info(uri);
                window.FilePath.resolveNativePath(uri, function (localFileUri) {
                    var filePathPrepend = "";
                    if(localFileUri.indexOf("file:///")!=0){
                            filePathPrepend = "file:///";
                            
                    }                        
                    window.resolveLocalFileSystemURL(filePathPrepend + localFileUri, function (fileEntry) {
                            
                        //alert('do something');
                        log.info(localFileUri);
                        fileEntry.file(function (file) {
                            var newFile = new FS.File(file);
                            Documents.insert(newFile, function (err, fileObj) {
                                if (err) {
                                    //handle error
                                    log.error("insert error" + err);
                                }
                                else {   
                                    if( category == 'chat'){
                                        //handle success depending what you need to do
                                        console.dir(fileObj);
                                        GeneralMessageSender(Router.current().params.chatRoomId,'documents','New Document',[{type:'documents',fileId: fileObj._id}],
                                            Smartix.helpers.getAllUserExceptCurrentUser()
                                        );                                         
                                    }else if (category == 'class'){
                                        var arr = currentDocumentArray;
                                        arr.push(fileObj._id);
                                        callback(directDocumentMessage(arr))  ;                                  
                                    }

                                }
                            });
                        });
                    });
                });

            }

            var failureCallback = function (uri) {

                alert(uri);

            }
            
            //check if fileChooser is existed. Since it is a cordova package, old client may not have it.
            if(fileChooser){
                fileChooser.open(successCallback, failureCallback);               
            }else{
               toastr.warning("Please update the app to the latest version for document upload in Android");
            }

        }
    };
})();