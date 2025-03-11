import sys
import requests
import re
import docx2txt
from pdfminer.high_level import extract_text
from google_sheets import save_to_google_sheets
import sys
import os


sys.stdout.reconfigure(encoding='utf-8')

def download_cv(cv_url, save_path="downloaded_cv.pdf"):
    """ Downloads the CV from Cloudinary """
    response = requests.get(cv_url)
    if response.status_code == 200:
        with open(save_path, "wb") as file:
            file.write(response.content)
        print(f"✅ CV downloaded from {cv_url}")
        return save_path
    else:
        print("❌ Error downloading CV")
        return None

def extract_personal_info(text):
    """ Extracts Name, Email, and Phone from CV text """
    email_pattern = r"[\w\.-]+@[\w\.-]+\.\w+"
    phone_pattern = r"\+?\d{1,3}[\s-]?\(?\d{2,4}\)?[\s-]?\d{3,4}[\s-]?\d{4}"
    
    name = text.split("\n")[0]  
    email = re.search(email_pattern, text)
    phone = re.search(phone_pattern, text)

    return {
        "name": name.strip(),
        "email": email.group(0) if email else "Not Found",
        "phone": phone.group(0) if phone else "Not Found"
    }

def extract_section(text, keywords):
    """ Extracts sections like Education, Skills, Projects """
    pattern = rf"(?i)({'|'.join(keywords)})(.*?)(?=\n\n|\Z)"
    matches = re.findall(pattern, text, re.DOTALL)
    return matches[0][1].strip() if matches else "Not Found"

def parse_cv(cv_url):
    """ Downloads and extracts information from CV """
    print("🚀 Processing CV from:", cv_url)
    
    file_path = download_cv(cv_url)
    if not file_path:
        return "❌ Error downloading CV"

    
    text = extract_text(file_path) if file_path.endswith(".pdf") else docx2txt.process(file_path)

    
    personal_info = extract_personal_info(text)
    education = extract_section(text, ["Education", "Academic Background"])
    qualifications = extract_section(text, ["Skills", "Qualifications", "Certifications"])
    projects = extract_section(text, ["Projects", "Work Experience", "Portfolio"])

    
    cv_data = {
        "personal_info": personal_info,
        "education": education,
        "qualifications": qualifications,
        "projects": projects,
        "cv_public_link": cv_url
    }

    print("📄 Extracted CV Data:", cv_data)

    
    save_to_google_sheets(cv_data)
    print("✅ CV Data successfully saved to Google Sheets!")

    return cv_data


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("❌ No CV URL provided!")
    else:
        parse_cv(sys.argv[1])
