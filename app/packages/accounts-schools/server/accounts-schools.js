Smartix = Smartix || {};
Smartix.Accounts = Smartix.Accounts || {};
Smartix.Accounts.School = Smartix.Accounts.School || {};



Smartix.Accounts.School.isMember = function(currentUser, schoolId) {
    check(schoolId, String);
    check(currentUser, Match.Maybe(String));
    
    // Get the `_id` of the currently-logged in user
    if(!(currentUser === null)) {
        currentUser = currentUser || Meteor.userId();
    }

    return Roles.userIsInRole(currentUser, Smartix.Accounts.School.VALID_USER_TYPES, schoolId);
};

Smartix.Accounts.School.getAllSchoolUsers = function (namespace, currentUser) {
    
    check(namespace, String);
    check(currentUser, Match.Maybe(String));
    
    // Get the `_id` of the currently-logged in user
    if(!(currentUser === null)) {
        currentUser = currentUser || Meteor.userId();
    }
    
    // Check if the user has permission for this school
    Smartix.Accounts.School.isAdmin(namespace, currentUser);
    
    // Get the `_id` of the school from its username
    var schoolDoc = SmartixSchoolsCol.findOne({
        _id: namespace
    });
    
    if(schoolDoc) {
        return Meteor.users.find({
            schools: schoolDoc._id
        });
    }
    return false;
}

Smartix.Accounts.School.getAllSchoolStudents = function (namespace, currentUser) {
    
    check(namespace, String);
    check(currentUser, Match.Maybe(String));
    
    // Get the `_id` of the currently-logged in user
    if(!(currentUser === null)) {
        currentUser = currentUser || Meteor.userId();
    }
    
    // Check if the user has permission for this school
    Smartix.Accounts.School.isAdmin(namespace, currentUser);
    
    // Get the `_id` of the school from its username
    var schoolDoc = SmartixSchoolsCol.findOne({
        _id: namespace
    });
    
    var queryObj = {};
    if(schoolDoc) {
        queryObj.schools = schoolDoc._id;
        var tempRoles = "roles." + schoolDoc._id + '.0';
        queryObj[tempRoles] = 'student';
        return Meteor.users.find(queryObj);
    }
    
    return false;
}

Smartix.Accounts.School.createUser = function(school, options) {
    // Check the arguments provided are of the correct type
    check(school, String);
    check(options, Object);

    // Check if the user has permission to
    // create a new user for this school
    // They must either be a school admin
    // Or system admin
    if (!Smartix.Accounts.School.isAdmin(school) && !Smartix.Accounts.System.isAdmin()) {
        log.info(NOT_AUTH);
        throw new Meteor.Error("not-auth", NOT_AUTH);
    }

    // Check if the roles indicated are valid roles
    if (!options.roles.every(function(role) {
        return Smartix.Accounts.School.VALID_USER_TYPES.indexOf(role) > -1;
    })) {
        log.info(NOT_VALID_ROLE);
        throw new Meteor.Error("not-valid-role", NOT_VALID_ROLE);
    }


    var newUserId;
    if (options.email) {

        // Check if a user with this email already exists
        var existingUser = Meteor.users.findOne({ 'emails.0.address': options.email })

        // If the user already exists
        // add the user to the role for this school
        // and return the existing user
        if (existingUser) {
            // console.log(TRY_ADD_ROLE_TO_EXISTING_USR)
            Roles.addUsersToRoles(existingUser, options.roles, school);
            return existingUser._id;
        } else {

            // If the user is new, generate a new user object
            newUserId = Accounts.createUser({
                email: options.email,
                profile: options.profile,
                username: Smartix.Accounts.helpers.generateUniqueUserName(options.profile.firstName, options.profile.lastName)
            });
        }
    } else {
        newUserId = Accounts.createUser({
            profile: options.profile,
            username: Smartix.Accounts.helpers.generateUniqueUserName(options.profile.firstName, options.profile.lastName)
        });
    }

    Roles.addUsersToRoles(newUserId, options.roles, school);

    Accounts.sendEnrollmentEmail(newUserId);

    return newUserId;
}

Smartix.Accounts.School.canCreateUser = function(namespace, types, currentUser) {
    
    check(namespace, String);
    check(currentUser, Match.Maybe(String));
    
    // Get the `_id` of the currently-logged in user
    if(!(currentUser === null)) {
        currentUser = currentUser || Meteor.userId();
    }
    
    // Check if the type given is one of the valid types
    check(types, Match.Where(function(val) {
        if (!Array.isArray(types)) {
            return false;
        }
        _.each(val, function(type) {
            if (Smartix.Accounts.School.VALID_USER_TYPES.indexOf(val) < 0) {
                return false;
            }
        });
        return true;
    }));

    // Only admin users can create other users
    return Smartix.Accounts.School.isAdmin(namespace, currentUser);
}

