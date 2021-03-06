Package.describe({
  name: 'smartix:messages',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Npm.depends({
  cheerio: "0.20.0",
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  api.use('ecmascript');
  api.use('mongo');
  api.use('templating');
  api.use('stevezhu:lodash@4.6.1');
  api.use('aldeed:simple-schema');
  api.use('smartix:utilities');
  //use smartix core as Smartix namespace is init there
  api.use('smartix:core');

  api.use('smartix:messages-addons@0.0.1');
  api.use('smartix:messages-text');
  api.use('smartix:messages-article');
 
  api.addFiles('lib/collections.js', ['client', 'server']);
  api.addFiles('server/messages.js','server');
  api.addFiles('server/publications.js','server');
  api.addFiles('server/methods.js','server');
  api.addFiles('client/admin/message-type-picker/message-type-picker.html', 'client');
  api.addFiles('client/admin/message-type-picker/message-type-picker.js', 'client');
  
  api.export('Smartix');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('smartix:messages');
  api.addFiles('messages-tests.js');
});
