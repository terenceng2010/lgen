/*****************************************************************************/
/* TabClasses: Event Handlers */
/*****************************************************************************/
Template.TabClasses.events({
});

/*****************************************************************************/
/* TabClasses: Helpers */
/*****************************************************************************/
Template.TabClasses.helpers({
  notCreateEmptyList:function(){
    return Classes.find({createBy:Meteor.userId()}).fetch().length>0
  },
  notJoinedEmptyList:function(){
    return Classes.find({joinedUserId:Meteor.userId()}).fetch().length>0
  },
  joinedClass:Classes.find({joinedUserId:Meteor.userId()}),
  createdClass:Classes.find({createBy:Meteor.userId()})


});

/*****************************************************************************/
/* TabClasses: Lifecycle Hooks */
/*****************************************************************************/
Template.TabClasses.created = function () {
};

Template.TabClasses.rendered = function () {


};

Template.TabClasses.destroyed = function () {
};
