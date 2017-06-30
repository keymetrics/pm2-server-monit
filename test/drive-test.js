var assert = require('assert');
var pmx = require('pmx');
var bupProbe = pmx.probe;
var bupNotify = pmx.notify;

var childProcess = require('child_process');
var bupExec = childProcess.exec;

var config = {
  small_interval: 60
}

describe('drive', function() {
  after(function() {
    childProcess.exec = bupExec;
    pmx.probe = bupProbe;
    pmx.notify = bupNotify;
  });
  afterEach(function() {
    delete require.cache[require.resolve('../lib/drive')];
  });

  it('returns disk availability and size', function(done) {
    childProcess.exec = function(cmd, opt, callback) {
      //jshint multistr:true
      var stdout = "\
Filesystem           1K-blocks     Used Available Use% Mounted on\n\
/dev                  36580952 24822940   9893104  72% /\n\
tmpfs                  6096496        0   6096496   0% /dev/shm\n\
/dev/boot               487652   151545    310507  33% /boot\n\
";
      callback(null, stdout);
    };

    var opts = [];
    pmx.probe = function() {
      return {
        metric: function() {
          return {
            set: function(opt) {
              opts.push(opt);
              if (opts.length === 1) {
                assert.equal(opt, "26.9%", "Available");
              } else if (opts.length == 2) {
                assert.equal(opt, "23.7GB / 34.9GB", "Size");
                return done();
              }
            }
          }
        },
      };
    };

    require('../lib/drive').init(config);
  });

  it('returns disk size when Filesystem splits line', function(done) {
    childProcess.exec = function(cmd, opt, callback) {
      //jshint multistr:true
      var stdout = "\
Filesystem           1K-blocks     Used Available Use% Mounted on\n\
/share/dev/ssd-superdrive\n\
                      36580952 24822940   9893104  72% /\n\
tmpfs                  6096496        0   6096496   0% /dev/shm\n\
/dev/boot               487652   151545    310507  33% /boot\n\
";
      callback(null, stdout);
    };

    var opts = [];
    pmx.probe = function() {
      return {
        metric: function(opt) {
          return {
            set: function(opt) {
              opts.push(opt);
              if (opts.length === 1) {
                assert.equal(opt, "26.9%", "Available");
              } else if (opts.length == 2) {
                assert.equal(opt, "23.7GB / 34.9GB", "Size");
                return done();
              }
            }
          }
        }
      };
    };

    require('../lib/drive').init(config);
  });

});
