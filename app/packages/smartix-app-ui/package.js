Package.describe({
	name: 'smartix:app-ui',
	version: '0.0.1',
	summary: '',
	git: '',
	documentation: 'README.md'
});

Package.onUse(function(api) {
	api.versionsFrom('1.2');

	api.use([
		'mongo',
		'ecmascript',
		'templating',
		'underscore',
		'smartix:lib'
	]);
	//api.use('smartix:lib@0.0.1');
    api.use('zimme:active-route');
    
	api.addFiles('app/app_layout.html', 'client');
	api.addFiles('app/app_layout.js', 'client');
});