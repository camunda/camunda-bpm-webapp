'use strict';

var resetUrl = 'http://localhost:8080/camunda/ensureCleanDb/default';
var request = require('request');
var CamSDK = require('camunda-commons-ui/vendor/camunda-bpm-sdk');
var camClient = new CamSDK.Client({
  mock: false,
  apiUri: 'http://localhost:8080/engine-rest'
});

module.exports = function (operations, noReset, done) {
  var deferred = protractor.promise.defer();
  var arity = arguments.length;

  if (arity === 1 && typeof operations === 'function') {
    // testHelper(function(){ console.log('setup complete'); });
    done = operations;
    noReset = false;
    operations = [];
  }
  else if (arity === 1 && typeof operations === 'object') {
    // testHelper(setupObject);
    noReset = false;
    done = function(){};
  }
  else if (arity === 2 && typeof noReset === 'function') {
    // testHelper(setupObject, function(err, result){ console.log('setup complete', result); });
    done = noReset;
    noReset = false;
  }
  else if (arity === 2 && typeof noReset === 'boolean') {
    done = function(){};
  }

  var callbacks = [];

  if (!noReset) {
    callbacks.push(function (cb) {
      browser.manage().deleteAllCookies().then(function () {cb();}, cb);
    });

    callbacks.push(function (cb) {
      request(resetUrl, function(err, res, body) {
        if (err) {
          return cb(err);
        }

        try {
          body = JSON.parse(body);
          cb(null, body);
        }
        catch (err) {
          cb(err);
        }
      });
    });
  }

  operations.forEach(function(operation) {
    var resource = new camClient.resource(operation.module);
    callbacks.push(function (cb) {
      resource[operation.operation](operation.params, function(err){
        console.log('done with '+ operation.module +'.'+ operation.operation +':', err ? '\n' + err.message : 'OK');
        cb(err);
      });
    });
  });

  CamSDK.utils.series(callbacks, function(err, result) {
    // now all process instances are started, we can start the jobs to create incidents
    // This method sets retries to 0 for all jobs that were created in the test setup
    if(err) {
      deferred.reject(err);
      return;
    }

    var resource = new camClient.resource('job');

    var pollCount = 0;
    var pollFct = function() {
      pollCount++;
      resource.count({ "executable" : true }, function(err, res) {
        if(pollCount > 50 || err) {
          deferred.reject(err || new Error('Job Executor could not execute jobs within 10 seconds. Giving up.'));
          return;
        }
        if( res == 0 ) {
          try {
            console.log('calling test-helper callback');
            done(err, {});
            console.log('callback returned, registering idle listener');

            var controlFlowObserver = setInterval(function(){
              console.log('current control flow update');
              console.log(browser.controlFlow().getSchedule());

              // HAXX: For unknown reasons, the controlFlow sometimes does not emit an idle event
              if(!browser.controlFlow().activeFrame_) {
                console.log('FAILURE DETECTED: Control Flow has no active frame, but did not fire an idle event');
                console.log('FAILURE DETECTED: Triggering idle event externally');
                browser.controlFlow().emit('idle');
              }
            }, 1000);


            browser.controlFlow().once('idle', function() {
              console.log('control flow is now idle');
              clearInterval(controlFlowObserver);
            });
            console.log('current control flow content');

            console.log(browser.controlFlow().getSchedule());


            console.log('resolving placeholder promise');
            deferred.fulfill();

          } catch(err) {
            deferred.reject(err);
          }
        } else {
          setTimeout(pollFct, 200);
        }
      });
    };

    pollFct();
  });

  browser.controlFlow().execute(function() {return deferred.promise;}, 'my setup promise');

  return deferred.promise;
};
