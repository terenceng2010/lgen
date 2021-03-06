var postHooks = {
  before: {
    method: function (doc) {
      // doc.role = Router.current().params.role;
      return doc;
    }
  },
  onSuccess: function (operation, result, template) {
    IonLoading.hide();
  },
  onError: function (formType, error) {
    log.info('joinClassHook:onError',error);
    toastr.error(error.reason);
  }
};

AutoForm.addHooks('joinClassForm', postHooks);
