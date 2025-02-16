const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
//Write the authenication mechanism here
if (!req.session.authorization) {
    return res.status(403).json({ message: "Customer not logged in" });
  }

  // Extract the token from the session
  const token = req.session.authorization.accessToken;
  if (!token) {
    return res.status(403).json({ message: "Access token missing" });
  }

  // Verify the token using jwt.verify and the secret key 'access'
  jwt.verify(token, 'access', (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Customer not authenticated", error: err.message });
    }
    // Attach the decoded token to the request object
    req.user = decoded;
    next();
  });
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
