import axios from "axios";

const API_URL = 'http://localhost:5000/api';

export const enhanceResumeSection = async (section, data) => {
  try {
    console.log("Sending request to API:", data);

    const response = await axios.post(`${API_URL}/enhance`, data);
    let enhancedContent = response.data.enhancedContent;

    if (section === "experience" || section === "projects") {
      enhancedContent = enhancedContent.map(item => ({
        id: item.id,
        ...(section === "experience"
          ? { bullets: item.bullets.split("\n").map(line => line.trim()).filter(line => line !== "") }
          : { description: item.description.trim() })
      }));
    }

    console.log("Cleaned AI Response:", enhancedContent);
    return enhancedContent;
  } catch (error) {
    console.error(`Error enhancing ${section}:`, error);
    return "Enhancement failed.";
  }
};


export const downloadResumePDF = async () => {
  const clientURL = `${window.location.origin}/printable-resume?enhanced=true`; // Add query param
  
  try {
    console.log("📤 Sending request to generate PDF for:", clientURL);
    
    const response = await axios.post(
      `${API_URL}/generate-pdf`,
      { clientURL }, 
      { responseType: "blob" }
    );

    if (response.status !== 200) throw new Error("Failed to generate PDF");

    const pdfBlob = new Blob([response.data], { type: "application/pdf" });
    const pdfUrl = window.URL.createObjectURL(pdfBlob);

    return pdfUrl;
  } catch (error) {
    console.error("❌ Error downloading PDF:", error);
    return null;
  }
};

// ✅ Fetch Resume Data (GET)
export const fetchResume = async () => {
  try {
    const response = await axios.get("http://localhost:5000/api/resume");
    return response.data;
  } catch (error) {
    console.error("Error fetching resume:", error);
    return null;
  }
};

// ✅ Save Resume Data (POST)
export const saveResume = async (resumeData) => {
  try {
    await axios.post("http://localhost:5000/api/resume/save", resumeData, {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error saving resume:", error);
  }
};







