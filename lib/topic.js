var template = require('./template.js');
var db = require('./db.js');
var sanitizeHtml = require('sanitize-html');
var qs = require('querystring');
var url = require('url');

exports.home = function(request, response){
    db.query(`SELECT * FROM topic`, (error, topics) =>{
        var title = 'Welcome';
        var description = 'Hello, Node.js';
        var list = template.list(topics);
        var html = template.HTML(title, list,
          `<h2>${title}</h2>${description}`,
          `<a href="/create">create</a>`
        );
        response.writeHead(200);
        response.end(html);
      });
}
exports.page = function(request, response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    db.query(`SELECT * FROM topic`, (error, topics) =>{
        if (error) throw error;
        db.query(`SELECT topic.id as id, title, description, author_id, name FROM topic LEFT JOIN author ON topic.author_id = author.id where topic.id=?`,[queryData.id], (error2, topic) => {
          if(error2) throw error2;
          var title = topic[0].title;
          var description = topic[0].description;
          var list = template.list(topics);
          var html = template.HTML(title, list,
            `<h2>${sanitizeHtml(title)}</h2>
            ${sanitizeHtml(description)}
            <p>by ${sanitizeHtml(topic[0].name)}</p>
            `,
            ` <a href="/create">create</a>
            <a href="/update?id=${topic[0].id}">update</a>
            <form action="delete_process" method="post">
              <input type="hidden" name="id" value="${topic[0].id}">
              <input type="submit" value="delete">
            </form>`
          );
          response.writeHead(200);
          response.end(html);
        })
      })   
}
exports.create = function(request, response){
    db.query(`SELECT * FROM topic`, (error, topics) =>{
        db.query(`SELECT * FROM author`, (error2, authors) =>{
          var title = 'Create';
          var list = template.list(topics);
          var html = template.HTML(title, list, `
            <form action="/create_process" method="post">
              <p><input type="text" name="title" placeholder="title"></p>
              <p>
                <textarea name="description" placeholder="description"></textarea>
              </p>
              <p>
                ${template.authorSelect(authors)}
              </p>
              <p>
                <input type="submit">
              </p>
            </form>
          `, '');
          response.writeHead(200);
          response.end(html);
        })
    });
}

exports.create_process = function(request, response){
    var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          /*
          fs.writeFile(`data/${title}`, description, 'utf8', function(err){
            response.writeHead(302, {Location: `/?id=${title}`});
            response.end();
          })
          */
          db.query(`
            INSERT INTO topic (title, description, created, author_id) VALUE(?, ?, NOW(), ?)`, 
            [sanitizeHtml(post.title), sanitizeHtml(post.description), post.author],
            (error, result) =>{
              if (error) throw error;
              response.writeHead(302, {Location: `/?id=${result.insertId}`});
              response.end();
            }
          )
      });
}

exports.update = function(request, response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    db.query(`SELECT * FROM topic`, (error, topics) =>{
        if (error) throw error;
        db.query(`SELECT * FROM topic where topic.id=?`, [queryData.id], (error2, topic) =>{
          if (error2) throw error2;
          db.query(`SELECT * FROM author`, (error3, authors) =>{
            if (error3) throw error3;
            var list = template.list(topics);
            var html = template.HTML(sanitizeHtml(topic[0].title), list,
              `
              <form action="/update_process" method="post">
                <input type="hidden" name="id" value="${topic[0].id}">
                <p><input type="text" name="title" placeholder="title" value="${sanitizeHtml(topic[0].title)}"></p>
                <p>
                  <textarea name="description" placeholder="description">${sanitizeHtml(topic[0].description)}</textarea>
                </p>
                <p>
                  ${template.authorSelect(authors, topic[0].author_id)}
                </p>
                <p>
                  <input type="submit">
                </p>
              </form>
              `,
              `<a href="/create">create</a> <a href="/update?id=${topic[0].id}">update</a>`
            );
            response.writeHead(200);
            response.end(html);
          })
        })
    });
}

exports.update_process = function(request, response){
    var body = '';
    request.on('data', function(data){
        body = body + data;
    });
    request.on('end', function(){
        var post = qs.parse(body);
        db.query(`
        UPDATE topic SET title=?, description=?, author_id=? WHERE id=?`,
        [sanitizeHtml(post.title), sanitizeHtml(post.description), sanitizeHtml(post.author), post.id],
        (error, result) =>{
            if (error) throw error;
            response.writeHead(302, {Location: `/?id=${post.id}`});
            response.end();
        }
        )
    });
}

exports.delete_process = function(request, response){
    let body = '';
    request.on('data', function(data){
        body = body + data;
    });
    request.on('end', function(){
        var post = qs.parse(body);
        db.query('DELETE FROM topic WHERE id =?', [post.id], (error, result)=>{
        if (error) throw error;
        response.writeHead(302, {Location: `/`});
        response.end();
        })
    });
}
