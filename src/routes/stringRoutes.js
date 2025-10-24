import express from "express";
import {
  createString,
  getString,
  getAllStrings,
  deleteString,
  filterByNaturalLanguage
} from "../controllers/stringController.js";

const router = express.Router();

router.post("/", createString);
router.get("/filter-by-natural-language", filterByNaturalLanguage);
router.get("/:string_value", getString);
router.delete("/:string_value", deleteString);
router.get("/", getAllStrings);

export default router;