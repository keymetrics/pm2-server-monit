
<div align="center">
    <img src="https://github.com/pm2-hive/pm2-server-monit/raw/master/server-monit.png">
</div>

## Description

PM2 module to automatically monitor vital signs of your server :

* CPU average usage
* Free and used drive space
* Free and used memory space
* Operating System
* All processes running
* TTY/SSH opened
* Total opened files
* Network speed (input and output)

##Requirements

This pm2 module currently uses `ifconfig` to get network status on linux machines, usually installed by default. If not, install with `sudo apt-get install net-tools`.

# pm2-server-monit

## Install

```bash
$ npm install pm2 -g

$ pm2 install pm2-server-monit
```

##Configuration

Default settings:

* `drive` is `/`

To modify the config values you can use Keymetrics dashboard or the following commands:

```bash
pm2 set pm2-server-monit:drive /
```

## Uninstall

```bash
$ pm2 uninstall pm2-server-monit
```

# License

MIT