Smartix.Accounts.School.canGetUserInfo = function(userId, namespace, currentUser) {

    check(userId, Match.Maybe(String));
    check(namespace, String);
    check(currentUser, Match.Maybe(String));

    // Get the `_id` of the currently-logged in user
    if (!(currentUser === null)) {
        currentUser = currentUser || Meteor.userId();
    }
    
    // Return `true` if
    // The user info requested is by the current user
    return userId === currentUser
        // Or if the currently-logged in user is an admin for the school, and the user being requested has approved the school
        || (Smartix.Accounts.School.isAdmin(namespace, currentUser) && Smartix.Accounts.School.userHasApproved(namespace, userId))
        // Or if your are the system administrator  
        || Smartix.Accounts.System.isAdmin(currentUser);
}

Smartix.Accounts.School.canRemoveUser = function(userId, namespace, currentUser) {

    check(userId, Match.Maybe(String));
    check(namespace, String);
    check(currentUser, Match.Maybe(String));

    // Get the `_id` of the currently-logged in user
    if (!(currentUser === null)) {
        currentUser = currentUser || Meteor.userId();
    }

    // Return `true` if
    // The user info requested is by the current user
    return userId === currentUser
        // Or if the currently-logged in user is an admin for the school
        || Smartix.Accounts.School.isAdmin(namespace, currentUser)
        // Or if your are the system administrator  
        || Smartix.Accounts.System.isAdmin(currentUser);
}

Smartix.Accounts.School.isAdmin = function(namespace, currentUser) {

    check(namespace, String);
    check(currentUser, Match.Maybe(String));

    // Get the `_id` of the currently-logged in user
    if (!(currentUser === null)) {
        currentUser = currentUser || Meteor.userId();
    }

    // Return `true` if the user is system administrator
    return Smartix.Accounts.System.isAdmin(currentUser)
        // Or has the role of `admin` for the namespace
        || (Roles.userIsInRole(currentUser, 'admin', namespace)
            // AND they've approved the school in the form of adding it to the `school` array in their user document
            && Smartix.Accounts.School.userHasApproved(namespace, currentUser))
}

Smartix.Accounts.School.canImportStudents = Smartix.Accounts.School.canImportTeachers = Smartix.Accounts.School.canImportParents = function(namespace, currentUser) {
    
    check(namespace, String);
    check(currentUser, Match.Maybe(String));
    
    // Get the `_id` of the currently-logged in user
    if(!(currentUser === null)) {
        currentUser = currentUser || Meteor.userId();
    }

    // Only admin users can import users
    return Smartix.Accounts.School.isAdmin(namespace, currentUser);
}

Smartix.Accounts.School.isTeacher = function(namespace, currentUser) {

    check(namespace, String);
    check(currentUser, Match.Maybe(String));

    // Get the `_id` of the currently-logged in user
    if (!(currentUser === null)) {
        currentUser = currentUser || Meteor.userId();
    }

    // Return `true` if user has the role of `teacher` for the namespace
    return Roles.userIsInRole(currentUser, Smartix.Accounts.School.TEACHER , namespace)
            // AND they've approved the school in the form of adding it to the `school` array in their user document
            && Smartix.Accounts.School.userHasApproved(namespace, currentUser)
}

Smartix.Accounts.School.userHasApproved = function(namespace, userId) {

    check(namespace, String);
    check(userId, Match.Maybe(String));

    // Get the `_id` of the currently-logged in user
    userId = userId || Meteor.userId();

    var userDoc = Meteor.users.findOne({
        _id: userId
    });

    // If the current user does not exists
    if (!userDoc) {
        return false;
        // OPTIONAL: Throw error indicating user does not exist
        // Or is not logged on
    }

    if (!userDoc.schools) {
        return false;
    }

    return userDoc.schools.indexOf(namespace) > -1
}

Smartix.Accounts.School.canGetBasicInfoOfAllUsers = function(namespace, currentUser) {

    check(namespace, String);
    check(currentUser, Match.Maybe(String));

    // Get the `_id` of the currently-logged in user
    if (!(currentUser === null)) {
        currentUser = currentUser || Meteor.userId();
    }

    // Only school administrators and teachers can get basic info of all users in the namespace
    return Smartix.Accounts.School.isTeacher(namespace, currentUser)
        || Smartix.Accounts.School.isAdmin(namespace, currentUser);
}

