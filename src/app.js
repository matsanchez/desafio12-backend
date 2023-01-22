import("./config/mongo.config.js");
import msgFlash from "connect-flash";
import dontenv from "dotenv";
import express from "express";
import handlebars from "express-handlebars";
import { Server } from "socket.io";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import userRouter from "./routes/auth/login.routes.js";
import indexRouter from "./routes/index.routes.js";
import { initializePassport } from "./strategies/passport.config.js";
import { Manager } from "./controllers/manager.js";
import { configMysql, configSqlite } from "./config/db.config.js";
const managerProductos = new Manager(configMysql, "productos");
const managerChat = new Manager(configSqlite, "mensajes");

dontenv.config();

const PORT = process.env.PORT || 8080;
const app = express();
const server = app.listen(PORT, () => {
  console.log(`>>>>> 🚀 Server Up! Port: ${PORT} <<<<<`);
});

app.use(express.static("src/public"));
app.use(express.json());
app.use(msgFlash());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    store: MongoStore.create({ mongoUrl: "mongodb://localhost:27017/sessions" }),
    key: "user_sid",
    secret: "c0d3r",
    resave: true,
    saveUninitialized: true,
    cookie: {
      maxAge: 600000,
    },
  })
);
initializePassport();
app.use(passport.initialize());
app.use(passport.session());
app.engine(
  "hbs",
  handlebars.engine({
    extname: ".hbs",
  })
);
app.set("views", "./src/public/views");
app.set("view engine", "hbs");
app.use("/", indexRouter);
app.use("/api/auth/", userRouter);

const io = new Server(server);

io.on("connection", async (socket) => {
  console.log("🔛 Usuario Conectado");

  const loadProducts = async () => {
    const products = await managerProductos.getAll();
    const logChat = await managerChat.getAll();
    socket.emit("server:loadProducts", products);
    socket.emit("server:loadMessages", logChat);
  };
  loadProducts();

  const refreshList = async () => {
    const products = await managerProductos.getAll();
    io.emit("server:loadProducts", products);
  };

  socket.on("client:newProduct", async (obj) => {
    let id = await managerProductos.create(obj);
    let product = await managerProductos.getById(id);
    io.emit("server:newProduct", product);
  });

  socket.on("client:newMessage", async (obj) => {
    let id = await managerChat.create(obj);
    let message = await managerChat.getById(id);
    io.emit("server:newMessage", message);
  });

  socket.on("client:deleteProduct", async (id) => {
    await managerProductos.deleteById(id);
    refreshList();
  });

  socket.on("client:updateProduct", async (id) => {
    let prodId = await managerProductos.getById(id);
    socket.emit("server:updateProduct", prodId);
  });

  socket.on("cliente:sendUpdateProduct", async (prod) => {
    await managerProductos.updateById(prod);
    refreshList();
  });
});
