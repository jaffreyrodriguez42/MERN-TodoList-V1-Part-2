const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", { useUnifiedTopology: true, useNewUrlParser: true });

const itemsSchema = ({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Eat Dinner"
});

const item2 = new Item({
  name: "Drink Milk"
});

const item3 = new Item({
  name: "Watch TV"
});

const defaultItems = [item1, item2, item3];

const listSchema = ({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
  Item.find({}, function(err, items){
    if(items.length === 0){
      Item.insertMany(defaultItems, function(err){
      if(err){
        console.log(err);
      }else{
        console.log("Successfully added many!");
      }   
      });
      res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems: items});
    }
  });
  
});

app.post("/", function(req, res){
    const itemName = req.body.newItem;

    const item = new Item({
      name: itemName
    });

    item.save();
    res.redirect("/");
});

app.post("/delete", function(req, res){
  const checkboxId = req.body.checkbox;

  Item.findByIdAndRemove(checkboxId, function(err){
    if(err){
      console.log(err);
    }else{
      console.log("Successfully deleted the item!");
    }
    res.redirect("/");
  });

});

app.get("/:customListName", function(req,res){
  let customListName = req.params.customListName; 

  List.findOne({name: customListName}, function(err, foundList){
    if(err){
      console.log(err);
    }else{
      if(!foundList){
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.render("list", {listTitle: customListName, newListItems: defaultItems});
      }else{
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items });
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