Smartix.Accounts.School.canGetAllUsers = function(namespace, currentUser) {

    check(namespace, String);
    check(currentUser, Match.Maybe(String));

    // Get the `_id` of the currently-logged in user
    if (!(currentUser === null)) {
        currentUser = currentUser || Meteor.userId();
    }

    // Only school administrators and teachers can get basic info of all users in the namespace
    return Smartix.Accounts.School.isTeacher(namespace, currentUser)
        || Smartix.Accounts.School.isAdmin(namespace, currentUser);
}

Smartix.Accounts.School.getNamespaceFromSchoolName = function(schoolName) {

    check(schoolName, String);

    // Get the `_id` of the school from its username
    var schoolDoc = SmartixSchoolsCol.findOne({
        username: schoolName
    });
    return schoolDoc ? schoolDoc._id : false;
}

Smartix.Accounts.School.importStudentSchema = new SimpleSchema({
    studentId: {
        type: String,
        optional: true,
        custom: function() {
            // Checks if email is set, if so, this is optional
        }
    },
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    email: {
        type: String,
        optional: true,
        custom: function() {
            // Checks if studentId is set, if so, this is optional
        }
    },
    grade: {
        type: String
    },
    classroom: {
        type: String
    },
    gender: {
        type: String
    },
    dob: {
        type: String
    },
    tel: {
        type: String,
        optional: true
    },
    password: {
        type: String,
        optional: true
    }
});

Smartix.Accounts.School.importStudent = function(namespace, data, currentUser) {

    check(namespace, String);
    check(data, [Smartix.Accounts.School.importStudentSchema]);
    check(currentUser, Match.Maybe(String));

    // Get the `_id` of the currently-logged in user
    if (!(currentUser === null)) {
        currentUser = currentUser || Meteor.userId();
    }
    
    if(!Smartix.Accounts.School.canImportStudents(namespace, currentUser)) {
        throw new Meteor.Error("permission-denied", "The user does not have permission to perform this action.");
    }
    
    let newUsers = [];
    let errors = [];

    _.each(data, function(user, i, users) {
        try {
            let email = user.email;
            user.profile = {};
            user.profile.firstName = user.firstName;
            user.profile.lastName = user.lastName;

            if (user.dob) {
                user.dob = moment(user.dob, ["DD/MM/YYYY", "DD-MM-YYYY"]).toString();
                // user.dob = new Date(user.dob).toISOString();
            }

            delete user.firstName;
            delete user.lastName;
            delete user.email;
            
            let newUserId = Smartix.Accounts.createUser(email, user, namespace, ['student'], currentUser);
            
            if(typeof newUserId === "string") {
                newUsers.push(newUserId);
            } else {
                errors.push(newUserId);
            }
        } catch(e) {
            errors.push(e);
        }
    });
    
    return {
        newUsers: newUsers,
        errors: errors
    }
}

var importParentsCheckIfMotherExists = function(data) {
    if(!data.isSet) {
        let motherFirstName = data.field('motherFirstName');
        let motherLastName = data.field('motherLastName');
        let motherEmail = data.field('motherEmail');
        
        // If all three of the mother's mandatory fields are set,
        // The father records are not required
        if(motherFirstName.isSet
        && motherLastName.isSet
        && motherEmail.isSet) {
            return true;
        } else {
            return "At least one of the mother/father details must be complete."
        }
    }
}

var importParentsCheckIfFatherExists = function(data) {
    if(!data.isSet) {
        let fatherFirstName = data.field('fatherFirstName');
        let fatherLastName = data.field('fatherLastName');
        let fatherEmail = data.field('fatherEmail');
        
        // If all three of the father's mandatory fields are set,
        // The mother records are not required
        if(fatherFirstName.isSet
        && fatherLastName.isSet
        && fatherEmail.isSet) {
            return true;
        } else {
            return "At least one of the mother/father details must be complete."
        }
    }
}

var canIdentifyStudent = function(data) {
    let studentId = data.field('studentId');
    let studentEmail = data.field('studentEmail');
    if(studentId.isSet || studentEmail.isSet) {
        return true;
    } else {
        return "At least one of Student ID or Student Email Address must be specified";
    }
}

