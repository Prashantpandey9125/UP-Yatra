# UP Yatra - Full Stack Tourism Project

A college-project-ready Uttar Pradesh tourism web app.

## Tech Stack
- Frontend: HTML5, CSS3, JavaScript
- Backend: Python + Flask
- Database: SQLite
- No separate database server is required.

## Features
- Premium responsive UI
- ONLY Uttar Pradesh destinations
- Destination search and category filters
- Destination details modal
- Favourites saved in SQLite
- Smart trip planner powered by Python backend
- Trip plans stored in SQLite
- Contact form stored in SQLite
- Interactive UP-style destination map
- Gallery lightbox with next/previous
- Dark mode with localStorage
- Mobile navigation
- Scroll reveal and progress bar

## Run in VS Code / Windows

Open the project folder in VS Code.

### 1. Create virtual environment (recommended)
```powershell
py -m venv venv
```

### 2. Activate it
```powershell
.\venv\Scripts\Activate.ps1
```

If PowerShell blocks activation, you can run:
```powershell
venv\Scripts\python.exe -m pip install -r requirements.txt
```

### 3. Install Flask
```powershell
python -m pip install -r requirements.txt
```

### 4. Run
```powershell
python app.py
```

You should see a local address such as:
`http://127.0.0.1:5000`

Open that address in your browser.

The SQLite database `up_tourism.db` is created automatically the first time the app starts.

## Important
The image URLs currently use Unsplash. For an offline/fully controlled project, download your own UP tourism images and place them in `static/images/`, then update the image paths in `app.py`.
