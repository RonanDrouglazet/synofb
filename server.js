var cp = require('child_process')
var watch = require('watch')

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

var fb = new filebot()

watch.createMonitor('/volume1/homes/admin/complete', function (monitor) {
    monitor.on("created", () => fb.addToQueue())
    monitor.on("changed", function (f, curr, prev) {
    // Handle file changes
    })
    monitor.on("removed", function (f, stat) {
    // Handle removed files
    })
})
