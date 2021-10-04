const youtubedl = require('youtube-dl');
export function initializeProxyServer(app) {
    console.log("Initializing proxy...");
    app.set('trust proxy', true);
    app.get('/youtube', (req, res) => {
        var url = req.query.url;
        var downloaded = 0;
        if (url.includes('youtube.com/watch?v=')) {
            url = url.split('?v=')[1].split('&')[0];
        }
        else {
            url = url.split('tu.be/')[1].split('&')[0];
        }
        var video = youtubedl(url, ['--format=18'], { start: downloaded, cwd: __dirname });
        var duration: any = 60000;
        video.on('info', function (info) {
            console.log('Download started')
            console.log('Filename: ' + info._filename);
            var total = info.size + downloaded;
            console.log('Size: ' + total);
            duration = info.duration;
            if (downloaded > 0) {
                console.log('Resuming from: ' + downloaded);
                console.log('Remaining bytes: ' + info.size);
            }
        });
        video.pipe(res);
    });
}