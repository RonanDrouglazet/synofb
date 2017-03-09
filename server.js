var cp = require('child_process')
var watch = require('watch')
var test = require('assert')
var app = require('express')()

function filebot() {
    this.queue = 0
    this.process = null
}

filebot.prototype.runProcess = function(err, stdout, stderr) {
    this.process = null
    if (this.queue) {
        this.queue--
        this.process = cp.execFile('/volume1/homes/admin/script/sort-media.sh', () => this.runProcess())
    }
}

filebot.prototype.addToQueue = function () {
    this.queue++
    if (!this.process) {
        this.runProcess()
    }
}

function iNodes() {}

iNodes.prototype.list = function(dir, done) {
    cp.exec(`ls -lRi ${dir} | grep -Eo "^[0-9]+ -"`, (err, out) => {
        test.ifError(err)
        const array = out.split(/ \-\\n/g)
        done(array)
    })
}

var fb = new filebot()
var iNo = new iNodes()

watch.createMonitor('/volume1/homes/admin/complete', function (monitor) {
    monitor.on("created", () => fb.addToQueue())
    monitor.on("changed", function (f, curr, prev) {
    // Handle file changes
    })
    monitor.on("removed", function (f, stat) {
    // Handle removed files
    })
})

app.get('/list', (req, res) => {
    iNo.list('/volume1/Movies', (inodes) => {
        res.send(inodes)
    })
})

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
})
