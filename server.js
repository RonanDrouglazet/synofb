var cp = require('child_process')
var watch = require('watch')
var test = require('assert')
var express = require('express')
var app = express()

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
    cp.exec("ls -lRi " + dir + " | grep -Eo \"^ *[0-9]+ -\"", (err, out) => {
        test.ifError(err)
        const array = out.split(/ \-\n/g).map((value) => value.trim()).filter((value) => value !== "")
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

app.get('/diff', (req, res) => {
    var movies, tvshows, animes, complete
    iNo.list('/volume1/Movies', (inodes) => {
        movies = inodes

        iNo.list('/volume1/TV\\ Shows', (inodes1) => {
            tvshows = inodes1

            iNo.list('/volume1/Anime', (inodes2) => {
                animes = inodes2

                iNo.list('/volume1/homes/admin/complete', (inodes3) => {
                    complete = inodes3

                    var diff = complete.filter((node) => { return (movies.indexOf(node) === -1 && tvshows.indexOf(node)  === -1 && animes.indexOf(node)  === -1) })
                    var diff2 = complete
                                .filter((node) => {return movies.indexOf(node) === -1})
                                .filter((node) => {return tvshows.indexOf(node) === -1})
                                .filter((node) => {return animes.indexOf(node) === -1})

                    var all = diff.map((value) => {
                        return [value,
                                 cp.execSync('find /volume1/homes/admin/complete/ -inum ' + value + ' -exec du -h {} \\;')
                                 .toString()
                                 .replace('\t', '   ')
                                 .replace('\n', '')
                               ]
                    }).filter((value) => !value[1].match("@eaDir"))

                    res.send(all)
                })
            })
        })
    })
})

app.get('/', express.static('/volume1/homes/admin/dev/synofb/static'))

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
})
