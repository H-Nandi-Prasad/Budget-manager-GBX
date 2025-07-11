# Budget App Backend

This is the Flask backend for the Budget Application. It provides API endpoints for managing departments and transactions.

## Prerequisites

- Python 3.8 or higher
- MySQL Server
- pip (Python package installer)

## Setup

1. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure Database:
- Make sure MySQL server is running
- Create a database named `budget_db`
- Update the database connection URI in `app.py` if needed:
  ```python
  app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:password@localhost/budget_db'
  ```

## Running the Application

1. Start the Flask server:
```bash
python app.py
```

The server will run on `http://localhost:3000`

## API Endpoints

### Departments
- `GET /departments` - Get all departments
- `POST /departments` - Create a new department
- `PUT /departments/<id>` - Update a department
- `DELETE /departments/<id>` - Delete a department

### Transactions
- `GET /transactions` - Get all transactions
- `POST /transactions` - Create a new transaction

## Error Handling

The API includes proper error handling for:
- Invalid requests
- Database errors
- Resource not found errors

All errors return appropriate HTTP status codes and error messages in JSON format. 