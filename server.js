const express = require("express"); // importing a CommonJS module

const hubsRouter = require("./hubs/hubs-router.js");
const helmet = require("helmet"); // third party middleware
const morgan = require("morgan"); // third party middleware

const server = express();

// global middlewares <<<<<<<<<<<<<<<<<<<<<<<<<<
server.use(express.json()); // opt-in built in middleware for parsing the data coming in
server.use(helmet()); // added in the third party middleware to our server
server.use(morgan("dev")); // added in the third party middleware to our server

// server.use((req, res, next) => {
//   res.status(404).send("Ain't nobody got time for that");
// });
server.use("/api/hubs", restricted, hubsRouter);

// server.use(moodyGateKeeper);
server.use(teamNamer);

server.get("/", restricted, only("gimli"), (req, res, next) => {
  res.send(`
    <h2>Lambda Hubs API</h2>
    <p>Welcome ${req.team} to the Lambda Hubs API</p>
    `);
});

server.use(errorHandler);

function teamNamer(req, res, next) {
  req.team = "Lambda Students";

  next(); // this will tell the function to continue on to the next piece of middleware in the line(queue)
}

function moodyGateKeeper(req, res, next) {
  // return a status code of 403 and the message "You shall not pass"
  // when the seconds on the clock are multiples of 3 and call next() for all other times
  const seconds = new Date().getSeconds();
  if (seconds % 3 === 0) {
    res.status(403).json({ you: "shall not pass" });
  } else {
    next();
  }
}

function restricted(req, res, next) {
  const password = req.headers.password;

  // if (req.headers && req.headers.Authorization) {
  if (password === "mellon") {
    next();
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
  // } else {
  //   next({ message: "no Authorization header provided" });
  // }
}

// if we need to pass in information to our local (inline) middleware, we must return a function from a wrapper function
function only(name) {
  // return the middleware
  return function(req, res, next) {
    const personName = req.headers.name;

    // this function can use the parameters passed to the wrapper function (closure)
    // if the name i not correct we will return a 401 not authorized response
    if (personName.toLowerCase() === name.toLowerCase()) {
      next();
    } else {
      res.status(401).json({ message: "You have no access to this resource" });
    }
  };
}

function errorHandler(error, req, res, next) {
  res.status(400).json({ message: "bad panda", error });
}

module.exports = server;
