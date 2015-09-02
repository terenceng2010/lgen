var targetStringVar = ReactiveVar([]);
var targetString=[];
var targetIds= ReactiveVar([]);
/*****************************************************************************/
/* ChatInvite: Event Handlers */
/*****************************************************************************/
Template.ChatInvite.events({
  'click .startChatBtn':function(){
    /*var chatArr =  $('.js-example-basic-multiple').val();*/
    Meteor.call('chat/create',targetIds.get(),function(err,data){
          Router.go('ChatRoom',{chatRoomId:data});
      });

    /*console.log($('.js-example-basic-multiple').val());*/
  },
  'change .targetCB':function(){
    targetString= [];
    targetIds.set([]);
    var localarr= [];
    $(".targetCB:checked").each(function(index,el){
      localarr.push($(el).val());
      targetString.push($(el).data("fullname"));
    });
    targetStringVar.set(targetString);
    targetIds.set(localarr);

  }
});

/*****************************************************************************/
/* ChatInvite: Helpers */
/*****************************************************************************/
Template.ChatInvite.helpers({
  'classesJoinedOwner':function(){
    var classesJoinedOwner = Meteor.users.find({_id:{$nin:[Meteor.userId()]}}).fetch();
    if(classesJoinedOwner.length<1){
      return false;
    }else{
      return classesJoinedOwner;
    }
  },
  userName:function(profile){
    return getFullNameByProfileObj(profile);
  },
  targetCB:function(){

  },
  tagertList:function(){
    return targetStringVar.get();
  },
  shouldhide:function () {
    return targetIds.get().length>0?"":"hide";
  }
});

/*****************************************************************************/
/* ChatInvite: Lifecycle Hooks */
/*****************************************************************************/
Template.ChatInvite.created = function () {
};

Template.ChatInvite.rendered = function () {
  // $(".js-example-basic-multiple").select2({
  //   tags: true,
  //   tokenSeparators: [',', ' '],
  //   width:"100%"
  //   });
};

Template.ChatInvite.destroyed = function () {
};
