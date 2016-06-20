/*! Copyright (c) 2015 Little Genius Education Ltd.  All Rights Reserved. */
/*****************************************************************************/
/* UserDetail: Event Handlers */
/*****************************************************************************/
Template.UserDetail.events({
  'click .talkToBtn': function (e) {
    var targetIds = [Router.current().params._id];
      Meteor.call('chatCreate', targetIds, Session.get('pickedSchoolId'), function (err, data) {
      Router.go('ChatRoom', {chatRoomId: data});
    });
  }
});

/*****************************************************************************/
/* UserDetail: Helpers */
/*****************************************************************************/
Template.UserDetail.helpers({
  userPofile: function () {
    return Meteor.users.findOne({_id: Router.current().params._id});
  },
  hisJoinedClasses: Smartix.Groups.Collection.find({
      type: 'class'
  }),
  userId: function (argument) {
    return Router.current().params._id;
  },
  isStudentHigherThirteen: function () {
    var user = Meteor.users.findOne({_id: Router.current().params._id});
    var age = moment(lodash.get(user, 'dob')) || moment();
    var now = moment();
    return now.diff(age, 'years') > 12;
  },
  canChat: function () {
    var user = Meteor.users.findOne({_id: Router.current().params._id});
    
    // TODO: If user is admin or teacher, return `true` immediately

    var age = moment(lodash.get(user, 'dob')) || moment();
    var now = moment();
    var isHigherThan13 = now.diff(age, 'years') > 12;


    var ageRestrictedClass;
    if (Router.current().params.classCode) {
      var classObj = Smartix.Groups.Collection.findOne({
          type: 'class',
          classCode: Router.current().params.classCode
        });
      ageRestrictedClass = classObj.ageRestricted;
    } else {
      ageRestrictedClass = true;
    }

    if (isHigherThan13) {
      return true;
    }

    if (!ageRestrictedClass) {
      return true;
    }

    if (ageRestrictedClass && isHigherThan13) {
      return true;
    } else if (!isHigherThan13 && !ageRestrictedClass) {
      return true;
    }
    return false;
  },
  classCode: function (argument) {
    return Router.current().params.classCode || "";
  },
  getnote: function (argument) {
    return lodash.get(Commend.findOne({
        userId: Router.current().params._id,
        classId: Router.current().params.classId
      }), 'comment') || TAPi18n.__("No_private_note_yet");
  },
  classId: function (argument) {
    return Router.current().params.classId || "";
  },

  canEmail: function (argument) {
    var user = Meteor.users.findOne({_id: Router.current().params._id});
    var flag = lodash.get(user, 'emailNotifications') || false;
    return flag ?  "checked" : "";
  },

  canPush: function (argument) {
    var user = Meteor.users.findOne({_id: Router.current().params._id});
    var flag =  lodash.get(user, 'pushNotifications') || false;
    return flag ?  "checked" : "";
  }
  //,
  //checked: function (type) {
  //  return lodash.get(Meteor.user(), 'profile.' + type) ? "checked" : "";
  //}

});

/* UserDetail: Lifecycle Hooks */
Template.UserDetail.onCreated( function() {
});

Template.UserDetail.onRendered( function() {
});

Template.UserDetail.destroyed = function () {
};
