var ArticleParse = require('../model/parseArticle.js'),
       JadeParse = require('../model/jadeParse.js'),
       YamlParse = require('../model/ymlParse.js'),
              fs = require('fs'),
            path = require('path');

function getArticles(){
    var article_path = path.resolve(__dirname, '../../views/article');
    fs.readdir(article_path, function(err, files) {
        if (err)
            throw err;
        files.map(function(file, index) {
            var article = new ArticleParse({
                articlePath: path.join(article_path, file)
            });
            article.pipe(jade);
        });
    });

}

function compileArticles() {
    jade.on('data', function(chunk, err) {
        if (err) {
            console.err(err);
        }else {
            console.log(jade.obj);
        }
    });
}

var jade = new JadeParse({
        objectMode: true,
        jadePath: path.resolve(__dirname,'../../views/template/default/pages')
    }),
    yaml = new YamlParse({
        ymlpath: path.resolve(__dirname, '../../views/blog.yml')
    }),
    html = fs.createWriteStream(path.resolve(
        __dirname, '../../views/template/default/index.html'));

jade.on('finish', function() {
    console.log('finish');
    jade.pipe(html);
    compileArticles();
});

yaml.pipe(jade, {end: false});
getArticles();
