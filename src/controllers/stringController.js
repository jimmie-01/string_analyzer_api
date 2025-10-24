import { parseNaturalLanguageQuery } from "../utils/queryParser.js";
import StringModel from "../models/stringModels.js";
import { analyzeString } from "../utils/stringAnalyzer.js";

// Create/Analyze String
export const createString = async (req, res) => {
  const { value } = req.body;
  if (!value) return res.status(400).json({ error: "Missing 'value' field" });
  if (typeof value !== "string") return res.status(422).json({ error: "'value' must be a string" });

  try {
    const exists = await StringModel.findOne({ value });
    if (exists) return res.status(409).json({ error: "String already exists" });

    const properties = analyzeString(value);
    const newString = await StringModel.create({ value, properties });
    return res.status(201).json({
      id: properties.sha256_hash,
      value,
      properties,
      created_at: newString.created_at,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get specific string
export const getString = async (req, res) => {
  const { string_value } = req.params;
  const doc = await StringModel.findOne({ value: string_value });
  if (!doc) return res.status(404).json({ error: "String not found" });
  res.status(200).json(doc);
};

// Get all strings with filters
export const getAllStrings = async (req, res) => {
  const { is_palindrome, min_length, max_length, word_count, contains_character } = req.query;
  const query = {};

  if (is_palindrome !== undefined) query["properties.is_palindrome"] = is_palindrome === "true";
  if (word_count) query["properties.word_count"] = Number(word_count);
  if (min_length || max_length) {
    query["properties.length"] = {};
    if (min_length) query["properties.length"].$gte = Number(min_length);
    if (max_length) query["properties.length"].$lte = Number(max_length);
  }
  if (contains_character) query.value = new RegExp(contains_character, "i");

  try {
    const data = await StringModel.find(query);
    res.json({
      data,
      count: data.length,
      filters_applied: req.query,
    });
  } catch (err) {
    res.status(400).json({ error: "Invalid query parameters" });
  }
};

// Delete string
export const deleteString = async (req, res) => {
  const { string_value } = req.params;
  const deleted = await StringModel.findOneAndDelete({ value: string_value });
  if (!deleted) return res.status(404).json({ error: "String not found" });
  res.status(204).send();
};

// Natural Language Filtering
export const filterByNaturalLanguage = async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ error: "Missing query parameter" });

  try {
    const parsedFilters = parseNaturalLanguageQuery(query);
    const mongoQuery = {};

    // Convert parsed filters to MongoDB query
    if (parsedFilters.is_palindrome !== undefined)
      mongoQuery["properties.is_palindrome"] = parsedFilters.is_palindrome;
    if (parsedFilters.word_count)
      mongoQuery["properties.word_count"] = parsedFilters.word_count;
    if (parsedFilters.min_length || parsedFilters.max_length) {
      mongoQuery["properties.length"] = {};
      if (parsedFilters.min_length)
        mongoQuery["properties.length"].$gte = parsedFilters.min_length;
      if (parsedFilters.max_length)
        mongoQuery["properties.length"].$lte = parsedFilters.max_length;
    }
    if (parsedFilters.contains_character)
      mongoQuery.value = new RegExp(parsedFilters.contains_character, "i");

    // Fetch results
    const results = await StringModel.find(mongoQuery);

    res.status(200).json({
      data: results,
      count: results.length,
      interpreted_query: {
        original: query,
        parsed_filters: parsedFilters,
      },
    });
  } catch (err) {
    res.status(err.code || 400).json({ error: err.message || "Parsing error" });
  }
};