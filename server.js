const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mysql = require('mysql');
const pdfKit = require('pdfkit');
const fs = require("fs");

const port = process.env.PORT || 3000;
const app = express();
console.log(`Started at ${port}`);
app.listen(port);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1111",
  database: "user_pdf"
});

db.connect(err => err && console.error(err));

app.get('/', (rq, rs) => rs.sendFile(path.join(__dirname + '/view/index.html')));

app.post('/user', (rq, rs) => {
  const targetName = rq.body.firstName;
  if (targetName.trim().length === 0) {
    return rs.json({ "success": false, "reason": `Name is empty.` });
  }
    db.query(`SELECT * FROM user WHERE firstName = '${targetName}'`, (err, result) => {
      if (err) {
        return rs.json({ "success": false, "reason": err.sqlMessage });
      }
      if (result.length === 0) {
        return rs.json({ "success": false, "reason": `User ${targetName} doesn't exist.` });
      } else {
        const textData = `${targetName} ${result[0].lastName}`;
        const fileName = path.join(__dirname + `/temp/${textData}.pdf`);
        const pdf = new pdfKit;
        pdf.pipe(fs.createWriteStream(fileName));
        pdf.text(`${textData}`);
        const img = new Buffer.alloc(result[0].image.length, result[0].image, "binary");
        pdf.image(img, { fit: [250, 300] });
        pdf.end();

        const readStream = fs.createReadStream(fileName);
        let data = [];
        readStream.on('data', chunk => {
          data.push(chunk);
        }).on('end', () => {
          db.query(`UPDATE user SET pdf = ? WHERE firstName = ?`, [Buffer.concat(data), targetName], err => {
            err && rs.json({ "success": false, "reason": err.sqlMessage })
            db.query(`SELECT pdf FROM user WHERE firstName = '${targetName}'`, (err, check) => {
              if (err) {
                return rs.json({ "success": false, "reason": err.sqlMessage });
              }
              const pdfFromDB = new Buffer.alloc(check[0].pdf.length, check[0].pdf, "binary");
              if (pdfFromDB.length > 0) {
                fs.unlinkSync(fileName);
                rs.json({ "success": true });
              } else {
                rs.json({ "success": false, "reason": `Something goes wrong, check pdf at ${fileName}` });
              }
            });
          });
        });
      }
    });    
});