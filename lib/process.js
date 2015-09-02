var util  = require('util'),
    spawn = require('child_process').spawn;

var domain = require('domain');

var d = domain.create();

d.on('error', function(err){
  console.error(err.stact);
});

d.run(function() {

module.exports = (function () {
  var logger = {log:function() {}};

  function setLogger(log) {
    logger = log;
  }

  function execute(command, args, userValue, options, callback) {
    var $this = this,
    finalOptions = {
      "cwd": "/tmp/",
      "env": {
        "ENV":"development"
      }
    },
    output = '';
    if (options) for (var prop in options) { finalOptions[prop] = options[prop]; }

    logger.log('debug', 'monitor|execute|command=', {command:command, args:args, options:finalOptions});
    var child = spawn(command, [], finalOptions);
      child.on('exit', function (code /*, signal*/) {
        logger.log('debug', 'monitor|execute|command=', {command:command, args:args, options:finalOptions, exit_code:code});
        if (code === 0) {
          logger.log('debug', 'monitor|execute|command=', {command:command, args:args, options:finalOptions, exit_code:code, output:output});
          callback.call($this, null, userValue);
        } else {
          callback.call($this, new Error(output), userValue);
        }
      });
      return child;
  }

    ////////////////////////////////////////////////////////////////////////////

  return  {
    'setLogger' : setLogger,
    'execute'  : execute
  };
})();

});
