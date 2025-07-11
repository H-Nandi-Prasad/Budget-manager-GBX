from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os
from decimal import Decimal

app = Flask(__name__)
CORS(app)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:password@localhost/budget_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Models
class Department(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    budget = db.Column(db.Numeric(10, 2), nullable=False)
    description = db.Column(db.Text)
    manager = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    transactions = db.relationship('Transaction', backref='department', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'budget': float(self.budget) if self.budget else 0,
            'description': self.description,
            'manager': self.manager,
            'spent': sum(float(t.amount) for t in self.transactions) if self.transactions else 0,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    department_id = db.Column(db.Integer, db.ForeignKey('department.id'), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(100))
    date = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'department_id': self.department_id,
            'amount': float(self.amount) if self.amount else 0,
            'description': self.description,
            'category': self.category,
            'date': self.date.isoformat() if self.date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'department_name': self.department.name if self.department else None
        }

# Department routes
@app.route('/api/departments', methods=['GET'])
def get_departments():
    try:
        departments = Department.query.all()
        return jsonify({
            'status': 200,
            'data': [dept.to_dict() for dept in departments]
        })
    except Exception as e:
        return jsonify({
            'status': 500,
            'error': str(e)
        }), 500

@app.route('/api/departments', methods=['POST'])
def create_department():
    try:
        data = request.json
        new_dept = Department(
            name=data['name'].upper(),
            budget=Decimal(str(data['budget'])),
            description=data.get('description'),
            manager=data.get('manager')
        )
        db.session.add(new_dept)
        db.session.commit()
        
        return jsonify({
            'status': 201,
            'data': new_dept.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 500,
            'error': str(e)
        }), 500

@app.route('/api/departments/<int:id>', methods=['PUT'])
def update_department(id):
    try:
        dept = Department.query.get_or_404(id)
        data = request.json
        
        if 'name' in data:
            dept.name = data['name'].upper()
        if 'budget' in data:
            dept.budget = Decimal(str(data['budget']))
        if 'description' in data:
            dept.description = data['description']
        if 'manager' in data:
            dept.manager = data['manager']
        
        db.session.commit()
        
        return jsonify({
            'status': 200,
            'data': dept.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 500,
            'error': str(e)
        }), 500

@app.route('/api/departments/<int:id>', methods=['DELETE'])
def delete_department(id):
    try:
        dept = Department.query.get_or_404(id)
        db.session.delete(dept)
        db.session.commit()
        
        return jsonify({
            'status': 200,
            'message': 'Department deleted successfully'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 500,
            'error': str(e)
        }), 500

# Transaction routes
@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    try:
        transactions = Transaction.query.all()
        return jsonify({
            'status': 200,
            'data': [trans.to_dict() for trans in transactions]
        })
    except Exception as e:
        return jsonify({
            'status': 500,
            'error': str(e)
        }), 500

@app.route('/api/transactions', methods=['POST'])
def create_transaction():
    try:
        data = request.json
        new_trans = Transaction(
            department_id=data['department_id'],
            amount=Decimal(str(data['amount'])),
            description=data.get('description'),
            category=data.get('category'),
            date=datetime.fromisoformat(data['date']) if 'date' in data else datetime.utcnow()
        )
        db.session.add(new_trans)
        db.session.commit()
        
        return jsonify({
            'status': 201,
            'data': new_trans.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 500,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=3000) 