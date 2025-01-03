import { Router } from "express";
import { add, get } from "../data/user.js";
import {
  createJSONToken,
  isValidPassword,
  checkAuthMiddleware,
} from "../util/auth.js";
import { isValidText } from "../util/validation.js";

const router = Router();

router.post("/signup", async (req, res, next) => {
  const data = req.body;
  let errors = {};

  console.log(data);

  // validate username >= 3 chars
  if (!isValidText(data.username, 3)) {
    errors.username = "Nazwa użytkownika powinna mieć co najmniej 3 znaki.";
  } else {
    try {
      console.log("sprawdzam czy istnieje");
      const existingUser = await get(data.username, req.app.locals.pool); // check if username exists
      if (existingUser) {
        errors.username = "Taki użytkownik już istnieje.";
      }
    } catch (error) {
      console.log("errory", error);
      next(error); // error capturing
    }
  }

  // pass validation > 6 chars
  if (!isValidText(data.password, 6)) {
    errors.password = "Błędne hasło. Powinno mieć co najmniej 6 znaków.";
  }

  // validation errors
  if (Object.keys(errors).length > 0) {
    console.log("wyspily bledy walidacji");
    return res.status(422).json({
      message:
        "Rejestracja użytkownika nie powiodła się z powodu błędów walidacji.",
      errors,
    });
  }

  try {
    // add user to db
    const createdUser = await add(data, req.app.locals.pool);
    // create token JWT
    console.log("user added", createdUser);
    const authToken = createJSONToken(createdUser.username);
    console.log("token: ", authToken);

    res.status(201).json({
      message: "Użytkownik stworzony.",
      user: createdUser,
      token: authToken,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  console.log("login", username, password);

  let user;
  try {
    // get user based on username
    user = await get(username, req.app.locals.pool);

    // if user not found or password is invalid
    if (!user || !(await isValidPassword(password, user.password))) {
      return res.status(422).json({
        message: "Autentyfikacja nie powiodła się.",
        errors: { credentials: "Błędna nazwa użytkownika lub hasło." },
      });
    }
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Autentyfikacja nie powiodła się." });
  }

  // token JWT
  const token = createJSONToken(username);
  res.json({ token });
});

router.get("/user", checkAuthMiddleware, async (req, res) => {
  console.log("getting user");
  const username = req.token.username;

  try {
    console.log("pobieram usera");
    const user = await get(username, req.app.locals.pool);

    console.log("user", user);
    if (!user) {
      return res.status(404).json({ message: "Nie znaleziono użytkownika." });
    }

    delete user.password;
    res.json(user);
  } catch (error) {
    console.error("Błąd pobierania użytkownika:", error);
    res.status(500).json({ message: "Wystąpił błąd." });
  }
});

export default router;
