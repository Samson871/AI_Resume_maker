import express from "express";
import { enhanceResume,handleGeneratePdf,getResume,saveResume } from "../controllers/resumeController.js";

const router = express.Router();

router.post("/enhance", enhanceResume);  // POST /api/enhance
router.post("/generate-pdf",handleGeneratePdf)
router.post("/resume/save",saveResume)

router.get("/resume",getResume)


export default router;
