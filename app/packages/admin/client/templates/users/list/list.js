Template.AdminUsersSearch.onCreated(function () {
    var self = this;
    if (Router
        && Router.current()
        && Router.current().params
        && Router.current().params.school
    ) {
        // subscribe to the school info first
        var schoolUsername = Router.current().params.school;
        console.log('packages/admin/client/template/users/list#schoolUsername: ' + schoolUsername);
        self.subscribe('schoolInfo', schoolUsername, function () {
            var schoolNamespace = Smartix.Accounts.School.getNamespaceFromSchoolName(schoolUsername)
            if(schoolNamespace) {
                self.subscribe('smartix:accounts/allUsersInNamespace', Smartix.Accounts.School.getNamespaceFromSchoolName(schoolUsername));
            }
        })
    } else {
        console.log("Please specify a school to list the users for");
    }
});

Template.AdminUsersSearch.helpers({
  usersIndex: function () {
      if (Template.instance().subscriptionsReady()) {
        return UsersIndex;
      }
  },
  routeData: function () {
        if (Template.instance().subscriptionsReady()
            && Router
            && Router.current()) {
            return {
                uid: this._id,
                school: Router.current().params.school
            };
        }
    }
});