var ArticleParse = require('../model/parseArticle.js'),
       JadeParse = require('../model/jadeParse.js'),
       YamlParse = require('../model/ymlParse.js'),
              fs = require('fs'),
          mkdirp = require('mkdirp'),
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

function compileArticles(jadeobj) {
    console.log(jadeobj);
    var article_path = path.resolve(__dirname, '../../views/article');
    var archivesDir = path.resolve(
        __dirname, '../../views/template/default/archives');
    jadeobj.articles.map(function(article) {
        var date = new Date(article.time);
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var articleJade = new JadeParse({
            objectMode: true,
            jadePath: path.resolve(
                __dirname, '../../views/template/default/pages'),
            jadePage: 'article.jade'

        });
        var articleParse = new ArticleParse({
            articlePath: article_path + '/' + article.name + '.md'
        });
        yaml.pipe(articleJade, {end: false});
        articleParse.pipe(articleJade);
        articleJade.on('finish', function() {
            mkdirp(path.join(
                archivesDir, year.toString(), month.toString()),
                function(err) {
                    if (err) throw err;
                    var articleHtml = fs.createWriteStream(
                        path.join(
                            archivesDir, year.toString(), month.toString(),
                            article.name + '.html')
                    );
                    articleJade.pipe(articleHtml);
                }
            );
        });
    });
}

var jade = new JadeParse({
        objectMode: true,
        jadePath: path.resolve(__dirname,'../../views/template/default/pages'),
        jadePage: 'index.jade'
    }),
    yaml = new YamlParse({
        ymlpath: path.resolve(__dirname, '../../views/blog.yml')
    }),
    html = fs.createWriteStream(path.resolve(
        __dirname, '../../views/template/default/index.html'));

jade.on('finish', function() {
    console.log('finish');
    jade.pipe(html);
    compileArticles(jade.obj);
});

yaml.pipe(jade, {end: false});
getArticles();
