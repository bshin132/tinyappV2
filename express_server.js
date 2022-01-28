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

const urlsForUser = (userID, urlDatabase) => {
  const urls = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === userID) {
      urls[key] = urlDatabase[key];
    }
  }
  return urls;
};



//DATABASE
const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  }
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
  const userId = req.cookies["user_id"];  
  if (!users[userId]) {
    res.redirect("/login");
  } else {
    const templateVars = {
      urls: urlsForUser(userId, urlDatabase),
      user: users[userId]
    };
    res.render("urls_new", templateVars);
  }                                               //JUST RENDERS THE EJS TO THIS ROUTE
})



//MAIN PAGE
app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  const templateVars = {
    urls: urlsForUser(userId, urlDatabase),
    user: users[userId]
  };

  if (!users[userId]) {
    res.status(403).send("Please sing in to view this page. <br></br>Click <a href='/login'>here</a> to login.");
  }

  res.render("urls_index", templateVars);
});


//USER LOGIN 
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(403).send("Email and password cannot be blank.");
  }

  const userEmail = getUserByEmail(users, email);
  if (!userEmail) {
    return res.status(403).send("Email does not exist.");
  }


  users[userId] = {          //SETS UP THE COOKIE OF USER_ID ONCE LOGGED IN
    id: userId,
    email: email,
    password: password
  };
  res.cookie("user_id", userId);    //THIS SETS UP THE COOKIE WITH A NAME AND A VALUE OF USERNAME
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]  
  }
  res.render("urls_login", templateVars)
});


//USER LOGOUT AND DELETE COOKIE
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");  //CLEARS COOKIE WHICH IS USERNAME(USER LOGIN)
  res.redirect("/urls");
});


//IF NEW URL, CREATE SHORTURL
app.post("/urls", (req, res) => {
  const userID = req.cookies["user_id"];
  const longURL = req.body.longURL;
  const shortURL = generateRandomString(6, "1234567890qwertyuioplkjhgfdsazxcvbnmQWERTYUIOPLKJHGFDSAZXCVBNM");
  urlDatabase[shortURL] = { longURL, userID };
  res.redirect(`/urls/${shortURL}`);
});


//USER REGISTRATION
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]  
  }
  res.render("urls_register", templateVars)
});



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
  const shortURL = req.params.shortURL;
  const userId = req.cookies["user_id"];
  if (!urlDatabase[shortURL]) {
    res.status(404).send("This URL does not exist.");
  }
  const templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL].longURL,
    user: users[userId]
  };
  if (userId !== urlDatabase[shortURL].userID) {
    return res.status(401).send("You don't have the permission to access this page.");
  }
  if (!userId) {
    return res.status(401).send("You don't have the permission to access this page.");
  }
  res.render("urls_show", templateVars);

});


//SHORTURL TO LONGURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    res.status(404).send("This URL does not exist.");
  } else {
    const longURL = urlDatabase[shortURL].longURL;
    res.status(302).redirect(longURL);
  }
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  const userID = req.cookies["user_id"];
  urlDatabase[shortURL] = { longURL, userID };

  if (!users[userID]) {
    res.status(400).send("You are not logged in.");
  }

  res.redirect("/urls");
});




//EDITS EXISTING URL
app.post("/urls/:id", (req, res) => {
  res.redirect(`/urls/${req.params.id}`)
})

app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`);
});

//DELETES URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.cookies["user_id"];
  const shortURL = req.params.shortURL;
  if (!users[userId]) {
    res.status(401).send("You don't have the permission to delete this.");
  }
  delete urlDatabase[shortURL];
  res.redirect("/urls");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});