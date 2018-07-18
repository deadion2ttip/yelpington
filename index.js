var fs = require('fs');
var http = require('http');
var mime = require('mime-types'); // https://github.com/jshttp/mime-types
const $path = require('path')

var port = process.env.PORT || 5000;
http.createServer(function (request, response) {
    let contentType = 'text/plain';
    let data;

    path = request.url
    path = path.split('?')[0]

    let file = $path.resolve('.' + path)
    console.log('file:' + file)
    let publicDir = $path.resolve('.')
    console.log('publicDir: '+ publicDir)
    if (!file.startsWith(publicDir)){
        data = 'You are not permitted to access that file.'
        response.statusCode = 403 //forbidden
        file = null
    }
    else if (path === '/') {
        file = 'index.html';
    }
    else if (path === '/all.json') {
        let jsonFiles = fs.readdirSync('.')
            .filter(file => file.endsWith('.json'))
            .filter(file => !file.startsWith('package'))
            .map(file => file.substring(0, file.length - '.json'.length))
        file = null
        contentType = mime.lookup('json')
        console.log(jsonFiles)
        data = JSON.stringify(jsonFiles)
    } 
    else if (path.indexOf('.') === -1) {
        // '/foo' loads index.html too,
        // which will then ask for '/foo.json'
        file = 'index.html';
    } 
    else {
        file = '.' + decodeURIComponent(request.url);
    }

    try {
        if (file) {
            console.log('Serving ' + file);
            data = fs.readFileSync(file);
            contentType = mime.lookup(file);
        }
    } catch (error) {
        console.log(error);
        // todo: confirm this is a file not found error
        data = "Error: " + error.toString();
        response.statusCode = 404;
    }

    response.setHeader('Content-Type', contentType + '; charset=utf-8');
    response.write(data);
    response.end();
}).listen(port);

console.log("Listening on port " + port);
