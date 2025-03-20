import React from "react";
import { useState, useEffect, useRef } from "react";

import Sidebar from "./components/Sidebar"; // Import Sidebar
import {
  enhanceResumeSection,
  downloadResumePDF,
  fetchResume,
  saveResume,
} from "./utils/api"; // ✅ Import the function

export default function MainResume() {
  const resumeRef = useRef(null);

  const handleEnhance = async (section) => {
    console.log(`handleEnhance called for: ${section}`);
    setLoadingSection(section);

    let requestData;

    if (section === "profile") {
      const experienceTitle =
        experiences.length > 0 ? experiences[0].title : "Professional";
      const experienceYears =
        new Date().getFullYear() -
        parseInt(experiences[0]?.duration.split(" - ")[0] || "2020");
      const formattedSkills = skills.join(", ");
      const educationDetails = education
        .map((edu) => `${edu.degree} from ${edu.institution}`)
        .join("; ");

      requestData = {
        section: "profile",
        content: profileSectionText,
        experienceTitle,
        experienceYears,
        skills: formattedSkills,
        education: educationDetails,
      };
    } else if (section === "experience") {
      requestData = {
        section: "experience",
        content: experiences.map((exp) => ({
          id: exp.id,
          bullets: exp.bullets.join("\n").replace(/\n\s*\n/g, "\n"), // ✅ Removes extra blank lines
        })),
      };
    } else if (section === "projects") {
      requestData = {
        section: "projects",
        content: projects.map((proj) => ({
          id: proj.id,
          name: proj.name,
          description: proj.description,
          technologies: proj.technologies,
        })),
      };
    } else {
      console.log("No section selected");
    }

    console.log("Sending request to AI:", requestData);

    try {
      const enhancedData = await enhanceResumeSection(
        requestData.section,
        requestData
      );

      console.log("AI Response:", enhancedData);

      if (section === "profile") {
        setProfileSectionText(enhancedData);
      } else if (section === "experience" && Array.isArray(enhancedData)) {
        const updatedExperiences = experiences.map((exp) => {
          const enhancedExp = enhancedData.find((e) => e.id === exp.id);

          return enhancedExp && enhancedExp.bullets
            ? {
                ...exp,
                bullets: Array.isArray(enhancedExp.bullets)
                  ? enhancedExp.bullets
                  : enhancedExp.bullets.split("\n"),
              }
            : exp;
        });
        setExperiences(updatedExperiences);
      } else if (section === "projects") {
        const updatedProjects = projects.map((proj) => {
          const enhancedProj = enhancedData.find((e) => e.id === proj.id);
          return enhancedProj
            ? { ...proj, description: enhancedProj.description.trim() }
            : proj;
        });
        setProjects(updatedProjects);
      } else {
        console.error("Unexpected AI response:", enhancedData);
      }
    } catch (error) {
      console.error("Error enhancing:", error);
    }

    setLoadingSection(null);
  };

  // ✅ Function to update and save resume data
  const handleSaveResume = async () => {
    const resumeData = {
      profileSectionText,
      experiences,
      projects,
      education,
      certifications,
      skills,
    };
    await saveResume(resumeData);
    alert("Resume saved successfully!"); // Optional success message
  };

  const handleDownloadPDF = async () => {
    console.log("📤 Updating content before PDF download...");

    const clientURL = window.location.href; // ✅ Get current page URL
    const pdfUrl = await downloadResumePDF(clientURL);

    if (pdfUrl) {
      const a = document.createElement("a");
      a.href = pdfUrl;
      a.download = "resume.pdf"; // ✅ Set download filename
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      alert("Failed to generate PDF.");
    }
  };

  const [hideUI, setHideUI] = useState(false);
  const [loadingSection, setLoadingSection] = useState(null);
  const [hideButtons, setHideButtons] = useState(false);

  // Profile Section (Editable)
  const [name, setName] = useState("ISABELLE TODD");
  const [contact, setContact] = useState(
    "91+ 6369411212 | ✉ isabelle@gmail.com | 📍 New York City, NY | 🔗 LinkedIn"
  );
  const [headerProfile, setHeaderProfile] = useState(
    "I solve problems and help people overcome obstacles."
  );
  const [profileSectionText, setProfileSectionText] = useState(
    "Result-oriented project team leader with 5 years of experience in project and product management, developing and managing fast-growing startups."
  );

  // Predefined Experience Section
  const [experiences, setExperiences] = useState([
    {
      id: 1,
      title: "Software Engineer",
      company: "Google",
      duration: "2020 - Present",
      bullets: [
        "Developed scalable web applications",
        "Optimized backend performance",
      ],
    },
    {
      id: 2,
      title: "Frontend Developer",
      company: "Facebook",
      duration: "2018 - 2020",
      bullets: [
        "Built reusable UI components",
        "Improved website performance by 40%",
      ],
    },
  ]);

  const [showExperienceForm, setShowExperienceForm] = useState(false);
  const [editingExperience, setEditingExperience] = useState(null);
  const [newExperience, setNewExperience] = useState({
    title: "",
    company: "",
    duration: "",
    bullets: "",
  });

  const addOrUpdateExperience = (e) => {
    e.preventDefault();
    if (
      !newExperience.title ||
      !newExperience.company ||
      !newExperience.duration
    )
      return;
    if (editingExperience) {
      setExperiences(
        experiences.map((exp) =>
          exp.id === editingExperience.id
            ? {
                ...newExperience,
                id: exp.id,
                bullets: newExperience.bullets.split("\n"),
              }
            : exp
        )
      );
      setEditingExperience(null);
    } else {
      setExperiences([
        ...experiences,
        {
          id: Date.now(),
          ...newExperience,
          bullets: newExperience.bullets.split("\n"),
        },
      ]);
    }
    setShowExperienceForm(false);
    setNewExperience({ title: "", company: "", duration: "", bullets: "" });
  };

  const removeExperience = (id) =>
    setExperiences(experiences.filter((exp) => exp.id !== id));

  // Predefined Education Section
  const [education, setEducation] = useState([
    {
      id: 1,
      degree: "Bachelor of Science in Computer Science",
      institution: "Harvard University",
      duration: "2016 - 2020",
    },
    {
      id: 2,
      degree: "Master of Science in AI",
      institution: "MIT",
      duration: "2020 - 2022",
    },
  ]);

  const [showEducationForm, setShowEducationForm] = useState(false);
  const [editingEducation, setEditingEducation] = useState(null);
  const [newEducation, setNewEducation] = useState({
    degree: "",
    institution: "",
    duration: "",
  });

  const addOrUpdateEducation = (e) => {
    e.preventDefault();
    if (
      !newEducation.degree ||
      !newEducation.institution ||
      !newEducation.duration
    )
      return;
    if (editingEducation) {
      setEducation(
        education.map((edu) =>
          edu.id === editingEducation.id ? { ...newEducation, id: edu.id } : edu
        )
      );
      setEditingEducation(null);
    } else {
      setEducation([...education, { id: Date.now(), ...newEducation }]);
    }
    setShowEducationForm(false);
    setNewEducation({ degree: "", institution: "", duration: "" });
  };

  const removeEducation = (id) =>
    setEducation(education.filter((edu) => edu.id !== id));
  const editEducation = (edu) => {
    setEditingEducation(edu);
    setNewEducation(edu);
    setShowEducationForm(true);
  };
  // Project Section State
  const [projects, setProjects] = useState([
    {
      id: 1,
      title: "E-commerce Website",
      description:
        "Developed a full-stack e-commerce platform with React and Node.js.",
    },
    {
      id: 2,
      title: "AI Chatbot",
      description:
        "Built an AI-powered chatbot for customer service automation.",
    },
  ]);

  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [newProject, setNewProject] = useState({ title: "", description: "" });

  const addOrUpdateProject = (e) => {
    e.preventDefault();
    if (!newProject.title || !newProject.description) return;

    if (editingProject) {
      setProjects(
        projects.map((proj) =>
          proj.id === editingProject.id ? { ...newProject, id: proj.id } : proj
        )
      );
      setEditingProject(null);
    } else {
      setProjects([...projects, { id: Date.now(), ...newProject }]);
    }

    setShowProjectForm(false);
    setNewProject({ title: "", description: "" });
  };

  const removeProject = (id) =>
    setProjects(projects.filter((proj) => proj.id !== id));
  const editProject = (proj) => {
    setEditingProject(proj);
    setNewProject(proj);
    setShowProjectForm(true);
  };

  // Certification Section State
  const [certifications, setCertifications] = useState([
    {
      id: 1,
      title: "AWS Certified Solutions Architect",
      issuer: "Amazon Web Services",
      year: "2023",
    },
    {
      id: 2,
      title: "Google Cloud Professional Architect",
      issuer: "Google",
      year: "2022",
    },
  ]);

  const [showCertificationForm, setShowCertificationForm] = useState(false);
  const [editingCertification, setEditingCertification] = useState(null);
  const [newCertification, setNewCertification] = useState({ title: "", issuer: "", year: "" });
  
  const addOrUpdateCertification = (e) => {
    e.preventDefault();
    
    // ✅ Prevent adding empty fields
    if (!newCertification.title || !newCertification.issuer || !newCertification.year) return;
  
    const formattedCert = {
      id: editingCertification ? editingCertification.id : Date.now(),
      name: newCertification.title, // ✅ Match UI field names
      organization: newCertification.issuer, // ✅ Match UI field names
      issuedDate: newCertification.year, // ✅ Match UI field names
    };
  
    if (editingCertification) {
      setCertifications(
        certifications.map((cert) =>
          cert.id === editingCertification.id ? formattedCert : cert
        )
      );
      setEditingCertification(null);
    } else {
      setCertifications([...certifications, formattedCert]); // ✅ Ensure newly added certification is formatted correctly
    }
  
    setShowCertificationForm(false);
    setNewCertification({ title: "", issuer: "", year: "" });
  };
  
  // Skills Section State
  const [skills, setSkills] = useState([
    "JavaScript",
    "React.js",
    "Tailwind CSS",
    "Node.js",
  ]);

  const [showSkillForm, setShowSkillForm] = useState(false);
  const [newSkill, setNewSkill] = useState("");

  const addSkill = (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    setSkills([...skills, newSkill.trim()]);
    setNewSkill("");
    setShowSkillForm(false);
  };

  const removeSkill = (skill) => setSkills(skills.filter((s) => s !== skill));
  // useEffect(() => {
  //   const urlParams = new URLSearchParams(window.location.search);
  //   if (urlParams.get("enhanced")) {
  //     const storedProfile = localStorage.getItem("enhancedProfile");
  //     if (storedProfile) setProfile(JSON.parse(storedProfile));

  //     const storedExperience = localStorage.getItem("enhancedExperience");
  //     if (storedExperience) setExperiences(JSON.parse(storedExperience));

  //     const storedProjects = localStorage.getItem("enhancedProjects");
  //     if (storedProjects) setProjects(JSON.parse(storedProjects));
  //   }
  // }, []);
  useEffect(() => {
    const getResumeData = async () => {
      const data = await fetchResume();
      if (data) {
        setProfileSectionText(data.profile || "");
        setExperiences(data.experiences || []);
        setProjects(data.projects || []);
        setEducation(data.education || []);
        setCertifications(data.certifications || []);
        setSkills(data.skills || []);
      }
    };
    getResumeData();
  }, []);

  return (
    <div id="resume-container" className="min-h-screen flex bg-white no-print">
      {/* Sidebar */}
      <div className="left-section">
        {
          <Sidebar
            onSave={handleSaveResume}
            onEnhance={handleEnhance}
            onDownload={handleDownloadPDF}
          />
        }
      </div>
      {/* Resume Section */}
      <div
        ref={resumeRef}
        className="max-w-4xl mx-auto p-8 bg-white shadow-lg border border-gray-200 flex-1"
      >
        {/* Profile Section */}
        <header className="text-center mb-8">
          {/* Name Field (Editable) */}
          <div
            contentEditable
            suppressContentEditableWarning
            className="text-4xl font-bold text-center w-full outline-none"
            onBlur={(e) => setName(e.target.innerText)}
          >
            {name}
          </div>

          {/* Header Profile Field (Editable) */}
          <div
            contentEditable
            suppressContentEditableWarning
            className="text-xl text-gray-600 text-center w-full outline-none"
            onBlur={(e) => setHeaderProfile(e.target.innerText)}
          >
            {headerProfile}
          </div>

          {/* Contact Info Field (Editable) */}
          <div
            contentEditable
            suppressContentEditableWarning
            className="text-lg text-gray-500 text-center w-full outline-none"
            onBlur={(e) => setContact(e.target.innerText)}
          >
            {contact}
          </div>
        </header>

        {/* Profile Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-extrabold border-b-4 border-black pb-2">
            PROFILE
          </h2>
          {loadingSection === "profile" ? (
            <p>Enhancing...</p>
          ) : (
            <div
              contentEditable
              suppressContentEditableWarning
              className="text-gray-700 mt-2 outline-none"
              onBlur={(e) => setProfileSectionText(e.target.innerText)}
            >
              {profileSectionText}
            </div>
          )}
        </section>

        {/* Experience Section */}
<section className="mb-8">
  <h2 className="text-xl font-bold border-b-4 border-black pb-2">
    EXPERIENCE
  </h2>

  {experiences.map((exp, index) => (
    <div key={exp.id || `exp-${index}`} className="mt-4">
      <div className="flex justify-between items-center">
        {/* Experience Details (Editable) */}
        <div contentEditable suppressContentEditableWarning className="outline-none">
          <h3 className="text-lg font-semibold">{exp.title}</h3>
          <p className="text-gray-500">{exp.company} | {exp.duration}</p>
          
          {/* Bullet Points */}
          <ul className="list-disc list-inside text-gray-700 mt-2 ml-4">
            {loadingSection === "experience" ? (
              <p>Enhancing...</p>
            ) : (
              exp.bullets.map((point, i) => (
                <li key={`bullet-${exp.id || index}-${i}`}>{point}</li>
              ))
            )}
          </ul>
        </div>

        {/* Edit & Remove Buttons (Aligned with Other Sections) */}
        {!hideButtons && (
          <div className="flex space-x-2 mt-2">
            <button
              onClick={() => {
                setEditingExperience(exp);
                setShowExperienceForm(true);
              }}
              className="bg-yellow-500 text-white px-3 py-1 rounded"
            >
              Edit
            </button>
            <button
              onClick={() => removeExperience(exp.id)}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
  ))}

  {/* Add Experience Button (Same Placement as Other Sections) */}
  {!hideButtons && (
    <div className="flex justify-center mt-6">
      <button
        onClick={() => setShowExperienceForm(true)}
        className="bg-green-600 text-white px-4 py-2 rounded mt-4"
      >
        Add Experience
      </button>
    </div>
  )}
</section>


        {/* Experience Form Modal */}
        {showExperienceForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-md w-11/12 max-w-md">
              <h2 className="text-xl font-bold mb-4">
                {editingExperience ? "Edit Experience" : "Add New Experience"}
              </h2>
              <form onSubmit={addOrUpdateExperience} className="grid gap-4">
                <input
                  type="text"
                  name="title"
                  value={newExperience.title}
                  onChange={(e) =>
                    setNewExperience({
                      ...newExperience,
                      title: e.target.value,
                    })
                  }
                  placeholder="Title"
                  className="border px-3 py-2 rounded w-full mb-2"
                />
                <input
                  type="text"
                  name="company"
                  value={newExperience.company}
                  onChange={(e) =>
                    setNewExperience({
                      ...newExperience,
                      company: e.target.value,
                    })
                  }
                  placeholder="Company"
                  className="border px-3 py-2 rounded w-full mb-2"
                />
                <input
                  type="text"
                  name="duration"
                  value={newExperience.duration}
                  onChange={(e) =>
                    setNewExperience({
                      ...newExperience,
                      duration: e.target.value,
                    })
                  }
                  placeholder="Duration"
                  className="border px-3 py-2 rounded w-full mb-2"
                />
                <textarea
                  name="bullets"
                  value={newExperience.bullets}
                  onChange={(e) =>
                    setNewExperience({
                      ...newExperience,
                      bullets: e.target.value,
                    })
                  }
                  placeholder="Bullet points (separate by new line)"
                  className="border px-3 py-2 rounded w-full mb-2"
                ></textarea>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowExperienceForm(false)}
                    className="bg-gray-400 text-white px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded"
                  >
                    {editingExperience ? "Update" : "Add"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Education Section */}
<section className="mb-8">
  <h2 className="text-xl font-bold border-b-4 border-black pb-2">
    EDUCATION
  </h2>
  {education.map((edu, index) => (
    <div key={edu.id || `edu-${index}`} className="mt-4">
      <div className="flex justify-between items-center">
        {/* Editable Education Info */}
        <div contentEditable suppressContentEditableWarning className="outline-none">
          <p className="font-semibold">{edu.degree}</p>
          <p className="text-gray-500">{edu.institution} | {edu.duration}</p>
        </div>

        {/* Edit & Remove Buttons (Consistent with Projects Section) */}
        {!hideButtons && (
          <div className="flex space-x-2 mt-2">
            <button
              onClick={() => editEducation(edu)}
              className="bg-yellow-500 text-white px-3 py-1 rounded"
            >
              Edit
            </button>
            <button
              onClick={() => removeEducation(edu.id)}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
  ))}

  {/* Add Education Button (Same Placement as Projects) */}
  {!hideButtons && (
    <div className="flex justify-center mt-6">
      <button
        onClick={() => setShowEducationForm(true)}
        className="bg-green-600 text-white px-4 py-2 rounded mt-4"
      >
        Add Education
      </button>
    </div>
  )}
</section>

        {/* Education Form Modal */}
        {showEducationForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-md w-11/12 max-w-md">
              <h2 className="text-xl font-bold mb-4">
                {editingEducation ? "Edit Education" : "Add New Education"}
              </h2>
              <form onSubmit={addOrUpdateEducation} className="grid gap-4">
                <input
                  type="text"
                  name="degree"
                  value={newEducation.degree}
                  onChange={(e) =>
                    setNewEducation({ ...newEducation, degree: e.target.value })
                  }
                  placeholder="Degree"
                  className="border px-3 py-2 rounded w-full mb-2"
                />
                <input
                  type="text"
                  name="institution"
                  value={newEducation.institution}
                  onChange={(e) =>
                    setNewEducation({
                      ...newEducation,
                      institution: e.target.value,
                    })
                  }
                  placeholder="Institution"
                  className="border px-3 py-2 rounded w-full mb-2"
                />
                <input
                  type="text"
                  name="duration"
                  value={newEducation.duration}
                  onChange={(e) =>
                    setNewEducation({
                      ...newEducation,
                      duration: e.target.value,
                    })
                  }
                  placeholder="Duration"
                  className="border px-3 py-2 rounded w-full mb-2"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEducationForm(false)}
                    className="bg-gray-400 text-white px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded"
                  >
                    {editingEducation ? "Update" : "Add"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Projects Section */}
        <section className="mb-8">
          <h2 className="text-xl font-bold border-b-4 border-black pb-2">
            PROJECTS
          </h2>
          {projects.map((proj, index) => (
            <div key={proj.id || `proj-${index}`} className="mt-4">
              <div className="flex justify-between items-center">
                <div contentEditable suppressContentEditableWarning className="outline-none">
                  <p className="font-semibold">{proj.name}</p>
                  <p className="text-gray-500">{proj.description}</p>
                  <p className="text-gray-600 italic">
                    Tech: {proj.technologies}
                  </p>
                </div>
                {!hideButtons && (
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={() => editProject(proj)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => removeProject(proj.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {!hideButtons && (
            <div className="flex justify-center mt-6">

            <button
              onClick={() => setShowProjectForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded mt-4"
            >
              Add Project
            </button>
          </div>
          )}
        </section>
        {/* Project Form Modal */}
        {showProjectForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-md w-11/12 max-w-md">
              <h2 className="text-xl font-bold mb-4">
                {editingProject ? "Edit Project" : "Add New Project"}
              </h2>
              <form onSubmit={addOrUpdateProject} className="grid gap-4">
                <input
                  type="text"
                  name="title"
                  value={newProject.title}
                  onChange={(e) =>
                    setNewProject({ ...newProject, title: e.target.value })
                  }
                  placeholder="Project Title"
                  className="border px-3 py-2 rounded w-full mb-2"
                />
                <textarea
                  name="description"
                  value={newProject.description}
                  onChange={(e) =>
                    setNewProject({
                      ...newProject,
                      description: e.target.value,
                    })
                  }
                  placeholder="Project Description"
                  className="border px-3 py-2 rounded w-full mb-2"
                ></textarea>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowProjectForm(false)}
                    className="bg-gray-400 text-white px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded"
                  >
                    {editingProject ? "Update" : "Add"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Certifications */}
        <section className="mb-8">
          <h2 className="text-xl font-bold border-b-4 border-black pb-2">
            CERTIFICATIONS
          </h2>
          {certifications.map((cert, index) => (
            <div key={cert.id || `cert-${index}`} className="mt-4">
              <div className="flex justify-between items-center">
                <div contentEditable suppressContentEditableWarning className="outline-none">
                  <p className="font-semibold">{cert.name}</p>
                  <p className="text-gray-500">
                    {cert.organization} | {cert.issuedDate}
                  </p>
                </div>
                {!hideButtons && (
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={() => editCertification(cert)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => removeCertification(cert.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Hide the "Add New Certification" button if hideButtons is true */}
          {!hideButtons && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setShowCertificationForm(true)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center justify-center"
              >
                Add New Certification
              </button>
            </div>
          )}
        </section>
        {/* Certification Form Modal */}
        {showCertificationForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-md w-11/12 max-w-md">
              <h2 className="text-xl font-bold mb-4">
                {editingCertification
                  ? "Edit Certification"
                  : "Add New Certification"}
              </h2>
              <form onSubmit={addOrUpdateCertification} className="grid gap-4">
                <input
                  type="text"
                  name="title"
                  value={newCertification.title}
                  onChange={(e) =>
                    setNewCertification({
                      ...newCertification,
                      title: e.target.value,
                    })
                  }
                  placeholder="Certification Title"
                  className="border px-3 py-2 rounded w-full mb-2"
                />
                <input
                  type="text"
                  name="issuer"
                  value={newCertification.issuer}
                  onChange={(e) =>
                    setNewCertification({
                      ...newCertification,
                      issuer: e.target.value,
                    })
                  }
                  placeholder="Issuing Organization"
                  className="border px-3 py-2 rounded w-full mb-2"
                />
                <input
                  type="text"
                  name="year"
                  value={newCertification.year}
                  onChange={(e) =>
                    setNewCertification({
                      ...newCertification,
                      year: e.target.value,
                    })
                  }
                  placeholder="Year of Certification"
                  className="border px-3 py-2 rounded w-full mb-2"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCertificationForm(false)}
                    className="bg-gray-400 text-white px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded"
                  >
                    {editingCertification ? "Update" : "Add"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Technical Skills */}
        {/* Skills */}
        <section className="mb-8">
          <h2 className="text-xl font-bold border-b-4 border-black pb-2">
            SKILLS
          </h2>
          <div className="flex flex-wrap gap-2 mt-4">
            {skills.map((skill) => (
              <div
                key={skill} // ✅ Use skill as a unique key
                className="flex items-center bg-skyblue-500 text-black px-3 py-1 rounded-lg"
              >
                <span contentEditable suppressContentEditableWarning className="">{skill}</span>
                {!hideButtons && (
                  <button
                    onClick={() => removeSkill(skill)}
                    className="ml-2 text-black bg-600 w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Hide the "Add Skill" button if hideButtons is true */}
          {!hideButtons && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setShowSkillForm(true)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center justify-center"
              >
                Add Skill
              </button>
            </div>
          )}
        </section>
        {/* Skill Form Modal */}
        {showSkillForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-md w-11/12 max-w-md">
              <h2 className="text-xl font-bold mb-4">Add New Skill</h2>
              <form onSubmit={addSkill} className="grid gap-4">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Skill Name"
                  className="border px-3 py-2 rounded w-full mb-2"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSkillForm(false)}
                    className="bg-gray-400 text-white px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded"
                  >
                    Add
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
