var postHooks = {
  before:{
    insert:function(doc){
      if(!doc.classCode){
        var beforeHash = Meteor.user().email + doc.className;
        var rString = randomString(6);
        doc.classCode  = CryptoJS.SHA1(rString,beforeHash).toString().substring(0,6);
      }
      doc.joinedUserId=[];
      doc.messagesObj=[];
      return doc;
    }
  },
  onSuccess: function(operation, result, template) {
        // display success, reset form status

    Meteor.call('addClassMail',Meteor.user().emails[0].address,result,function(err,res){
        err?alert(err):Router.go('Classes');
    });
  }
}

AutoForm.addHooks('insertClass', postHooks);
