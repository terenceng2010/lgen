Template.SchoolUserListItem.helpers({
  getUserEmail:function(){
      if(this.emails){
       return this.emails[0].address;
      }
  },
  getUserRoles:function(){
      var schoolUsername = Router.current().params.school;
      var schoolNamespace = Smartix.Accounts.School.getNamespaceFromSchoolName(schoolUsername);
      
      if(schoolNamespace){
          if(this.roles)
          return this.roles[schoolNamespace].toString();
      }            

  },
  getCurrentSchoolName:function(){
      return Router.current().params.school;
  },
  getUserId:function(){
      return this._id;
  }
});

Template.SchoolUserListItem.onCreated(function(){

    SchoolUserPages.set({
        filters:{
            schools: 'zt6ezNMXLM4bWqsRW'
        }
    });
    
});

Template.SchoolUserList.helpers({
    getTotalUserCount:function(){
        return Meteor.users.find().count();
    }
});