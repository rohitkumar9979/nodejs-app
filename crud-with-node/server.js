const http = require("node:http");
const url = require("node:url");
const jwt = require("jsonwebtoken");
const privateKey = "9349384";

const rawData = {};

const admin = [
  {
    id: 1,
    email: "admin@gmail.com",
    password: "12345",
    role: "admin",
  },
];
let users = [
  {
    id: 1,
    name: "peter",
    email: "peter@gmail.com",
    password: "54321",
    role: "user",
  },
];

const server = http.createServer(function (req, res) {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;
  const userLoginData = {};

  if (req.method === "POST" && req.url === "/login") {
    const contentType = req.headers["content-type"]; // multipart/form-data

    const boundary = contentType.split("boundary=")[1];
    let body = "";
    req.on("data", function (chunk) {
      body += chunk;
    });

    req.on("end", () => {
      // Split the body by the boundary to get each part
      const parts = body.split(`--${boundary}`);

      parts.forEach((part) => {
        // Ignore the first and last parts which are empty due to boundary
        if (part === "" || part === "--\r\n") return;

        // Extract headers and body of each part
        const [headersPart, bodyPart] = part.split("\r\n\r\n");

        // Get the Content-Disposition header
        const headers = headersPart.split("\r\n");
        const contentDisposition = headers.find((header) =>
          header.includes("Content-Disposition")
        );

        if (contentDisposition) {
          // Extract the name of the form field
          userLoginData[
            contentDisposition.split(";")[1].split("=")[1].replace(/^"|"$/g, "")
          ] = bodyPart.trim();
        }
      });
      console.log("login data ", userLoginData);
      // check if user is valid
      const existingUser = users.find(
        (user) => user.email === userLoginData.email
      );
      console.log(existingUser);
      if (!existingUser) {
        res.end(JSON.stringify("User doesn't exist"));
      }
      if (existingUser.password !== userLoginData.password) {
        res.end(JSON.parse("Password is incorrect"));
      }

      console.log("user login: ", userLoginData);
      const token = jwt.sign(
        {
          id: existingUser.id,
          email: existingUser.email,
          role: existingUser.role,
        },
        privateKey,
        { algorithm: "HS256", expiresIn: 60 * 5 },

        function (err, token) {
          if (err) {
            console.log("Token error: ", err);
          } else {
            console.log(token);
          }
        }
      );
      // console.log("token: ", token);
      res.end(JSON.stringify(`User is Loggedin`));
    });
  } else if (req.method === "POST" && req.url === "/admin") {
    const contentType = req.headers["content-type"]; // multipart/form-data
    const boundary = contentType.split("boundary=")[1];
    let body = "";
    req.on("data", function (chunk) {
      body += chunk;
    });

    req.on("end", () => {
      // Split the body by the boundary to get each part
      const parts = body.split(`--${boundary}`);

      parts.forEach((part) => {
        // Ignore the first and last parts which are empty due to boundary
        if (part === "" || part === "--\r\n") return;

        // Extract headers and body of each part
        const [headersPart, bodyPart] = part.split("\r\n\r\n");

        // Get the Content-Disposition header
        const headers = headersPart.split("\r\n");
        const contentDisposition = headers.find((header) =>
          header.includes("Content-Disposition")
        );

        if (contentDisposition) {
          // Extract the name of the form field
          userLoginData[
            contentDisposition.split(";")[1].split("=")[1].replace(/^"|"$/g, "")
          ] = bodyPart.trim();
        }
      });
      console.log("admin login data ", userLoginData);
      // check if user is valid
      const existingAdmin = admin.find(
        (user) => user.email === userLoginData.email
      );
      console.log(existingAdmin);
      if (!existingAdmin) {
        res.end(JSON.stringify("Admin doesn't exist"));
        return;
      }
      if (existingAdmin.password !== userLoginData.password) {
        res.end(JSON.parse("Password is incorrect"));
        return;
      }

      console.log("admin login: ", userLoginData);
      const token = jwt.sign(
        {
          id: existingAdmin.id,
          email: existingAdmin.email,
          role: existingAdmin.role,
        },
        privateKey,
        { algorithm: "HS256", expiresIn: 60 * 5 },

        function (err, token) {
          if (err) {
            console.log("Token error: ", err);
          } else {
            console.log(token);
          }
        }
      );
      // console.log("token: ", token);
      res.end(JSON.stringify(`Admin is Loggedin: ${token}`));
    });
  } else if (req.method === "GET" && req.url === "/listUsers") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(users));
  } else if (req.method === "POST" && req.url === "/register") {
    const contentType = req.headers["content-type"]; // multipart/form-data

    const boundary = contentType.split("boundary=")[1];
    let body = "";
    req.on("data", function (chunk) {
      body += chunk;
    });
    const rawData = {};
    req.on("end", () => {
      // Split the body by the boundary to get each part
      const parts = body.split(`--${boundary}`);

      parts.forEach((part) => {
        // Ignore the first and last parts which are empty due to boundary
        if (part === "" || part === "--\r\n") return;

        // Extract headers and body of each part
        const [headersPart, bodyPart] = part.split("\r\n\r\n");

        // Get the Content-Disposition header
        const headers = headersPart.split("\r\n");
        const contentDisposition = headers.find((header) =>
          header.includes("Content-Disposition")
        );

        if (contentDisposition) {
          // Extract the name of the form field
          rawData[
            contentDisposition.split(";")[1].split("=")[1].replace(/^"|"$/g, "")
          ] = bodyPart.trim();
        }
      });
      console.log("raw data: ", rawData);
      users.push({
        ...rawData,
        id: users.length + 1,
        role: "user",
      });
      console.log(rawData);
    });
    res.end(JSON.stringify("users"));
  } else if (req.method === "DELETE" && pathname === "/delete") {
    authMiddleware(req, res);

    if (req.user.role === "user") {
      res.writeHead(401, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ message: `user not unauthorized` }));
    }
    const deletedId = Number(query.id);
    if (req.user.role === "admin") {
      const deletedRecord = users.find((user) => user.id === deletedId);

      const updatedUsers = users.filter((user) => user.id !== deletedId);
      users = updatedUsers;
      return res.end(JSON.stringify(deletedRecord));
    }
  } else if (req.method === "PUT" && req.url.startsWith("/update")) {
    const updateURL = url.parse(req.url, true);
    const { id, name: fName } = updateURL.query;
    console.log(id, fName);
    console.log(query);
    const userId = Number(id);

    authMiddleware(req, res);

    if (req.user.role === "user") {
      res.writeHead(401, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ message: "unauthorized" }));
    }

    if (req.user.role === "admin") {
      users = users.map((user) => {
        if (user.id === userId) {
          console.log("map: ", user);
          return {
            ...user,
            name: fName,
          };
        } else {
          return user;
        }
      });
    }
    console.log("updated users: ", users);
    res.end(JSON.stringify(users));
  }
});

server.listen(3001, function () {
  console.log("server is running on http://localhost:3001");
});

function authMiddleware(req, res, next) {
  const authHeaders = req.headers.authorization;
  console.log("authheaders", authHeaders);
  if (!authHeaders) {
    console.log("inside");
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "unauthorized" }));
    return;
  }
  console.log("moved");
  const token = authHeaders.split(" ")[1];
  jwt.verify(token, privateKey, (err, payload) => {
    if (err) {
      res.writeHead(401, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({ message: "unauthorized: invalid token" })
      );
    }
    req.user = payload;
    // console.log("payload: ", payload);
  });
}
