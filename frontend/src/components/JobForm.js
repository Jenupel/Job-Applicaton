import { useState } from "react";
import axios from "axios";
import "./JobForm.css";

function JobForm() {
    const [formData, setFormData] = useState({ name: "", email: "", phone: "", timeZone: "", file: null });
    const [uploadMessage, setUploadMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleFileChange = (e) => setFormData({ ...formData, file: e.target.files[0] });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setUploadMessage("Uploading... Please wait.");

        const data = new FormData();
        data.append("name", formData.name);
        data.append("email", formData.email);
        data.append("phone", formData.phone);
        data.append("timeZone", formData.timeZone); 
        data.append("file", formData.file);

        try {
            const response = await axios.post("http://localhost:5000/upload", data);
            console.log("✅ Server Response:", response.data);

            if (response.data.success) {
                setUploadMessage("✅ CV Successfully Uploaded & Processed!");
                alert("✅ CV Successfully Uploaded & Processed! 🎉");
            } else {
                throw new Error(response.data.error || "Upload failed");
            }

        } catch (error) {
            console.error("❌ Upload failed", error);
            setUploadMessage(`❌ Upload failed: ${error.response?.data?.error || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <h2>Job Application Form</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" name="name" placeholder="Name" onChange={handleChange} required />
                <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
                <input type="tel" name="phone" placeholder="Phone" onChange={handleChange} required />
                <select name="timeZone" onChange={handleChange} required>
                    <option value="">Select Time Zone</option>
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="Europe/London">London (GMT)</option>
                    <option value="Europe/Paris">Paris (CET)</option>
                    <option value="Asia/Kolkata">India (IST)</option>
                </select>
                <input type="file" name="file" accept=".pdf,.docx" onChange={handleFileChange} required />
                <button type="submit" disabled={loading}>{loading ? "Uploading..." : "Submit"}</button>
            </form>

            {uploadMessage && (
                <p className={`upload-message ${uploadMessage.includes("❌") ? "error" : "success"}`}>
                    {uploadMessage}
                </p>
            )}
        </div>
    );
}

export default JobForm;