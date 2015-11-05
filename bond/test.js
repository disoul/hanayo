var ArticleParse = require('./parseArticle.js'),
       JadeParse = require('./jadeParse.js'),
       YamlParse = require('./ymlParse.js'),
              fs = require('fs'),
            path = require('path');

function getArticles(){
    var article_path = path.resolve(__dirname, '../views/article');
    fs.readdir(article_path, function(err, files) {
        if (err)
            throw err;
        files.map(function(file, index) {
            var filestream = fs.createReadStream(
                path.join(article_path, file), 'utf8'
            );
            console.log('22');
            article.on('end', function() {
                console.log('article end');
            });
            filestream.pipe(article).pipe(jade);
        });
    });

}

var jade = new JadeParse({objectMode: true}),
    yaml = new YamlParse({ymlpath: '/home/disoul/Documents/webPoj/bond/views/blog.yml'}),
 article = new ArticleParse();
jade.on('end', function() {
    console.log('end');
});
yaml.pipe(jade, {end: false});
getArticles();
