module.exports = function(grunt) {
  'use strict';

  var child_process = require('child_process');
  require('load-grunt-tasks')(grunt);

  var pkg = require('./package.json');
  var protractorConfig = grunt.option('protractorConfig') || 'src/test/js/e2e/ci.conf.js';

  var config = pkg.gruntConfig || {};

  config.grunt = grunt;
  config.pkg = pkg;
  config.protractorConfig = protractorConfig;

  grunt.initConfig({
    pkg:              pkg,

    requirejs:        require('./grunt/config/requirejs')(config),

    clean:            require('./grunt/config/clean')(config),

    watch:            require('./grunt/config/watch')(config),

    protractor:       require('./grunt/config/protractor')(config)
  });

  grunt.registerTask('build', function(mode) {

    grunt.config.data.mode = mode || 'prod';

    grunt.task.run(['clean', 'requirejs']);
  });

  grunt.registerTask('auto-build', [
    'build:dev',
    'watch'
  ]);

  grunt.registerTask('ensureSelenium', function() {

    // set correct webdriver version
    require('fs').writeFileSync('node_modules/grunt-protractor-runner/node_modules/protractor/config.json',
'    {\n'+
'      "webdriverVersions": {\n' +
'        "selenium": "2.47.1",\n' +
'        "chromedriver": "2.24",\n' +
'        "iedriver": "2.47.0"\n' +
'      }\n' +
'    }'
    );

    // async task
    var done = this.async();

    child_process.execFile('node', [__dirname + '/node_modules/grunt-protractor-runner/node_modules/protractor/bin/webdriver-manager', '--chrome', 'update'], function(err) {
      done();
    });
  });

  grunt.registerTask('default', ['build']);

  grunt.registerTask('test-e2e', ['build', 'ensureSelenium', 'protractor:e2e']);
};
