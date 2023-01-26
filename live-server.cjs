var liveServer = require("live-server");
const lookup = require('dns').lookup;
const hostname = require('os').hostname;
var params = {
    port: 4272, // Set the server port. Defaults to 8080.
    host: '', // Set the address to bind to. Defaults to 0.0.0.0 or process.env.IP.
    root: "dist", // Set root directory that's being served. Defaults to cwd.
    open: false, // When false, it won't load your browser by default.
    ignore: 'scss,my/templates', // comma-separated string for paths to ignore
    file: "index.html", // When set, serve this file (server root relative) for every 404 (useful for single-page applications)
    wait: 1000, // Waits for all changes, before reloading. Defaults to 0 sec.
    mount: [['/components', './node_modules']], // Mount a directory to a route.
    logLevel: 2, // 0 = errors only, 1 = some, 2 = lots
    middleware: [function (req, res, next) { next(); }] // Takes an array of Connect-compatible middleware that are injected into the server middleware stack
};
lookup(hostname(), { family: 4 },
    function (err, add, fam) {
        // console.log('addr: ' + add);
        params.host = add
        liveServer.start(params);
    })