Smartix.Accounts.School.importParentsSchema = new SimpleSchema({
    studentId: {
        type: String,
        label: "Student ID",
        optional: true,
        custom: function () {
            return canIdentifyStudent(this);
        }
    },
    studentEmail: {
        type: String,
        label: "Student E-mail",
        regEx: SimpleSchema.RegEx.Email,
        optional: true,
        custom: function () {
            return canIdentifyStudent(this);
        }
    },
    motherSalutation: {
        type: String,
        label: "Mother Salutation",
        optional: true
    },
    motherFirstName: {
        type: String,
        label: "Mother First Name",
        optional: true,
        custom: function() {
            return importParentsCheckIfFatherExists(this);
        }
    },
    motherLastName: {
        type: String,
        label: "Mother Last Name",
        optional: true,
        custom: function() {
            return importParentsCheckIfFatherExists(this);
        }
    },
    motherEmail: {
        type: String,
        label: "Mother E-mail",
        regEx: SimpleSchema.RegEx.Email,
        optional: true,
        custom: function() {
            return importParentsCheckIfFatherExists(this);
        }
    },
    motherMobile: {
        type: String,
        label: "Mother Mobile",
        optional: true
    },
    fatherSalutation: {
        type: String,
        label: "Father Salutation",
        optional: true
    },
    fatherFirstName: {
        type: String,
        label: "Father First Name",
        optional: true,
        custom: function() {
            return importParentsCheckIfMotherExists(this);
        }
    },
    fatherLastName: {
        type: String,
        label: "Father Last Name",
        optional: true,
        custom: function() {
            return importParentsCheckIfMotherExists(this);
        }
    },
    fatherEmail: {
        type: String,
        label: "Father E-mail",
        regEx: SimpleSchema.RegEx.Email,
        optional: true,
        custom: function() {
            return importParentsCheckIfMotherExists(this);
        }
    },
    fatherMobile: {
        type: String,
        label: "Father Mobile",
        optional: true
    },
    motherEmployer: {
        type: String,
        label: "Mother Employer",
        optional: true
    },
    motherNationality: {
        type: String,
        label: "Mother Nationality",
        optional: true
    },
    motherLanguage: {
        type: String,
        label: "Mother Language",
        optional: true
    },
    motherHomeAddress1: {
        type: String,
        label: "Mother Home Address Line 1",
        optional: true
    },
    motherHomeAddress2: {
        type: String,
        label: "Mother Home Address Line 2",
        optional: true
    },
    motherHomeCity: {
        type: String,
        label: "Mother Home City",
        optional: true
    },
    motherHomeState: {
        type: String,
        label: "Mother Home State/Province",
        optional: true
    },
    motherHomePostalCode: {
        type: String,
        label: "Mother Home Postal Code",
        optional: true
    },
    motherHomeCountry: {
        type: String,
        label: "Mother Home Country",
        optional: true
    },
    motherHomePhone: {
        type: String,
        label: "Mother Home Phone Number",
        optional: true
    },
    motherWorkAddress1: {
        type: String,
        label: "Mother Work Address Line 1",
        optional: true
    },
    motherWorkAddress2: {
        type: String,
        label: "Mother Work Address Line 2",
        optional: true
    },
    motherWorkCity: {
        type: String,
        label: "Mother Work City",
        optional: true
    },
    motherWorkState: {
        type: String,
        label: "Mother Work State/Province",
        optional: true
    },
    motherWorkPostalCode: {
        type: String,
        label: "Mother Work Postal Code",
        optional: true
    },
    motherWorkCountry: {
        type: String,
        label: "Mother Work Country",
        optional: true
    },
    motherWorkPhone: {
        type: String,
        label: "Mother Work Phone Number",
        optional: true
    },
    fatherEmployer: {
        type: String,
        label: "Father Employer",
        optional: true
    },
    fatherNationality: {
        type: String,
        label: "Father Nationality",
        optional: true
    },
    fatherLanguage: {
        type: String,
        label: "Father Language",
        optional: true
    },
    fatherHomeAddress1: {
        type: String,
        label: "Father Home Address Line 1",
        optional: true
    },
    fatherHomeAddress2: {
        type: String,
        label: "Father Home Address Line 2",
        optional: true
    },
    fatherHomeCity: {
        type: String,
        label: "Father Home City",
        optional: true
    },
    fatherHomeState: {
        type: String,
        label: "Father Home State/Province",
        optional: true
    },
    fatherHomePostalCode: {
        type: String,
        label: "Father Home Postal Code",
        optional: true
    },
    fatherHomeCountry: {
        type: String,
        label: "Father Home Country",
        optional: true
    },
    fatherHomePhone: {
        type: String,
        label: "Father Home Phone Number",
        optional: true
    },
    fatherWorkAddress1: {
        type: String,
        label: "Father Work Address Line 1",
        optional: true
    },
    fatherWorkAddress2: {
        type: String,
        label: "Father Work Address Line 2",
        optional: true
    },
    fatherWorkCity: {
        type: String,
        label: "Father Work City",
        optional: true
    },
    fatherWorkState: {
        type: String,
        label: "Father Work State/Province",
        optional: true
    },
    fatherWorkPostalCode: {
        type: String,
        label: "Father Work Postal Code",
        optional: true
    },
    fatherWorkCountry: {
        type: String,
        label: "Father Work Country",
        optional: true
    },
    fatherWorkPhone: {
        type: String,
        label: "Father Work Phone Number",
        optional: true
    }
});

