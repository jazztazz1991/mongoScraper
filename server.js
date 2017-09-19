var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");


var Comment = require("./models/Comment.js");
var Article = require("./models/Article.js");


var request = require("request");
var cheerio = require("cheerio");

mongoose.Promise = Promise;


var app = express();


app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(express.static("public"));

//mongoose.connect("mongodb://localhost/week18day3mongoose");
mongoose.connect("mongodb://heroku_qcdch5hw:jg2qhpn3cbom0kiff4djsp6v6@ds141474.mlab.com:41474/heroku_qcdch5hw");
var db = mongoose.connection;

db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

db.once("open", function() {
  console.log("Mongoose connection successful.");
});

app.get("/scrape", function(req, res) {
    console.log("scrape works");
  request("http://www.echojs.com/", function(error, response, html) {
      
    var $ = cheerio.load(html);
      
    $("article h2").each(function(i, element) {

      var result = {};

      result.title = $(this).children("a").text();
      result.link = $(this).children("a").attr("href");

      var entry = new Article(result);

      entry.save(function(err, doc) {
        if (err) {
          console.log(err);
        }
        else {
          console.log(doc);
        }
      });

    });
  });
  res.send("Scrape Complete");
});

app.get("/articles", function(req, res) {
    console.log("articles works");
  Article.find({}, function(error, doc) {
    if (error) {
      console.log(error);
    }
    else {
      res.json(doc);
    }
  });
});

app.get("/articles/:id", function(req, res) {
  Article.findOne({ "_id": req.params.id })
  .populate("comment")
  .exec(function(error, doc) {
    if (error) {
      console.log(error);
    }
    else {
      res.json(doc);
    }
  });
});


app.post("/articles/:id", function(req, res) {
  var newComment = new Comment(req.body);

  newComment.save(function(error, doc) {
    if (error) {
      console.log(error);
    }
    else {
      Article.findOneAndUpdate({ "_id": req.params.id }, { "comment": doc._id })
      .exec(function(err, doc) {
        if (err) {
          console.log(err);
        }
        else {
          res.send(doc);
        }
      });
    }
  });
});

// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});