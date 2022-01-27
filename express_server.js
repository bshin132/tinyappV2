const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser());

function generateRandomString(len, arr) {
  let result = '';
  for (let i = len; i > 0; i--) {
      result += arr[Math.floor(Math.random() * arr.length)];
  }
  return result;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//CREATE NEW PAGE
app.get("/urls/new", (req, res) => {
  res.render("urls_new", )
})

//MAIN PAGE
app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"],
  };
  res.render("urls_index", templateVars);
});


//USER LOGIN 
app.post("/login", (req, res) => {
  console.log("this is the post");
  const username = req.body.username;
  res.cookie("username", username);
  res.redirect("/urls");
});


//USER LOGOUT AND DELETE COOKIE
app.post("/logout", (req, res) => {
  username = req.cookies["username"];
  res.clearCookie("username", username);
  res.redirect("/urls");
});


//IF NEW URL, CREATE SHORTURL
app.post("/urls", (req, res) => {
  longURL = req.body.longURL;
  shortURL = generateRandomString(6, "1234567890qwertyuioplkjhgfdsazxcvbnmQWERTYUIOPLKJHGFDSAZXCVBNM");
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`); 
});

//NEW URL VIEW PAGE
app.get("/urls/:shortURL", (req, res) => {
  //console.log(urlDatabase)
  const templateVars = { shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"],
  };
  res.render("urls_show", templateVars);
});

//SHORTURL TO LONGURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


//EDITS EXISTING URL
app.post("/urls/:id", (req, res) => {
  res.redirect(`/urls/${req.params.id}`);
})

//DELETES URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});