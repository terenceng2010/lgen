/*! Copyright (c) 2015 Little Genius Education Ltd.  All Rights Reserved. */
var text = new ReactiveVar('');
var classObj;


var soundArr = ReactiveVar([]);
var isRecording = false;
var media = "";
var isPlayingSound = false;

/*****************************************************************************/
/* ClassPanel: Event Handlers */
/*****************************************************************************/
Template.ClassPanel.events({
  'change .chooseType': function (evt) {
    var type = $(evt.target).val();
    var msgId = $(evt.target).data('mgsid');
    var classObj = Classes.findOne({classCode: Router.current().params.classCode});
    Meteor.call("updateMsgRating", type, msgId, classObj);
  },
  'keyup .search': function () {
    text.set($('.search').val());
    log.info(text.get());
  },
  'click .list .card': function (e) {
    //Router.go('ClassPanelMsgNotice', {msgCode: this.msgId});
    
    if(e.target.tagName == 'A' || e.target.tagName == "IMG"){
        //do nothing if user click on a link or an image    
    }else{
    
        console.log(e);
        if($(e.currentTarget).children('.extraInfo').hasClass('expand')){
        $(e.currentTarget).children('.extraInfo').removeClass('expand');      
        }else{
        $(e.currentTarget).children('.extraInfo').addClass('expand');
        }
    }
    
  },
  'click .imgThumbs': function (e) {
    var imageFullSizePath = $(e.target).data('fullsizeimage');
    IonModal.open('imageModal', {src: imageFullSizePath});
  },
  'click .playBtn': function (e) {
    if (!isPlayingSound) {
      isPlayingSound = true;
      var playname = $(e.target).data('clipid');
      //  $(e.target).attr('class','icon ion-stop');
      $(e.target).attr('class', 'button button-icon icon ion-stop ');

      // alert("startPlay");
      playAudio(Sounds.findOne(playname).url(), function (argument) {
        $(e.target).attr('class', 'button button-icon icon ion-play playBtn');
        isPlayingSound = false;
      });
    }
  },
  'click .messageList .item .content a': function (e) {
      Application.FileHandler.openFile(e);
      e.preventDefault();
  },
  'click .messageList .item .bubble a': function (e) {
      Application.FileHandler.openFile(e);
      e.preventDefault();
  }
  
});

/*****************************************************************************/
/* ClassPanel: Helpers */
/*****************************************************************************/
Template.ClassPanel.helpers({
  classObj: function () {
    var classObj = Classes.findOne({classCode: Router.current().params.classCode});
    return classObj;
  },
  classCode: function () {
    return Router.current().params.classCode
  },
  isNotEmpty: function (action) {
    return action.length > 0;
  },
  createBy: function () {
    return classObj.createBy;
  },
  className: function () {
    return classObj.className;
  },
  havePic: function () {
    return this.imageArr.length > 0;
  },
  getImage: function () {
    var id = this.toString();
    return Images.findOne(id);
  },
  haveSound: function () {
    return this.soundArr.length > 0;
  },
  getSound: function () {
    var id = this.toString();
    return Sounds.findOne(id);
  },
  haveDocument: function () {
    return this.documentArr.length > 0;
  },
  getDocument: function () {
    var id = this.toString();
    return Documents.findOne(id);
  },
  isPlural: function (count) {
    return count > 1;
  }
  , isZero: function (count) {
    return count === 0;
  }

});

/*****************************************************************************/
/* ClassPanel: Lifecycle Hooks */
/*****************************************************************************/
Template.ClassPanel.created = function () {
  


};

Template.ClassPanel.rendered = function () {

    var template = this;
    //scroll to bottom
    this.autorun(function () {
        if (template.subscriptionsReady()) {
        Tracker.afterFlush(function () {
            
                var imgReadyChecking = function(){
                    var hasAllImagesLoaded =true;

                    $('img').each(function(){
                        if(this.complete){
                            //log.info('loaded');
                        }else{
                            //log.info('not loaded');
                            hasAllImagesLoaded = false;
                        }
                    });
	                
                    if(hasAllImagesLoaded){
                        log.info('scroll to bottom');
                        //need to wrap the code inside autorun and subscriptionready
                        //see http://stackoverflow.com/questions/32291382/when-the-page-loads-scroll-down-not-so-simple-meteor-js
                        //scroll messagelist to bottom;


                        var messageListDOM = document.getElementById("messageList");
                        var messageListDOMToBottomScrollTopValue = messageListDOM.scrollHeight - messageListDOM.clientHeight;
                        messageListDOM.scrollTop=messageListDOMToBottomScrollTopValue; 
                        //$('#messageList').animate({scrollTop:messageListDOMToBottomScrollTopValue}, 300);
                    	
                    }else{
                        log.info('run next time');
                        //if not all images is fully loaded, scroll bottom would not work.
                        //so we set a timer to do the imgReadyChecking again later
                        setTimeout(imgReadyChecking, 1000);
                    }                                  
                };
                //run for the first time
            	imgReadyChecking();
               
        });
        }
    });
    
    Session.set('hasFooter',false);
};

Template.ClassPanel.destroyed = function () {
    Session.set('hasFooter',true);
};

