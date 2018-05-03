
let fs = require("fs"),
    showdown  = require('showdown'),
    converter = new showdown.Converter(),
    text      = fs.readFileSync("guide.md", "utf8"),
    html      = converter.makeHtml(text);
fs.writeFileSync("./guide.html", html);