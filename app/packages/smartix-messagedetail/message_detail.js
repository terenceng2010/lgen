Template.MessageDetail.helpers({
  attachImages: function () {
    var imageObjects =lodash.filter(this.addons, function(addon) { return addon.type ==='images'; });
    return lodash.map(imageObjects,'fileId');
  },  
  getImage: function () {
    var id = this.toString();
    return Images.findOne(id);
  },
  isNewMessage:function(createdAt){
    //log.info('isNewMessage',createdAt);   
     var result = Notifications.findOne({'eventType':'newclassmessage','messageCreateTimestamp':createdAt});       
     //backward comptability
     if(!result){
         return "";
     }
     //log.info(result);  
     if(result.hasRead == false){
         return 'ion-record';
     }else{
         return "";
     }
  },
  attachVoices: function () {
    var voiceObjects =lodash.filter(this.addons, function(addon) { return addon.type =='voice'; });
    return lodash.map(voiceObjects,'fileId');
  },  
  getSound: function () {
    var id = this.toString();
    return Sounds.findOne(id);
  },
  attachDocuments: function () {
    var docObjs =lodash.filter(this.addons, function(addon) { return addon.type =='documents'; });
    return lodash.map(docObjs,'fileId');
  },  

  getDocument: function () {
    var id = this.toString();
    return Documents.findOne(id);
  },
  haveSound: function () {
    return this.soundArr.length > 0;
  },
  isNotEmpty: function (action) {
    return action.length > 0;
  },
  isSelectAction: function (action) {
    //return "";
    return lodash.includes(lodash.map(action, "_id"), Meteor.userId()) ? "colored" : "";
  },
  getNameById: function (userId) {
    var userObj = Meteor.users.findOne(userId);
    return userObj._id === Meteor.userId() ? "You" : userObj.profile.firstName + " " + userObj.profile.lastName;
  },
  attachCalendar:function(){
    var calendarObjs =lodash.filter(this.addons, function(addon) { return addon.type =='calendar'; });
    return calendarObjs;       
  },
  attachVotes:function(){
    var voteObjs =lodash.filter(this.addons, function(addon) { return addon.type =='poll'; });
    return voteObjs;         
  },
  attachComments:function(){
    var commentObjs =lodash.filter(this.addons, function(addon) { return addon.type =='comment'; });
    return commentObjs;          
  },
  isText: function () {
    //log.info('isText',this.data.content);
    if(this.data.content === 'New Image' || this.data.content === 'New Document' ){
      return false;
    }else{
      return true;
    }
  },

	hasMultipleAdmins: function(){
		let currentClassObj = Smartix.Groups.Collection.findOne({
			type: 'class',
			classCode: Router.current().params.classCode
		});
		return currentClassObj.admins.length > 1;
	},

	getAuthorInfo(userId){
	  //we lack a subscription to admin users...
		userObj = Meteor.users.findOne(userId);
        return userObj && userObj.profile.firstName;
	}
});
