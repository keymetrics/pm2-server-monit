
var pmx = require('pmx');
var shelljs = require('shelljs');

if (process.platform == 'linux') {
  pmx.action('top cpu consuming', function(reply) {
    var top_cpu_process = shelljs.exec('ps -eo pcpu,user,args --no-headers | sort -k 1 -n | tail -n 10 | sort -k 1 -nr | cut -c 1-70', { async : true, silent:true}, function(err, out) {
      var result = out.replace(/\n/g, "<br />");
      return reply(result);
    });
  });


  pmx.action('top mem consuming', function(reply) {
    var top_mem_process = shelljs.exec('ps -eo pmem,pid,cmd | sort -k 1 -n | tail -n 10 | sort -k 1 -nr | cut -c 1-70', { async : true, silent:true}, function(err, out) {
      var result = out.replace(/\n/g, "<br />");
      return reply(result);
    });
  });


  pmx.action('vmstats', function(reply) {
    var vmstats = shelljs.exec('vmstat -S m', { async : true, silent:true}, function(err, out) {
      var result = out.replace(/\n/g, "<br />");
      return reply(result);
    });
  });
}


pmx.action('processes/users', function(reply) {
  var proc_users = shelljs.exec('ps hax -o user | sort | uniq -c', { async : true, silent:true}, function(err, out) {
    var result = out.replace(/\n/g, "<br />");
    return reply(result);
  });
});

pmx.action('disk usage', function(reply) {
  var disk_usage = shelljs.exec('df -h', { async : true, silent:true}, function(err, out) {
    var result = out.replace(/\n/g, "<br />");
    return reply(result);
  });
});

pmx.action('who', function(reply) {
  var who = shelljs.exec('who', { async : true, silent:true}, function(err, out) {
    var result = out.replace(/\n/g, "<br />");
    return reply(result);
  });
});

pmx.action('uptime', function(reply) {
  var uptime = shelljs.exec('uptime', { async : true, silent:true}, function(err, out) {
    var result = out.replace(/\n/g, "<br />");
    return reply(result);
  });
});

pmx.action('open ports', function(reply) {
  var open_ports = shelljs.exec('lsof -Pni4 | grep ESTABLISHED', { async : true, silent:true}, function(err, out) {
    var result = out.replace(/\n/g, "<br />");
    return reply(result);
  });
});

pmx.action('open files', function(reply) {
  var open_files = shelljs.exec('lsof -i -n -P | wc -l', { async : true, silent:true}, function(err, out) {
    var result = out.replace(/\n/g, "");
    result = parseInt(result) - 1;
    return reply(result);
  });
});
