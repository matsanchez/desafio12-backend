import { Router } from "express";
import { auth, createDBLocal, createTableMysql, createTableSqlite } from "../middleware/middlewares.js";

const indexRouter = Router();

indexRouter.get("/", auth, createDBLocal, createTableMysql, createTableSqlite, async (req, res) => {
  res.render("pages/home", { userLogin: req.user.username });
});

export default indexRouter;
