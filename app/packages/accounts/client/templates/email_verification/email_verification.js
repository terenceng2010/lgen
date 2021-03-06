/*! Copyright (c) 2015 Little Genius Education Ltd.  All Rights Reserved. */
/* EmailSignup: Lifecycle Hooks */
Template.EmailVerification.onCreated( function() {
});

Template.EmailVerification.onRendered( function() {
 
  //this page would be redirected by reactivity depend on verified Boolean of the email
  var self = this;
  self.autorun(function() {
      if(Meteor.user().emails[0].verified){    
         Smartix.helpers.routeToTabClasses();
     }
   });
});

Template.EmailVerification.destroyed = function () {};

Template.EmailVerification.events({
  
  'click .resendVerifyEmail': function(event,template){
    //   log.info('clicked');
    //   log.info(Meteor.userId());
    //   Meteor.call('resendVerificationEmail');
       Meteor.call('smartix:accounts/resendVerificationEmail', function (err, res) {                    
            if(!err) {
                let message = TAPi18n.__('WelcomeVerification');
                toastr.info(message);
            } else {
                toastr.error(err.reason);
                let message = TAPi18n.__('Admin.VerificationIssue');
                log.error(err.reason);
            }
       });
    }
    
   , 'click .signOut': function () {
    Meteor.logout(
      function (err) {
        //remove all session variables when logout
        Session.clear();          
        Router.go('LoginSplash');
      }
    );
  }
  
});

Template.EmailVerification.helpers({
   
   unverifyEmail: function(){
       return Meteor.user().emails[0].address;
   }
      
});