var convertStudentObjectToMother = function (student) {
    
    check(student, Object);
    
    let motherUserObj = {};
        
    if(student.motherSalutation) {
        motherUserObj.salutation = student.motherSalutation;
    }

    if(student.motherFirstName) {
        motherUserObj.profile = motherUserObj.profile || {};
        motherUserObj.profile.firstName = student.motherFirstName;
    }

    if(student.motherLastName) {
        motherUserObj.profile = motherUserObj.profile || {};
        motherUserObj.profile.lastName =  student.motherLastName;
    }

    if(student.motherMobile) {
        motherUserObj.tel = motherUserObj.mobile = student.motherMobile;
    }

    if(student.motherEmployer) {
        motherUserObj.employer =  student.motherEmployer;
    }

    if(student.motherNationality) {
        motherUserObj.nationality = student.motherNationality;
    }

    if(student.motherLanguage) {
        motherUserObj.language = student.motherLanguage;
        motherUserObj.lang = Smartix.Utilities.getLanguageCode(student.motherLanguage);
    }

    if(student.motherHomeAddress1) {
        motherUserObj.homeAddress1 = student.motherHomeAddress1;
    }

    if(student.motherHomeAddress2) {
        motherUserObj.homeAddress2 = student.motherHomeAddress2;
    }

    if(student.motherHomeCity) {
        motherUserObj.homeCity = motherUserObj.city = student.motherHomeCity;
    }

    if(student.motherHomeState) {
        motherUserObj.homeState = student.motherHomeState;
    }

    if(student.motherHomePostalCode) {
        motherUserObj.homePostalCode = student.motherHomePostalCode;
    }

    if(student.motherHomeCountry) {
        motherUserObj.homeCountry = student.motherHomeCountry;
    }

    if(student.motherHomePhone) {
        motherUserObj.homePhone = student.motherHomePhone;
    }

    if(student.motherWorkAddress1) {
        motherUserObj.workAddress1 = student.motherWorkAddress1;
    }

    if(student.motherWorkAddress2) {
        motherUserObj.workAddress2 = student.motherWorkAddress2;
    }

    if(student.motherWorkCity) {
        motherUserObj.workCity = student.motherWorkCity;
    }

    if(student.motherWorkState) {
        motherUserObj.workState = student.motherWorkState;
    }

    if(student.motherWorkPostalCode) {
        motherUserObj.workPostalCode = student.motherWorkPostalCode;
    }

    if(student.motherWorkCountry) {
        motherUserObj.workCountry = student.motherWorkCountry;
    }

    if(student.motherWorkPhone) {
        motherUserObj.workPhone = student.motherWorkPhone;
    }

    motherUserObj.gender = 'Female';
    
    return motherUserObj;
}


