import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { connectDB } from "./config/db.js";
import stringRoutes from "./routes/stringRoutes.js";

dotenv.config();
connectDB();

const app = express();
app.use(bodyParser.json());
app.use("/strings", stringRoutes);

app.use((req, res) => res.status(404).json({ error: "Endpoint not found" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));