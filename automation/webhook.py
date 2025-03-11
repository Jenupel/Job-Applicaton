import requests
from datetime import datetime


cv_data = {
    "personal_info": {
        "name": "John Doe",
        "email": "john.doe@example.com"
    },
    "education": [
        {"degree": "BSc in Computer Science", "institution": "XYZ University"}
    ],
    "qualifications": ["Python", "Java"],
    "projects": [
        {"title": "Project A", "description": "Description of Project A"}
    ],
    "cv_public_link": "http://example.com/cv/johndoe"
}


metadata = {
    "applicant_name": cv_data["personal_info"]["name"],
    "email": cv_data["personal_info"]["email"],
    "status": "testing",  
    "cv_processed": True,
    "processed_timestamp": datetime.now().isoformat()
}


payload = {
    "cv_data": cv_data,
    "metadata": metadata
}


url = "https://rnd-assignment.automations-3d6.workers.dev/"
headers = {
    "X-Candidate-Email": "jenupelimmanuvel@gmail.com",  
    "Content-Type": "application/json"
}


response = requests.post(url, headers=headers, json=payload)


if response.status_code == 200:
    try:
        print("Submission successful:", response.json())
    except ValueError:
        print("Server returned a non-JSON response:", response.text)
else:
    print("Submission failed. Status code:", response.status_code)
    print("Response:", response.text)

