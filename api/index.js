require("dotenv").config();
const http = require("http");
const app = require("./app");

const server = http.createServer(app);
const { API_PORT } = process.env.API_PORT;
const port = API_PORT || 4001;

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
