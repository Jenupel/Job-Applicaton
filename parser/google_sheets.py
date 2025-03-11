import gspread
from oauth2client.service_account import ServiceAccountCredentials


scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
creds = ServiceAccountCredentials.from_json_keyfile_name(
    "C:/Users/jenu/Desktop/Job Application/parser/google_credentials.json", scope
)

client = gspread.authorize(creds)


SHEET_NAME = "google_sheets"
sheet = client.open(SHEET_NAME).sheet1


headers = ["Name", "Email", "Phone", "Education", "Qualifications", "Projects", "CV Link"]

def save_to_google_sheets(cv_data):
    """ Saves extracted CV data to Google Sheets in table format """
    print("🚀 Saving to Google Sheets:", cv_data)
    
    
    existing_headers = sheet.row_values(1)
    if not existing_headers:
        sheet.insert_row(headers, 1)  
    
    
    sheet.append_row([
        cv_data["personal_info"]["name"],
        cv_data["personal_info"]["email"],
        cv_data["personal_info"]["phone"],
        cv_data["education"],
        cv_data["qualifications"],
        cv_data["projects"],
        cv_data["cv_public_link"]
    ])
    
    print("✅ Data successfully saved to Google Sheets!")
