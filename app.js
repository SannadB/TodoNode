//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://sannad:sannad@cluster0.uv8hzfh.mongodb.net/todolistDB");

const itemsSchema = {
  name: String
};

const Item = mongoose.model ("Item", itemsSchema);

const buyFood = new Item ({
  name: "Buy Food"
});

const eatFood = new Item ({
  name: "Eat Food"
})

const defaultItems = [buyFood, eatFood];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err){
        if (err){
          console.log(err);
        } else{
          console.log("Items Added Successfully");
        }
      });
      res.redirect("/")
    } else {
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  }

  });


});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item ({
    name: itemName
  });

  if (listName === "Today"){
    item.save();
    res.redirect("/");
  }else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }

  
});

app.post("/delete", function(req, res){
  const checkedItem = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "Today"){
    Item.findByIdAndRemove(checkedItem, function(err){
      if (err){
        console.log(err);
      }else{
        console.log("Item Delete Successfully!");
      }
    });
    res.redirect("/");
  }else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItem}}}, function(err, foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }
});

app.get("/:list", function(req,res){
  const customList = _.capitalize(req.params.list);
  
List.findOne({name: customList}, function(err, foundList){
  if(!err){
    if (!foundList){
      const list = new List({
        name: customList,
        items: defaultItems
      });
      list.save()
      res.redirect("/"+customList);
    }else{
      res.render("list", {listTitle: customList, newListItems: foundList.items})
    }
  }
});

});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
