// server code
/*Mandrill.config({
 username: Meteor.settings.MANDRILL_API_USER,  // the email address you log into Mandrill with. Only used to set MAIL_URL.
 key: Meteor.settings.MANDRILL_API_KEY,  // get your Mandrill key from https://mandrillapp.com/settings/index
 port: 587,  // defaults to 465 for SMTP over TLS
 // host: 'smtp.mandrillapp.com',  // the SMTP host
 // baseUrl: 'https://mandrillapp.com/api/1.0/'  // update this in case Mandrill changes its API endpoint URL or version
 });*/

Mandrill.config({
  username: Meteor.settings.MANDRILL_USERNAME,   // the email address you l""og into Mandrill with. Only used to set MAIL_URL.
  key: Meteor.settings.MANDRILL_KEY,   // the email address you l""og into Mandrill with. Only used to set MAIL_URL.
  port: Meteor.settings.MANDRILL_PORT  // defaults to 465 for SMTP over TLS
  // host: 'smtp.mandrillapp.com',  // the SMTP host
  // baseUrl: 'https://mandrillapp.com/api/1.0/'  // update this in case Mandrill changes its API endpoint URL or version
});


/*log.info(Mandrill.users.ping());*/


Accounts.emailTemplates.verifyEmail.html = function (user, url) {
  return '<h1>welcome to Little Genius :) </h1><br> <h1>You re going to love it!</h1> <p>The first step is to <a href="' + url + '">verify your email</a>.</p>';
};
