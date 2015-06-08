var util  = require('util'),
    spawn = require('child_process').spawn;

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
          },
          "customFds":[-1, -1, -1]
        },
        output = '';
    if (options) for (var prop in options) { finalOptions[prop] = options[prop]; }

    logger.log('debug', 'monitor|execute|command=', {command:command, args:args, options:finalOptions});
    //      console.log(command)
    var child = spawn(command, finalOptions);
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
