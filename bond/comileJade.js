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
            filestream.pipe(article).pipe(jade);
        });
    });

}

var article = new ArticleParse(),
       jade = new JadeParse({
           objectMode: true,
           jadePath: path.resolve(__dirname,'../views/template/pages')
       }),
       yaml = new YamlParse({ymlpath: path.resolve(__dirname, '../views/blog.yml')}),
        html = fs.createWriteStream('index.html');
jade.on('finish', function() {
    jade.pipe(html);
});
yaml.pipe(jade, {end: false});
getArticles();
