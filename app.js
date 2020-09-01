const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _=require("lodash");
const app = express();
app.use(bodyParser.urlencoded({
  extended: true
}));
// mongoose.connect(mongoConnectionString, {useNewUrlParser: true, useUnifiedTopology: true});

mongoose.connect('mongodb+srv://admin-konok:test1234@cluster0.uffh1.mongodb.net/todolistDB?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const itemSchema = new mongoose.Schema({
  name: String
});
const Item = mongoose.model('Item', itemSchema);
const item1 = new Item({
  name: 'NodeJS'
});
const item2 = new Item({
  name: 'Express'
});
const item3 = new Item({
  name: 'MongoDB'
});
const defaultitem = [item1, item2, item3];

const listSchema ={
  name:String,
  items:[itemSchema]
}

const List= mongoose.model("List",listSchema);



app.use(express.static("public"));
// let tasks = ["Drinking Lemon Water", "Exercise", "Grattitude"];
let works = [];
app.set('view engine', 'ejs');

app.get("/", function(req, res) {
  var today = date.getDate();
  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultitem, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("success added 3 item  to todolistDB");
        }
      });
      res.redirect("/");
    } else {
      if (err) {
        console.log("err");
      } else {
        res.render("list", {
          tday: "Today",//"Today"is also works
          atask: foundItems
        });
      }
    }

  });
});
app.post("/", function(req, res) {
  const itemName=req.body.add;
  const listName=req.body.list;
  const item=new Item({
    name: itemName
  });
  if (listName === "Today") {
    item.save();
    res.redirect("/");
    } else {
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);

    });
  }
});

app.post("/delete", function(req, res) {
  const checkedID = req.body.checkbox;
  const listName=req.body.listName;
  if(listName==="Today"){
    Item.findByIdAndRemove(checkedID, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("successfull deleted selected item");
        res.redirect("/")
      }
    })
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedID}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }
  // executes

});


app.get("/:customeListName", function(req, res) {
const customeListName = _.capitalize(req.params.customeListName);
List.findOne({
  name: customeListName
}, function(err, foundList) {
  if (!err) {
    if (!foundList) {
      const list = new List({
        name: customeListName,
        items: defaultitem
      });
      list.save();
      res.redirect("/" + customeListName);
    } else {
      res.render("list", {
        tday: foundList.name, //"Today"is also works
        atask: foundList.items
      });
    }
  }
});
});


app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("running 3000");
});