var convertStudentObjectToFather = function (student) {
    
    check(student, Object);
    
    let fatherUserObj = {};
        
    if(student.fatherSalutation) {
        fatherUserObj.salutation = student.fatherSalutation;
    }

    if(student.fatherFirstName) {
        fatherUserObj.profile = fatherUserObj.profile || {};
        fatherUserObj.profile.firstName = student.fatherFirstName;
    }

    if(student.fatherLastName) {
        fatherUserObj.profile = fatherUserObj.profile || {};
        fatherUserObj.profile.lastName =  student.fatherLastName;
    }

    if(student.fatherMobile) {
        fatherUserObj.tel = fatherUserObj.mobile = student.fatherMobile;
    }

    if(student.fatherEmployer) {
        fatherUserObj.employer =  student.fatherEmployer;
    }

    if(student.fatherNationality) {
        fatherUserObj.nationality = student.fatherNationality;
    }

    if(student.fatherLanguage) {
        fatherUserObj.language = student.fatherLanguage;
        fatherUserObj.lang = Smartix.Utilities.getLanguageCode(student.fatherLanguage);
    }

    if(student.fatherHomeAddress1) {
        fatherUserObj.homeAddress1 = student.fatherHomeAddress1;
    }

    if(student.fatherHomeAddress2) {
        fatherUserObj.homeAddress2 = student.fatherHomeAddress2;
    }

    if(student.fatherHomeCity) {
        fatherUserObj.homeCity =  student.fatherHomeCity;
        fatherUserObj.city =  student.fatherHomeCity;
    }

    if(student.fatherHomeState) {
        fatherUserObj.homeState = student.fatherHomeState;
    }

    if(student.fatherHomePostalCode) {
        fatherUserObj.homePostalCode = student.fatherHomePostalCode;
    }

    if(student.fatherHomeCountry) {
        fatherUserObj.homeCountry = student.fatherHomeCountry;
    }

    if(student.fatherHomePhone) {
        fatherUserObj.homePhone = student.fatherHomePhone;
    }

    if(student.fatherWorkAddress1) {
        fatherUserObj.workAddress1 = student.fatherWorkAddress1;
    }

    if(student.fatherWorkAddress2) {
        fatherUserObj.workAddress2 = student.fatherWorkAddress2;
    }

    if(student.fatherWorkCity) {
        fatherUserObj.workCity = student.fatherWorkCity;
    }

    if(student.fatherWorkState) {
        fatherUserObj.workState = student.fatherWorkState;
    }

    if(student.fatherWorkPostalCode) {
        fatherUserObj.workPostalCode = student.fatherWorkPostalCode;
    }

    if(student.fatherWorkCountry) {
        fatherUserObj.workCountry = student.fatherWorkCountry;
    }

    if(student.fatherWorkPhone) {
        fatherUserObj.workPhone = student.fatherWorkPhone;
    }

    fatherUserObj.gender = 'Male';
    
    return fatherUserObj;
}

Smartix.Accounts.School.importParents = function(namespace, data, currentUser) {

    check(namespace, String);
    
    if(Array.isArray(data)) {
        _.each(data, function (parentDetails, i) {
            Smartix.Accounts.School.importParentsSchema.clean(parentDetails);
        })
    }
    
    check(data, [Smartix.Accounts.School.importParentsSchema]);
    
    check(currentUser, Match.Maybe(String));

    // Get the `_id` of the currently-logged in user
    if (!(currentUser === null)) {
        currentUser = currentUser || Meteor.userId();
    }
    
    if(!Smartix.Accounts.School.canImportParents(namespace, currentUser)) {
        throw new Meteor.Error("permission-denied", "The user does not have permission to perform this action.");
    }

    _.each(data, function(student, i, students) {
        log.info(student);
        // Get the student data
        
        let studentData;
        
        // If the student's email is available, use that first
        if(student.studentEmail) {
            studentData = Accounts.findUserByEmail(student.studentEmail)
        }
        // Otherwise, attempt to find the student based on his/her student ID
        else if(student.studentId) {
            studentData = Meteor.users.findOne({
                studentId: student.studentId,
                schools: namespace
            })
        }
        
        if(!studentData) {
            throw new Meteor.Error('non-existent-user', 'The student with email: ' + student.studentEmail + " and/or student ID: " + student.studentId + " cannot be found.")
        }
        
        // Get the mother's email and check if the user exists
        let mother;
        if(student.motherEmail) {
            mother = Accounts.findUserByEmail(student.motherEmail);
            if(mother === undefined) {
                // Mother does not exists
                // Should create a new user
                let motherUserObj = convertStudentObjectToMother(student);
                mother = {};
                mother._id = Smartix.Accounts.createUser(student.motherEmail, motherUserObj, namespace, ['parent'], currentUser);
            } else if(mother === null) {
                // More than one user has the email specified
                // Should meld the accounts together
            }
        }
        
        // Get the father's email and check if the user exists
        let father;
        if(student.fatherEmail) {
            father = Accounts.findUserByEmail(student.fatherEmail);
            if(father === undefined) {
                // Father does not exists
                // Should create a new user
                let fatherUserObj = convertStudentObjectToFather(student);
                father = {};
                father._id = Smartix.Accounts.createUser(student.fatherEmail, fatherUserObj, namespace, ['parent'], currentUser);
            } else if(father === null) {
                // More than one user has the email specified
                // Should meld the accounts together
            }
        }
        
        // Link the parents to the child
        if(mother) {
            let motherOptions = {};
            motherOptions.namespace = namespace;
            motherOptions.parent = mother._id;
            motherOptions.child = studentData._id;
            motherOptions.name = "Mother";
            Smartix.Accounts.Relationships.createRelationship(motherOptions, currentUser);
        }
        
        if(father) {
            let fatherOptions = {};
            fatherOptions.namespace = namespace;
            fatherOptions.parent = father._id;
            fatherOptions.child = studentData._id;
            fatherOptions.name = "Father";
            Smartix.Accounts.Relationships.createRelationship(fatherOptions, currentUser);
        }
    });
}

