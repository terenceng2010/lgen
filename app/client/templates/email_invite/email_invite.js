var contactList = ReactiveVar("");
var contactsObj ;
var searchText = ReactiveVar("");
var classObj ;
/*****************************************************************************/
/* EmailInvite: Event Handlers */
/*****************************************************************************/
Template.EmailInvite.events({
  'click .inviteBtn':function(e){
    $(e.target).data('id')
  },
  'click .button':function(e){

    var classObj = Classes.findOne();



    var id  = $(e.target).data("id");
    var targerObj = lodash.findByValues2(contactsObj,"id",id)
    var targetEmails= lodash.map(targerObj[0].emails,"value");
    var targetFirstEmail = targetEmails[0];



    Meteor.call("class/invite",classObj,targetFirstEmail,function(err){
        err?alert(err.reason):alert("success");
    });

  },
  'keyup .searchbar':function(){
    searchText.set($(".searchbar").val());
  }


});

/*****************************************************************************/
/* EmailInvite: Helpers */
/*****************************************************************************/
Template.EmailInvite.helpers({
  classObj:function(){
    return Classes.findOne();
  },
  inviteClassSchema:Schema.inviteClass,
  contactList:function(){
      return contactList.get();
  },
  getName:function(contactObj){
    if(contactObj.displayName!==null)
      return contactObj.displayName;
    else if(contactObj.nickname!==null)
      return contactObj.nickname;
    else
      return contactObj.name.formatted;
  },
  isSearched:function(contactObj){
    var name ="";
    if(contactObj.displayName!==null)
      name =  contactObj.displayName;
    else if(contactObj.nickname!==null)
      name =  contactObj.nickname;
    else
      name = contactObj.name.formatted;

    return lodash.includes(name.toUpperCase(),searchText.get().toUpperCase());
  }
});

/*****************************************************************************/
/* EmailInvite: Lifecycle Hooks */
/*****************************************************************************/
Template.EmailInvite.created = function () {
  if (Meteor.isCordova) {
    var options      = new ContactFindOptions();
    options.filter   = "";
    options.multiple = true;
    /*options.desiredFields = [navigator.contacts.fieldType.id];*/
    var fields       = [navigator.contacts.fieldType.displayName, navigator.contacts.fieldType.name];
    navigator.contacts.find(fields, onSuccess, onError, options);
  }else{
    contactList.set([]);
  }
};

Template.EmailInvite.rendered = function () {
};

Template.EmailInvite.destroyed = function () {
};

function onSuccess(contacts) {
    /*alert('Found ' + contacts.length + ' contacts.');*/

    contacts = lodash.filter(contacts,function(item){
                  return item.emails!==null;
                });

    contactsObj = contacts;


    contactList.set(contacts);
}

function onError(contactError) {
    alert('onError!');
}
