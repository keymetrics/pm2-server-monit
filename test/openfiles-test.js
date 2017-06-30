var assert = require('assert');
var pmx = require('pmx');
var bupProbe = pmx.probe;
var bupNotify = pmx.notify;

var fs = require('fs');
var bupRead = fs.readFile;

var config = {
  small_interval: 60
}

describe('openfiles', function() {
  after(function() {
    fs.readFile = bupRead;
    pmx.probe = bupProbe;
    pmx.notify = bupNotify;
  });
  afterEach(function() {
    delete require.cache[require.resolve('../lib/openfiles')];
  });

  it('returns nb open files', function(done) {
    fs.readFile = function(file, callback) {
      //jshint multistr:true
      var stdout = "\
10976	0	1197228\n\
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
                assert.equal(opt, "10976", "Opened");
                done();
              }
            }
          }
        },
      };
    };

    require('../lib/openfiles').init(config);
  });

  it('returns error if cannot read', function(done) {
    fs.readFile = function(file, callback) {
      callback('error');
    };

    var opts = [];
    pmx.probe = function() {
      return {
        metric: function(opt) {
          return {
            set: function(opt) {
              opts.push(opt);
              if (opts.length === 1) {
                assert.equal(opt, "❌", "Available");
                done()
              }
            }
          }
        }
      };
    };

    require('../lib/openfiles').init(config);
  });

});
