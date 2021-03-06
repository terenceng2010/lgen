Template.AdminUsersSearch.onCreated(function () {
    var self = this;
    var schoolUsername = UI._globalHelpers['getCurrentSchoolName']();
    if (schoolUsername) {
        // subscribe to the school info first
        log.info('packages/admin/client/template/users/list#schoolUsername: ' + schoolUsername);
        var schoolNamespace = UI._globalHelpers['getCurrentSchoolId']();
        log.info('packages/admin/client/template/users/list#schoolNamespace: ' + schoolNamespace);
        if(schoolNamespace) {
            self.subscribe('smartix:accounts/allUsersInNamespace', schoolNamespace, function (err, res) {
            });
            self.namespace = schoolNamespace;
        }
    } else {
        log.info("Please specify a school to list the users for");
    }
    this.usersChecked = new ReactiveVar([]);
    this.doingOperations = new ReactiveVar(false);
    this.modalName = new ReactiveVar("");
    this.modalTitle = new ReactiveVar("");
    this.modalBody = new ReactiveVar("");
});

Template.AdminUsersSearch.events({
    'click .school-directory-user-checkbox':function(event,template){
        
        if( $(event.target).prop('checked') ) {
           let latestArray = template.usersChecked.get();
           //log.info($(event.target).val());
           latestArray.push( $(event.target).val() );
           template.usersChecked.set( latestArray  );            
        }else{
           let latestArray = template.usersChecked.get();
           //log.info($(event.target).val());
           lodash.pull(latestArray, $(event.target).val());
           template.usersChecked.set( latestArray  );              
        }      
    },

    'click .remove-users-btn':function(event,template){
        let latestArray = template.usersChecked.get();
        if(latestArray.indexOf(Meteor.userId()) > -1){
            toastr.info(TAPi18n.__("Admin.UserCannotRemoveSelf"));
            return;
        }
        let listOfUsers = Meteor.users.find({_id:{$in: latestArray }}).fetch();
        let listOfUserNames = listOfUsers.map(function(eachUserObj){
            return eachUserObj.profile.firstName + " " + eachUserObj.profile.lastName;
        })
        template.modalTitle.set(TAPi18n.__("Admin.UserRemoveConfirmation"));
        template.modalBody.set(listOfUserNames.join('<br/>'));
        template.modalName.set('remove-users-modal');
        Meteor.setTimeout(function(){
           $('#remove-users-modal-btn').click();  
        },200);    
    },
   'click .select-all-users-btn':function(event,template){
     var userObjects = Meteor.users.find( {},{ fields:{ _id: 1} } ).fetch();
     var userIds = lodash.map(userObjects,"_id");
     let latestArray = template.usersChecked.set(userIds);  
   },
   'click .select-all-users-current-page-btn':function(event,template){
      $('.school-directory-user-checkbox').each(function(index){
          if( $(this).prop('checked') ){
            //do nothing
          }else{
           let latestArray = template.usersChecked.get();
           log.info($(this).val());
           latestArray.push( $(this).val() );
           
           template.usersChecked.set( latestArray  );                
          }
      });
   },
   'click .deselect-all-users-current-page-btn':function(event,template){
      $('.school-directory-user-checkbox').each(function(index){
          if( $(this).prop('checked') ){
           let latestArray = template.usersChecked.get();
           log.info($(this).val());
           lodash.pull(latestArray, $(this).val());
                       
           template.usersChecked.set( latestArray  );                 
          }else{
            //do nothing
          }
      });
   },   
   'click .deselect-all-users-btn':function(event,template){
      template.usersChecked.set([]);
   },
    'click .add-users-to-role':function(event,template){
        let latestArray = template.usersChecked.get()
        let listOfUsers = Meteor.users.find({_id:{$in: latestArray }}).fetch();
        var selectedRole = document.getElementById('selected-role').value;        
        let listOfUserNames = listOfUsers.map(function(eachUserObj){
            return eachUserObj.profile.firstName + " " + eachUserObj.profile.lastName;
        })
        template.modalTitle.set("Do you really want to add role "+ selectedRole +" to the selected users?");
        template.modalBody.set(listOfUserNames.join('<br/>'));
        template.modalName.set('add-users-to-role-modal');
        Meteor.setTimeout(function(){
           $('#add-users-to-role-modal-btn').click();  
        },200); 
                
        /*
        if (window.confirm("Do you really want to add role "+ selectedRole +" to the selected users?:\n"+listOfUsers)) {
            
            //show spinner
            template.doingOperations.set(true);
            
            Meteor.call('smartix:accounts-schools/assignSchoolRole',template.namespace,latestArray,selectedRole,function(){
                //hide spinner
                template.doingOperations.set(false);
            });
        }*/         
    },
    'click .remove-users-from-role':function(event,template){
        let latestArray = template.usersChecked.get()
     
        if(latestArray.indexOf(Meteor.userId()) > -1 && selectedRole === 'admin'){
            toastr.info(TAPi18n.__("Admin.UserCannotRemoveAdminRole"));
            return;
        }

        let listOfUsers = Meteor.users.find({_id:{$in: latestArray }}).fetch();
        var selectedRole = document.getElementById('selected-role').value;
        let listOfUserNames = listOfUsers.map(function(eachUserObj){
            return eachUserObj.profile.firstName + " " + eachUserObj.profile.lastName;
        })
        template.modalTitle.set("Do you really want to remove role "+ selectedRole +" from the selected users?");
        template.modalBody.set(listOfUserNames.join('<br/>'));
        template.modalName.set('remove-users-from-role-modal');
        Meteor.setTimeout(function(){
           $('#remove-users-from-role-modal-btn').click();  
        },200);
    },

    'click .resend-email-to-user':function(event, template){
        let latestArray = template.usersChecked.get();
        let listOfUsers = Meteor.users.find({_id:{$in: latestArray }}).fetch();
        //log.info(listOfUsers);
        Meteor.call('smartix:accounts-schools/resendEmail',
            UI._globalHelpers['getCurrentSchoolName'](),
            listOfUsers, function (err, res) {
            if(!err) {
                let message = TAPi18n.__('Admin.VerificationConfirmation');
                toastr.info(message);
            } else {
                let message = TAPi18n.__('Admin.VerificationIssue');
                toastr.error(message);
                log.error(err.reason);
            }
        });
    },
    
    'click .modal .save':function(event,template){
        if( $(event.target).hasClass('remove-users-modal') ){
            let latestArray = template.usersChecked.get();
            //show spinner
            template.doingOperations.set(true);          
            //hide modal
            $('.modal .close').click();      
            //call method to delete users
            Meteor.call('smartix:accounts-schools/deleteSchoolUsers',template.namespace,latestArray,function(){
                //when finished:
                //hide spinner
                template.doingOperations.set(false);          
                //un-select all users
                template.usersChecked.set([]);             
            });            
        }else if( $(event.target).hasClass('add-users-to-role-modal') ){
            var selectedRole = document.getElementById('selected-role').value;               
            let latestArray = template.usersChecked.get();
            //show spinner
            template.doingOperations.set(true);          
            //hide modal
            $('.modal .close').click();        
            //call method to add users to role
            Meteor.call('smartix:accounts-schools/assignSchoolRole',template.namespace,latestArray,selectedRole,function(){
                //hide spinner
                template.doingOperations.set(false);
            });                  
        }else if( $(event.target).hasClass('remove-users-from-role-modal')  ){
            var selectedRole = document.getElementById('selected-role').value;               
            let latestArray = template.usersChecked.get();
            //show spinner
            template.doingOperations.set(true);          
            //hide modal
            $('.modal .close').click();
              
            //call method to remove users from role
            Meteor.call('smartix:accounts-schools/retractSchoolRole',template.namespace,latestArray,selectedRole,function(){
                //hide spinner
                template.doingOperations.set(false);
            });                       
        }
    },
    'click .filter-by-role-btn':function(event,template){
       var chosenRole =  $(event.target).data('role');
        UsersIndex.getComponentMethods().addProps('schoolNamespace', template.namespace);
        UsersIndex.getComponentMethods().addProps('role', chosenRole);
               
    }
});

