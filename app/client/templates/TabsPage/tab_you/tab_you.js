/*! Copyright (c) 2015 Little Genius Education Ltd.  All Rights Reserved. */
Template.TabYou.events({
  'click .signOut': function () {
    log.info("logout:" + Meteor.userId());
    Meteor.logout(
      function (err) {
        Router.go('Login');
      }
    );
  },

  'click .love': function (argument) {
      var text;
      switch (Meteor.user().profile.role) {
        //TODO localization English hardcoded for recommendation, with template i18n, see doc on how to insert variable
        case "Teacher":
            text = "Hey! \r\n\r\nI have been using Smartix to text my students and parents without sharing my " +
            "personal phone number.\r\nYou have to try it! It saves time, students love it and it is free! " +
            "\r\nHere is the link: " + Meteor.settings.public.SHARE_URL + "?rid=" + Meteor.userId();
          break;
        case "Student":
            text = "Hey!\r\n\r\nMy teachers have been using the Smartix app to message our class before " +
            "assignments are due, share photos and update us with last minute changes. You should tell your teachers about it! " +
            "It\'s really helpful and free.\r\nHere is the link: " + Meteor.settings.public.SHARE_URL + "?rid=" + Meteor.userId() + "\"\r\n";
          break;
        case "Parent":
            text = "Hey!\r\n\r\nOur school teachers have been using the Smartix app to message our class before " +
            "assignments are due, share photos and update us with last minute changes. You should tell your school teachers about it! " +
            "It\'s really helpful and free.\r\nHere is the link: " + Meteor.settings.public.SHARE_URL + "?rid=" + Meteor.userId() + "\"\r\n";
          break;

        default:
      }
      
    if (Meteor.isCordova) {
      window.plugins.socialsharing.share(text, null, null, null);
      analytics.track("Referral", {
        date: new Date(),
        userId: Meteor.userId()
      });
      Meteor.call("addReferral", Meteor.userId(), function (error, result) {
        if (error) {
          log.error("error", error);
        }
      });
    }//end of isCordova
    else{
      //if is not cordova, try to send via user email client
      window.location.href = "mailto:?body="+text;
    }
    
  }
});

/*****************************************************************************/
/* TabYou: Helpers */
/*****************************************************************************/
Template.TabYou.helpers({

});

/*****************************************************************************/
/* TabYou: Lifecycle Hooks */
/*****************************************************************************/
Template.TabYou.created = function () {
};

Template.TabYou.rendered = function () {

};

Template.TabYou.destroyed = function () {
};
