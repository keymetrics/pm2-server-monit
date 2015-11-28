var assert = require('assert');
var pmx = require('pmx');
var bupProbe = pmx.probe;

var childProcess = require('child_process');
var bupExec = childProcess.exec;

describe('drive', function() {
  after(function() {
    childProcess.exec = bupExec;
    pmx.probe = bupProbe;
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
        metric: function(opt) {
          opts.push(opt);
          if (opts.length === 1) {
            assert.equal(opt.value(), "26.9%", "Available");
          } else if (opts.length === 2) {
            assert.equal(opt.value(), "23.7GB / 34.9GB", "Size");
            return done();
          }
        }
      };
    };

    require('../lib/drive');
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
          opts.push(opt);
          if (opts.length === 1) {
            assert.equal(opt.value(), "26.9%", "Available");
          } else if (opts.length === 2) {
            assert.equal(opt.value(), "23.7GB / 34.9GB", "Size");
            return done();
          }
        }
      };
    };

    require('../lib/drive');
  });

});