Template.AdminUsersSearch.helpers({
    doingOperations:function(){
        return Template.instance().doingOperations.get();
    },

    getUserEmail:function(){
        if(this.emails){
            return this.emails[0].address;
        }
    },

    getUserRoles:function(){
        var schoolId = UI._globalHelpers['getCurrentSchoolId']();
        if(schoolId){
            let role = "";
            if(this.roles) {
                role = this.roles[schoolId].toString();//in English
                role = TAPi18n.__ ( role);
            }
            return role;
        }
    },

    getUserId:function(){
        return this._id;
    },

    isUserChecked:function(){
        //log.info(this._id )
        //log.info(Template.instance().usersChecked.get());
        return (  Template.instance().usersChecked.get().indexOf(this._id) !== -1 ) ? "checked" : "";
    },
    totalUserCount:function(){
        return Meteor.users.find( {},{ fields:{ _id: 1} } ).count();
    },
    totalSelectUserCount:function(){
        return Template.instance().usersChecked.get().length;
    },
    showOptions:function(){
        return Template.instance().usersChecked.get().length > 0 ;

    }

  , usersIndex: function () {
      if (Template.instance().subscriptionsReady()) {
        return UsersIndex;
      }
  },
  // routeData: function () {
  //       return {
  //           uid: this._id,
  //           school: UI._globalHelpers['getCurrentSchoolName']()
  //       };
  //   },
    userSearchInputAttributes: function () {
        return {
            placeholder: TAPi18n.__("Admin.FilterUser"),
            class: "form-control",
            id: "AdminUsersSearchInput"
        }
    },
    getModalName:function(){
        return Template.instance().modalName.get();
    },
    getModalTitle:function(){
        return Template.instance().modalTitle.get();        
    },
    getModalBody:function(){
        return Template.instance().modalBody.get();       
    }
});