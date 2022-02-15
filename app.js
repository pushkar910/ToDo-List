const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash");

// var items = ["Eat", "Sleep", "Code", "Repeat"];
// let workItems = [];

//Connecting to mongoose databse
mongoose.connect(
  "mongodb+srv://admin-pushkar09:pushk%40r09@cluster0.qbtf2.mongodb.net/todolistDB",
  { useNewUrlParser: true }
);

//Creating a new schema
const itemSchema = {
  name: String,
};

//New Mongoose Model for schema
const Item = mongoose.model("item", itemSchema);

//Creating a New Document
const item1 = new Item({
  name: "Welcome To ToDo List",
});

const item2 = new Item({
  name: "Type your work and click on +",
});

const item3 = new Item({
  name: "Happy Coding",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema],
};

const List = new mongoose.model("List", listSchema);

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", function (req, res) {
  Item.find({}, function (err, foundItems) {
    //if db is saving data for first time then only add default items
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("succesfully Added to Database");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  });

  //   res.render("list", { listTitle: "Today", newListItems: items });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName,
  });

  //if it is the default list
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function (req, res) {
  const checkedID = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedID, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Succesfully Removed Item");
      }
    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedID } } },
      function (err, foundList) {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

app.get("/:newRoute", function (req, res) {
  const newRoute = _.capitalize(req.params.newRoute);

  List.findOne({ name: newRoute }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: newRoute,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + newRoute);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    }
  });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(4000, function () {
  console.log("Server is running on port 4000");
});
