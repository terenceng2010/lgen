Template.AdminDistributionListsAdd.onCreated(function(){
    var schoolId = UI._globalHelpers['getCurrentSchoolId']();
    this.subscribe('smartix:distribution-lists/listsBySchoolId', schoolId);

    var schoolId = UI._globalHelpers['getCurrentSchoolId']();
    this.subscribe('smartix:accounts/allUsersInNamespace', schoolId);
});

Template.AdminDistributionListsAdd.events({
    'click #addDistributionList-submit': function (event, template) {
        event.preventDefault();
        var schoolName =  UI._globalHelpers['getCurrentSchoolName']();
        //var schoolId   =  UI._globalHelpers['getCurrentSchoolId']();
        var distlistName = template.$('#addDistributionList-name').eq(0).val();
        var code = "";
        // Checks that the values are not empty
        if(!schoolName) {
            toastr.error(TAPi18n.__("applicationError.refreshRequired"));
        }
        if(!distlistName) {
            toastr.error(TAPi18n.__("Admin.ListNameRequired"));
        }
        if(schoolName && distlistName) {
            Meteor.call('smartix:distribution-lists/create', [], schoolName, distlistName, code,function(err,result){
                //result is the new distribution list entry's id
                if (result) {
                    //log.info('distributionId', result);
                    var newDistributionList = Smartix.Groups.Collection.findOne(result);
                    //log.info(newDistributionList);
                    toastr.info(TAPi18n.__("Admin.DistributionList") + newDistributionList.name + TAPi18n.__("Admin.CreatedSuccessfully"));
                    Router.go('admin.lists.view', { school: schoolName, code: newDistributionList.url });
                } else {
                    var existingDistributionList = Smartix.Groups.Collection.findOne({name: name});
                    if(existingDistributionList){
                        toastr.info(TAPi18n.__("Admin.DistributionList") + TAPi18n.__("Admin.AlreadyExists") +' ' + TAPi18n.__("Redirecting") );
                        Router.go('admin.lists.view', { school: schoolName, code: existingDistributionList.url });
                    }else{
                        toastr.error(TAPi18n.__("Admin.DistributionListsFailed"));
                    }
                }
            });
        }
    }
});