Smartix.Accounts.School.importTeachersSchema = new SimpleSchema({
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    email: {
        type: String
    },
    gender: {
        type: String,
        optional: true
    },
    mobile: {
        type: String,
        optional: true
    },
    subjectTaught1: {
        type: String
    },
    subjectTaught2: {
        type: String,
        optional: true
    },
    subjectTaught3: {
        type: String,
        optional: true
    },
    subjectTaught4: {
        type: String,
        optional: true
    },
    subjectTaught5: {
        type: String,
        optional: true
    },
    subjectTaught6: {
        type: String,
        optional: true
    },
    subjectTaught7: {
        type: String,
        optional: true
    },
    class1: {
        type: String,
        optional: true
    },
    class2: {
        type: String,
        optional: true
    },
    class3: {
        type: String,
        optional: true
    },
    class4: {
        type: String,
        optional: true
    },
    class5: {
        type: String,
        optional: true
    },
    class6: {
        type: String,
        optional: true
    },
    class7: {
        type: String,
        optional: true
    },
    class8: {
        type: String,
        optional: true
    },
    class9: {
        type: String,
        optional: true
    },
    class10: {
        type: String,
        optional: true
    },
    className1: {
        type: String,
        optional: true
    },
    className2: {
        type: String,
        optional: true
    },
    className3: {
        type: String,
        optional: true
    },
    className4: {
        type: String,
        optional: true
    },
    className5: {
        type: String,
        optional: true
    },
    className6: {
        type: String,
        optional: true
    },
    className7: {
        type: String,
        optional: true
    },
    className8: {
        type: String,
        optional: true
    },
    className9: {
        type: String,
        optional: true
    },
    className10: {
        type: String,
        optional: true
    },
    inviteParents1: {
        type: String,
        optional: true
    },
    inviteParents2: {
        type: String,
        optional: true
    },
    inviteParents3: {
        type: String,
        optional: true
    },
    inviteParents4: {
        type: String,
        optional: true
    },
    inviteParents5: {
        type: String,
        optional: true
    },
    inviteParents6: {
        type: String,
        optional: true
    },
    inviteParents7: {
        type: String,
        optional: true
    },
    inviteParents8: {
        type: String,
        optional: true
    },
    inviteParents9: {
        type: String,
        optional: true
    },
    inviteParents10: {
        type: String,
        optional: true
    },
    inviteStudents1: {
        type: String,
        optional: true
    },
    inviteStudents2: {
        type: String,
        optional: true
    },
    inviteStudents3: {
        type: String,
        optional: true
    },
    inviteStudents4: {
        type: String,
        optional: true
    },
    inviteStudents5: {
        type: String,
        optional: true
    },
    inviteStudents6: {
        type: String,
        optional: true
    },
    inviteStudents7: {
        type: String,
        optional: true
    },
    inviteStudents8: {
        type: String,
        optional: true
    },
    inviteStudents9: {
        type: String,
        optional: true
    },
    inviteStudents10: {
        type: String,
        optional: true
    }
});

