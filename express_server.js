const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");


//MIDDLEWARE
app.set("view engine", "ejs"); //RENDER TEMPLATES USING EJS
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));



//HELPER FUNCTIONS
function generateRandomString(len, arr) {
  let result = '';
  for (let i = len; i > 0; i--) {
      result += arr[Math.floor(Math.random() * arr.length)];
  }
  return result;
}

const getUserByEmail = (users, email) => {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
};


//DATABASE
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }

}



//ROUTES


//CREATE NEW PAGE
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  }
  res.render("urls_new", templateVars)              //JUST RENDERS THE EJS TO THIS ROUTE
})

//MAIN PAGE
app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],    //INCLUDE USERNAME IN TEMPLATEVARS TO ACCESS THIS IN THE EJS
  };
  res.render("urls_index", templateVars);
});


//USER LOGIN 
app.post("/login", (req, res) => {

  res.cookie("user_id");    //THIS SETS UP THE COOKIE WITH A NAME AND A VALUE OF USERNAME
  res.redirect("/urls");
});


//USER LOGOUT AND DELETE COOKIE
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");  //CLEARS COOKIE WHICH IS USERNAME(USER LOGIN)
  res.redirect("/urls");
});


//IF NEW URL, CREATE SHORTURL
app.post("/urls", (req, res) => {
  longURL = req.body.longURL;
  shortURL = generateRandomString(6, "1234567890qwertyuioplkjhgfdsazxcvbnmQWERTYUIOPLKJHGFDSAZXCVBNM");
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`); 
});


//USER REGISTRATION
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]  
  }
  res.render("urls_register", templateVars)
});

// const users = { 
//   "userRandomID": {
//     id: "userRandomID", 
//     email: "user@example.com", 
//     password: "purple-monkey-dinosaur"
//   },

app.post("/register", (req, res) => {
  userId = generateRandomString(6, "1234567890qwertyuioplkjhgfdsazxcvbnmQWERTYUIOPLKJHGFDSAZXCVBNM")
  email = req.body.email;
  password = req.body.password;

  if (email === "" || password === "") {
    return res.status(400).send("Email and password cannot be blank!")
  } 

  const userEmail = getUserByEmail(users, email)
  
  if (userEmail) {
    return res.status(400).send("User already exists!")
  }
  

    users[userId] = {
      id: userId,
      email: email,
      password: password
    };

    res.cookie("user_id", userId);
  
  res.redirect("/urls", )
});

//NEW URL VIEW PAGE
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies["user_id"]]
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
  const shortURL = req.params.id;
  const newLongURL = req.body.longURL;
  urlDatabase[shortURL] = newLongURL;
  res.redirect(`/urls`);
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