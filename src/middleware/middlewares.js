import { configMysql, configSqlite, configDbLocal } from "../config/db.config.js";
import mysql from "mysql";
import knex from "knex";
const dbMysql = knex(configMysql);
const dbSqlite = knex(configSqlite);

export const auth = (req, res, next) => {
  if (!req.isAuthenticated()) {
    res.redirect("/api/auth/login");
  } else {
    next();
  }
};

export const msgFlash = (req, res, next) => {
  const error_message = req.flash("error")[0];
  const success_message = req.flash("success")[0];
  res.locals.error_message = error_message;
  res.locals.success_message = success_message;
  next();
};

export const createDBLocal = async (req, res, next) => {
  const connectDB = await mysql.createConnection(configDbLocal);
  connectDB.connect(function (err, result) {
    if (err) throw err;
    connectDB.query("CREATE DATABASE IF NOT EXISTS websocket_mariadb", function (err, result) {
      console.log("🚩 Trabajando en la DB websocket_mariadb en localhost");
      if (err) throw err;
    });
  });
  next();
};

export const createTableMysql = async (req, res, next) => {
  try {
    dbMysql.initialize(dbMysql);
    const isCreated = await dbMysql.schema.hasTable("productos");
    if (isCreated) {
      next();
    } else {
      await dbMysql.schema
        .createTable("productos", (table) => {
          table.increments("id");
          table.string("name");
          table.integer("price");
          table.string("thumbnail");
        })
        .finally(() => dbMysql.destroy());
      console.log("✅ Tabla productos creada exitosamente en MySql MariaDb");
      next();
    }
  } catch (error) {
    console.log("error", error.message);
  }
};

export const createTableSqlite = async (req, res, next) => {
  try {
    const isCreated = await dbSqlite.schema.hasTable("mensajes");
    if (isCreated) {
      next();
    } else {
      await dbSqlite.schema.createTable("mensajes", (table) => {
        table.increments("id");
        table.string("email");
        table.integer("date");
        table.string("text");
      });
      console.log("✅ Tabla mensajes creada exitosamente en SQlite3");
      next();
    }
  } catch (error) {
    console.log("error", error.message);
  }
};