Smartix.Accounts.School.importTeachers = function(namespace, data, currentUser) {
    
    check(namespace, String);
    
    _.each(data, function (teacher) {
        Smartix.Accounts.School.importTeachersSchema.clean(teacher);
    });
    
    check(data, [Smartix.Accounts.School.importTeachersSchema]);
    
    check(currentUser, Match.Maybe(String));

    // Get the `_id` of the currently-logged in user
    if (!(currentUser === null)) {
        currentUser = currentUser || Meteor.userId();
    }
    
    if(!Smartix.Accounts.School.canImportTeachers(namespace, currentUser)) {
        throw new Meteor.Error("permission-denied", "The user does not have permission to perform this action.");
    }
    
    _.each(data, function(teacher, i, teachers) {
        
        // Checks if user already exists
        let teacherId = Accounts.findUserByEmail(teacher.email);
        
        // If the user does not already exists
        // Create the user
        if(teacherId === undefined) {
            let newTeacherOptions = {};
            newTeacherOptions.profile = {};
            newTeacherOptions.profile.firstName = teacher.firstName;
            newTeacherOptions.profile.lastName = teacher.lastName;
            newTeacherOptions.gender = teacher.gender;
            newTeacherOptions.mobile = teacher.mobile;
            teacherId = Smartix.Accounts.createUser(teacher.email, newTeacherOptions, namespace, ['teacher'], currentUser, true)
        }
        
        if(!teacherId || typeof teacherId !== "string") {
            throw new Meteor.Error('could-not-create-teacher', "The system failed to create the teacher record for " + teacher.firstName + " " + teacher.lastName + ". Please try again.");
        }
        
        ////////////////////////////////////
        // UPDATE TEACHER SUBJECTS TAUGHT //
        ////////////////////////////////////
        
        let subjectsTaught = [];
        
        _.each(teacher, function (val, key, vals) {
            // If the key includes the term `subjectTaught`
            // Add it to the `subjectsTaught` array
            if(key.indexOf('subjectTaught') > -1) {
                subjectsTaught.push(val);
            }
        });
        
        // If the subjects taught are specified
        // Update the user with those subjects
        if(subjectsTaught.length > 0) {
            Meteor.users.update({
                _id: teacherId
            }, {
                $addToSet: {
                    subjectsTaught: {
                        $each: subjectsTaught
                    }
                }
            })
        }
        
        ////////////////////
        // CREATE CLASSES //
        ////////////////////
        
        _.each(teacher, function (val, key, vals) {
            // If the key includes the term `subjectTaught`
            // Add it to the `subjectsTaught` array
            
            let classNameRegEx = /^className([0-9]{1,2})$/ig;
            
            if(key.match(classNameRegEx)) {
                // Create the distribution list
                // And add the teacher to the list
                
                // Add the users in the distribution list to the class
                let match = classNameRegEx.exec(key);
                let classNameNumber = match[1];
                
                let inviteParentsFieldName = "inviteParents" + classNameNumber;
                let inviteStudentsFieldName = "inviteStudents" + classNameNumber;

                let inviteParents = typeof teacher[inviteParentsFieldName] === "string" && teacher[inviteParentsFieldName].length > 0;
                let inviteStudents = typeof teacher[inviteStudentsFieldName] === "string" && teacher[inviteStudentsFieldName].length > 0;
                
                Smartix.Class.createClass({
                    users: [],
                    namespace: namespace,
                    className: val,
                    classCode: Smartix.Utilities.stringToLetterCase(val),
                    notifyStudents: inviteStudents,
                    notifyParents: inviteParents
                }, teacherId);
            }
        });
        
        //////////////////////////////////////
        // ADD TEACHER TO DISTRIBUTION LIST //
        //////////////////////////////////////
        
        _.each(teacher, function (val, key, vals) {
            // If the key includes the term `subjectTaught`
            // Add it to the `subjectsTaught` array
            
            let classRegEx = /^class([0-9]{1,2})$/ig;
            if(key.match(classRegEx)) {
                // Create the distribution list
                // And add the teacher to the list
                Smartix.DistributionLists.createDistributionList({
                    users: [teacherId],
                    namespace: namespace,
                    name: val,
                    expectDuplicates: true,
                    upsert: true
                }, currentUser);
                
                // Add the users in the distribution list to the class
                let match = classRegEx.exec(key);
                let classNumber  = match[1];
                
                let classNameFieldName = "className" + classNumber;
                
                // If the class is actually specified
                if(teacher[classNameFieldName]) {
                    // Get the class ID
                    let correspondingClass = Smartix.Groups.Collection.findOne({
                        className: teacher[classNameFieldName],
                        type: "class"
                    });
                    
                    let thisDistributionList = Smartix.Groups.Collection.findOne({
                        name: val,
                        type: "distributionList"
                    })
                    
                    if(correspondingClass && thisDistributionList) {
                        // Gets a list of all users who are not the teacher
                        studentUsers = _.pull(thisDistributionList.users, correspondingClass.admins, teacherId);
                        
                        Smartix.Class.addUsersToClass(correspondingClass._id, studentUsers);
                    }
                }
            }
        });
        
    });
}