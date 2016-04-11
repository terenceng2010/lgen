/*! Copyright (c) 2015 Little Genius Education Ltd.  All Rights Reserved. */
/*****************************************************************************/
/* ClassInformation: Event Handlers */
/*****************************************************************************/
Template.ClassInformation.events({
  'click .unsub': function () {
    Meteor.call('class/leaveByCode', Router.current().params.classCode, function () {
      Router.go('TabClasses')
    })
  }
});

/*****************************************************************************/
/* ClassInformation: Helpers */
/*****************************************************************************/
Template.ClassInformation.helpers({
  classObj: function () {
    return Smartix.Groups.Collection.findOne({
        type: 'class',
        classCode: Router.current().params.classCode});
  },
  teacher: function () {
    var teacherUser = Smartix.Groups.Collection.findOne({
        type: 'class',
        classCode: Router.current().params.classCode
    });
    if(teacherUser) {
        return Meteor.users.findOne(teacherUserId.admins[0]);
    }
  }
});