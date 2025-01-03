import { Router } from "express";
import { add } from "../data/articles.js";
import { isValidText, isValidImageUrl } from "../util/validation.js";
import { checkAuthMiddleware, checkAdminMiddleware } from "../util/auth.js";

const router = Router();

router.post(
  "/articles",
  checkAuthMiddleware,
  checkAdminMiddleware,
  async (req, res, next) => {
    const data = req.body.article;
    let errors = {};

    console.log("Dodawanie artykułu");
    console.log(data.title);
    console.log(data);

    console.log("Walidacja danych");
    // validate article >= 2 chars
    if (!isValidText(data.title, 2)) {
      console.log("Tytuł artykułu powinien mieć co najmniej 2 znaki");
      errors.title = "Tytuł artykułu powinien mieć co najmniej 2 znaki.";
    } else {
      console.log("tu bedzie sprawdzenie czy taki artykul juz instnieje");
      // try {
      //   console.log("sprawdzam czy istnieje");
      //   const existingArticle = await get(data.title, req.app.locals.pool); // check if username exists
      //   if (existingArticle) {
      //     errors.title = "Artykuł z takim tytułem już istnieje.";
      //   }
      // } catch (error) {
      //   console.log("errory", error);
      //   next(error); // error capturing
      // }
    }

    // banner url validation
    if (!isValidImageUrl(data.bannerUrl)) {
      console.log("Niepoprawny adres URL.");
      errors.banner_url = "Niepoprawny adres URL.";
    }

    // content validation >= 100 chars
    if (!isValidText(data.content, 100)) {
      console.log("za krotki artykul");
      errors.content = "Treść artykułu powinna mieć co najmniej 100 znaków.";
    }

    // validation errors
    if (Object.keys(errors).length > 0) {
      console.log("Wystapily bledy walidacji");
      return res.status(422).json({
        message:
          "Dodawanie artykułu nie powiodło się z powodu błędów walidacji.",
        errors,
      });
    }

    try {
      // add user to db
      const createdArticle = await add(data, req.app.locals.pool);

      res.status(201).json({
        message: "Artykuł dodany do bazy.",
        article: createdArticle,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
