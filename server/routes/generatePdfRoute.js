import express from "express";
import puppeteer from "puppeteer";

const router = express.Router();



// Define API Route
router.post("/generate-pdf", handleGeneratePdf);


export default router;



