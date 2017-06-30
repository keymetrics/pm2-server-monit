var assert = require('assert');
var pmx = require('pmx');
var bupProbe = pmx.probe;
var bupNotify = pmx.notify;

var childProcess = require('child_process');
var os = require('os');
var bupPlat = os.platform;
var bupExec = childProcess.exec;
var bupExecS = childProcess.execSync;

var config = {
  small_interval: 60
}

describe('mem', function() {
  after(function() {
    childProcess.exec = bupExec;
    childProcess.execSync = bupExecS;
    pmx.probe = bupProbe;
    pmx.notify = bupNotify;
    os.platform = bupPlat;
  });
  afterEach(function() {
    delete require.cache[require.resolve('../lib/mem')];
  });

  it('returns free and used memory for linux', function(done) {
    childProcess.exec = function(cmd, opt, callback) {
      //jshint multistr:true
      var stdout = "\
MemTotal:       12227720 kB\n\
MemFree:          669292 kB\n\
MemAvailable:    6275560 kB\n\
Buffers:          648388 kB\n\
Cached:          5603964 kB\n\
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
                assert.equal(opt, "56.6%", "Free");
              } else if (opts.length == 2) {
                assert.equal(opt, "5.1GB / 11.7GB", "Used");
                return done();
              }
            }
          }
        },
      };
    };

    require('../lib/mem').init(config);
  });

  it('returns free and used memory for darwin', function(done) {

    os.platform = function() { return 'darwin' }

    var i = 0;
    childProcess.exec = function (cmd, opt, cb) {
      cb('err')
    }
    childProcess.execSync = function(cmd, opt, callback) {
      //jshint multistr:true
      i++;
      if (i == 1) {
        return "\
hw.memsize: 17179869184\n\
";
      } else {
        return "\
Mach Virtual Memory Statistics: (page size of 4096 bytes)\n\
Pages free:                              274735.\n\
Pages active:                           1918964.\n\
Pages inactive:                          765522.\n\
Pages speculative:                        27155.\n\
Pages throttled:                              0.\n\
Pages wired down:                        676206.\n\
Pages purgeable:                         244657.\n\
\"Translation faults\":                 116938624.\n\
Pages copy-on-write:                    5364586.\n\
Pages zero filled:                     74092865.\n\
Pages reactivated:                      3115010.\n\
Pages purged:                            339371.\n\
File-backed pages:                       750716.\n\
Anonymous pages:                        1960925.\n\
Pages stored in compressor:             1607465.\n\
Pages occupied by compressor:            529543.\n\
Decompressions:                         3462255.\n\
Compressions:                           8425607.\n\
Pageins:                                3205243.\n\
Pageouts:                                 26158.\n\
Swapins:                                  67197.\n\
Swapouts:                                128132.\n\
";
      }
    };

    var opts = [];
    pmx.probe = function() {
      return {
        metric: function() {
          return {
            set: function(opt) {
              opts.push(opt);
              if (opts.length === 1) {
                assert.equal(opt, "19.9%", "Free");
              } else if (opts.length == 2) {
                assert.equal(opt, "12.8GB / 16.0GB", "Used");
                return done();
              }
            }
          }
        },
      };
    };

    require('../lib/mem').init(config);
  });

});
