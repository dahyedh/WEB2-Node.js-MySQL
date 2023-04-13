var url = require('url');
var qs = require('querystring');
var template = require('./template.js');
var db = require('./db.js');
var sanitizeHtml = require('sanitize-html');

exports.home = function(request, response){
    db.query(`SELECT * FROM topic`, (error, topics) =>{
        db.query(`SELECT * FROM author`, (error2, authors) => {
            var title = 'Author';
            var list = template.list(topics);
            var html = template.HTML(title, list,
              `
              ${template.authorTable(authors)}
              <style>
                table{
                    border-collapse: collapse;
                }
                td {
                    border: 1px solid black;
                }
              </style>
              <form action="/author/create_process" method="post">
                <p>
                    <input type="text" name="name" placeholder="name">
                </p>
                <p>
                    <textarea name="profile" placeholder="profile"></textarea>
                </p>
                <p>
                    <input type="submit" value="create">
                </p>
              </form>
              `,
              ``
            );
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
          db.query(`
            INSERT INTO author (name, profile) VALUE(?, ?)`, 
            [post.name, post.profile],
            (error, result) =>{
              if (error) throw error;
              response.writeHead(302, {Location: `/author`});
              response.end();
            }
          )
      });
}

exports.update = function(request, response){
    db.query(`SELECT * FROM topic`, (error, topics) =>{
        db.query(`SELECT * FROM author`, (error2, authors) => {
            var _url = request.url;
            var queryData = url.parse(_url, true).query;
            db.query(`SELECT * FROM author where id=?`, [queryData.id], (error3, author)=>{
                if (error3) throw error3;
                var title = 'Author';
                var list = template.list(topics);
                var html = template.HTML(title, list,
                  `
                  ${template.authorTable(authors)}
                  <style>
                    table{
                        border-collapse: collapse;
                    }
                    td {
                        border: 1px solid black;
                    }
                  </style>
                  <form action="/author/update_process" method="post">
                    <p>
                        <input type="hidden" name="id" value="${author[0].id}">
                    </p>
                    <p>
                        <input type="text" name="name" value="${sanitizeHtml(author[0].name)}" placeholder="name">
                    </p>
                    <p>
                        <textarea name="profile" placeholder="profile">${sanitizeHtml(author[0].profile)}</textarea>
                    </p>
                    <p>
                        <input type="submit" value="update">
                    </p>
                  </form>
                  `,
                  ``
                );
                response.writeHead(200);
                response.end(html);
            })
        })
    });
}

exports.update_process = function(request, response){
    let body = '';
    request.on('data', (data) => body += data);
    request.on('end', function(){
        const post = qs.parse(body);
        db.query(`
        UPDATE author SET name=?, profile=? WHERE id=?`,
        [sanitizeHtml(post.name), sanitizeHtml(post.profile),post.id],
        (error, result) =>{
            console.log(post.name);
            if (error) throw error;
            response.writeHead(302, {Location: `/author`});
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
        db.query(`DELETE FROM topic WHERE author_id=?`, [post.id], (error, result) =>{
            if (error) throw error;
            db.query('DELETE FROM author WHERE id =?', [post.id], (error2, result)=>{
                if (error2) throw error2;
                response.writeHead(302, {Location: `/author`});
                response.end();
            })
        })
    });
}
