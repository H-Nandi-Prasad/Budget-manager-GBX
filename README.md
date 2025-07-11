# 💼 Budget Manager GBX

A professional-grade, role-based budget management system developed using Flask.  
This platform enables departments and organizations to efficiently allocate, track, and report financial activities across multiple user roles with clean UI and structured workflows.

## 🔑 Key Features

- 🔐 **Role-Based Authentication**
  - Separate access for Admins and Users
- 🧾 **Budget Entry Operations**
  - Add, update, and delete budget entries
- 📊 **Department-wise Expense Tracking**
  - Real-time budget management for various teams
- 📄 **PDF Report Generation**
  - Auto-generate reports for record-keeping and audits
- 💻 **Responsive Web UI**
  - Clean and accessible interface using HTML, CSS & Bootstrap
- 🔁 **Modular Flask Application**
  - Scalable structure for easy future expansion

---

## 🧰 Tech Stack

| Layer        | Technologies Used                            |
|--------------|-----------------------------------------------|
| Backend      | Python, Flask, Jinja2                         |
| Frontend     | HTML5, CSS3, Bootstrap                        |
| Database     | SQLite                                        |
| Libraries    | Flask-Login, Flask-SQLAlchemy, ReportLab (optional) |
| Versioning   | Git                                           |
| Deployment   | (Localhost; future: Render/Heroku compatible) |

##📂 Folder Structure

Budget-manager-GBX/
├── app.py # Flask application entry point
├── static/ # CSS, images, JS files
│ └── style.css
├── templates/ # HTML pages (Jinja2 templating)
│ ├── login.html
│ ├── dashboard.html
│ └── ...
├── database/ # SQLite DB or data files
├── README.md
└── requirements.txt # Python dependencies
---

## ⚙️ Local Development Setup

### 🔹 Step 1: Clone the Repository

```bash
git clone https://github.com/H-Nandi-Prasad/Budget-manager-GBX.git
cd Budget-manager-GBXStep 2: Run Backend (Flask API)
bash
Copy
Edit
cd backend

# Optional: Create a virtual environment
python -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the Flask backend server
python app.pyStep 3: Run Frontend (npm)
In a new terminal window/tab:

bash
Copy
Edit
cd frontend

# Install node modules
npm install

# Start local frontend server
npm run start

API Interaction
The frontend communicates with the Flask API via REST endpoints such as:

bash
Copy
Edit
GET    /api/budget
POST   /api/budget
DELETE /api/budget/<id>
...

##  What to Do Now

1. Save this as `README.md` in the root of your project.
2. Run:

```bash
git add README.md
git commit -m "Updated README for split frontend/backend structure"
git push


