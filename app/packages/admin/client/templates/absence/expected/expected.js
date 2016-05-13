Template.AdminAbsenceExpected.onCreated(function () {
    var self = this;
    if (Router
        && Router.current()
        && Router.current().params
        && Router.current().params.school
    ) {
        // subscribe to the school info first
        var schoolUsername = Router.current().params.school;
        self.subscribe('schoolInfo', schoolUsername, function () {
            var schoolNamespace = Smartix.Accounts.School.getNamespaceFromSchoolName(schoolUsername)
            if(schoolNamespace) {
                self.subscribe('smartix:absence/expectedAbsences', schoolNamespace, function () {
                    self.subscribe('smartix:absence/expectedAbsencesUsers', schoolNamespace, function () {
                        
                    })
                });
            } else {
                log.info("Could not find school with code " + schoolUsername);
            }
        })
    } else {
        log.info("Please specify a school to list the users for");
    }
    
    // Set defaults for the filter
    
    this.expectedAbsencesFilter = new ReactiveDict('expectedAbsencesFilter');
    this.expectedAbsencesFilter.set('from', moment(Date.now()).format("YYYY-MM-DD"));
    this.expectedAbsencesFilter.set('to', moment(Date.now()).add(1, 'day').format("YYYY-MM-DD"));
});

Template.AdminAbsenceExpected.helpers({
    filterStartDate: function () {
        return Template.instance().expectedAbsencesFilter.get('from');
    },
    filterEndDate: function () {
        return Template.instance().expectedAbsencesFilter.get('to');
    },
    expectedAbsence: function () {
        var dateFrom = Template.instance().expectedAbsencesFilter.get('from');
        var dateTo = Template.instance().expectedAbsencesFilter.get('to');
        
        // Assumes UTC+8
        var dateFromTS = moment.utc(dateFrom, "YYYY-MM-DD").startOf('day').subtract(8, 'hours').unix();
        var dateToTS = moment.utc(dateTo, "YYYY-MM-DD").startOf('day').subtract(8, 'hours').unix();
        
        return Smartix.Absence.Collections.expected.find({
            dateFrom: {
                $lt: dateToTS
            },
            dateTo: {
                $gte: dateFromTS
            },
            namespace: Smartix.Accounts.School.getNamespaceFromSchoolName(Router.current().params.school)
        });
    },
    userData: function () {
        return Meteor.users.findOne({
            _id: this.studentId
        })
    },
    startDateTime: function () {
        // This will be converted to the client's local timezone automatically
        return moment(this.dateFrom * 1000).format("DD-MM-YYYY HH:mm");
    },
    endDateTime: function () {
        // This will be converted to the client's local timezone automatically
        return moment(this.dateTo * 1000).format("DD-MM-YYYY HH:mm");
    }
});

Template.AdminAbsenceExpected.events({
    'click .AdminAbsenceExpected__unapprove': function () {
        Meteor.call('smartix:absence/unapproveExpectedAbsence', this._id);
    },
    'click .AdminAbsenceExpected__approve': function () {
        Meteor.call('smartix:absence/approveExpectedAbsence', this._id);
    },
    'click .AdminAbsenceExpected__updateFilter': function (event, template) {
        
    }
})