const http = require("node:http");
const fs = require("node:fs");
const { Server } = require("socket.io");

const server = http.createServer(function (req, res) {
  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/html" });
    fs.createReadStream(__dirname + "/index.html").pipe(res);
  }
});

const io = new Server(server);

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
  socket.on("chat message", function (msg) {
    io.emit("chat message", msg);
  });
});

server.listen(3000, function () {
  console.log("server running at http://localhost:3000");
});
