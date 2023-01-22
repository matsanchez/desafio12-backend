import passport from "passport";
import local from "passport-local";
import { userSchema } from "../models/user.model.js";
import { createHash, isValid } from "../utils/bcrypt.js";

const LocalStrategy = local.Strategy;

export const initializePassport = () => {
  passport.use(
    "register",
    new LocalStrategy({ passReqToCallback: true }, async (req, username, password, done) => {
      try {
        let user = await userSchema.findOne({ username });
        if (user) return done(null, false, { message: "Ya existe un usuario registrado con ese Email" });
        const newUser = {
          username,
          password: createHash(password),
          name: req.body.name,
        };
        try {
          let result = await userSchema.create(newUser);
          return done(null, result);
        } catch (error) {
          done(error);
        }
      } catch (error) {
        done(error);
      }
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });
  passport.deserializeUser((id, done) => {
    userSchema.findById(id, done);
  });
  passport.use(
    "login",
    new LocalStrategy(async (username, password, done) => {
      try {
        let user = await userSchema.findOne({ username });
        if (!user) return done(null, false, { message: "No existe usuario regitrado con ese Email" });
        if (!isValid(user, password)) return done(null, false, { message: "Contraseña incorrecta" });
        return done(null, user);
      } catch (error) {
        done(error);
      }
    })
  );
};
