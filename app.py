import os
from flask import Flask, render_template, request, redirect, url_for, flash, session
from flask.cli import load_dotenv
from pymongo import MongoClient
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from bson.objectid import ObjectId
from datetime import datetime, timezone, timedelta
from collections import Counter, defaultdict


load_dotenv('.env')  # Load environment variables from .env file

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY")

MONGO_URI = os.getenv("MONGO_URI")  # ✅ Use Atlas connection string from .env
client = MongoClient(MONGO_URI)      # ✅ Use Atlas

db = client["CivicFix"]
users_col = db["users"]
admins_col = db["admins"]
reports_col = db["reports"]
activities_col = db["activities"]

@app.route('/')
def index():
    total_reports = reports_col.count_documents({})
    resolved_reports = reports_col.count_documents({'status': 'resolved'})
    in_progress = reports_col.count_documents({'status': 'in-progress'})
    urgent = reports_col.count_documents({'status': 'urgent'})
    recent_reports = list(reports_col.find({'visibility': {'$ne': 'private'}}).sort('created_at', -1).limit(5))
    resolution_rate = 0
    if total_reports > 0:
        resolution_rate = round((resolved_reports / total_reports) * 100)

    # Only public reports for index
    public_reports = list(reports_col.find({'visibility': {'$ne': 'private'}}))
    category_list = ['road', 'electricity', 'sanitation']
    category_counts = Counter([r.get('issue_type', 'other') for r in public_reports])
    total_category = sum(category_counts.get(cat, 0) for cat in category_list)
    category_percentages = {
        cat: round((category_counts.get(cat, 0) / total_category) * 100, 2) if total_category else 0
        for cat in category_list
    }

    return render_template('users/index.html',
                           total_reports=total_reports,
                           resolved_reports=resolved_reports,
                           in_progress=in_progress,
                           urgent=urgent,
                           resolution_rate=resolution_rate,
                           recent_reports=recent_reports,
                           category_percentages=category_percentages)

@app.route('/report')
def report():
    return render_template('users/report.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        nin = request.form['nin']
        password = request.form['password']

        if '@' not in email:
            flash('Invalid email format. Email must contain "@".')
            return render_template('users/login.html')
        if not nin.isdigit() or len(nin) != 10:
            flash('NIN must be exactly 10 digits.')
            return render_template('users/login.html')

        user = users_col.find_one({'email': email, 'nin': nin, 'password': password})
        if user:
            session['user_name'] = user['first_name'] + ' ' + user['last_name']
            flash('Login successful!')
            return redirect(url_for('index'))
        else:
            flash('Invalid credentials. Please try again.')
            return render_template('users/login.html')
    return render_template('users/login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        first_name = request.form['first-name']
        last_name = request.form['last-name']
        email = request.form['email']
        phone_number = request.form['phone-number']
        nin = request.form['nin']
        bvn = request.form['bvn']
        password = request.form['password']
        confirm_password = request.form['confirm-password']

        if '@' not in email:
            flash('Invalid email format. Email must contain "@".')
            return render_template('users/register.html')
        if not phone_number.isdigit() or len(phone_number) != 11:
            flash('Phone number must be exactly 11 digits.')
            return render_template('users/register.html')
        if not nin.isdigit() or len(nin) != 10:
            flash('NIN must be exactly 10 digits.')
            return render_template('users/register.html')
        if not bvn.isdigit() or len(bvn) != 10:
            flash('BVN must be exactly 10 digits.')
            return render_template('users/register.html')
        if password != confirm_password:
            flash('Passwords do not match!')
            return render_template('users/register.html')

        if users_col.find_one({'email': email}):
            flash('A user with that email already exists.')
            return render_template('users/register.html')

        users_col.insert_one({
            'first_name': first_name,
            'last_name': last_name,
            'email': email,
            'phone_number': phone_number,
            'nin': nin,
            'bvn': bvn,
            'password': password
        })
        session['user_name'] = first_name + ' ' + last_name
        flash('Registration successful! You are now logged in.')
        return redirect(url_for('index'))
    return render_template('users/register.html')

@app.route('/userlogout')
def userlogout():
    session.pop('user_name', None)
    flash('Logged out successfully.')
    return redirect(url_for('login'))

@app.route('/admin')
def admin():
    total_reports = reports_col.count_documents({})
    pending = reports_col.count_documents({'status': 'pending'})
    in_progress = reports_col.count_documents({'status': 'in-progress'})
    resolved = reports_col.count_documents({'status': 'resolved'})
    urgent = reports_col.count_documents({'priority': 'urgent'})

    # Calculate resolution rate
    resolution_rate = 0
    if total_reports > 0:
        resolution_rate = round((resolved / total_reports) * 100)

    # Recent activity (last 10 actions)
    recent_activity = list(activities_col.find().sort('timestamp', -1).limit(10))

    # All reports for admin
    all_reports = list(reports_col.find())
    category_list = ['road', 'electricity', 'sanitation']
    category_counts = Counter([r.get('issue_type', 'other') for r in all_reports])
    total_category = sum(category_counts.get(cat, 0) for cat in category_list)
    category_percentages = {
        cat: round((category_counts.get(cat, 0) / total_category) * 100, 2) if total_category else 0
        for cat in category_list
    }

    # Calculate monthly average resolution time (in days)
    resolved_reports = reports_col.find({'status': 'resolved', 'resolved_at': {'$exists': True}})
    monthly_resolution = defaultdict(list)
    for report in resolved_reports:
        created = report.get('created_at')
        resolved = report.get('resolved_at')
        if created and resolved:
            month = resolved.strftime('%Y-%m')
            delta = resolved - created
            days = delta.total_seconds() / 86400
            monthly_resolution[month].append(days)
    # Prepare data for chart: sorted by month
    months = sorted(monthly_resolution.keys())
    avg_resolution_times = [
        round(sum(monthly_resolution[m]) / len(monthly_resolution[m]), 2)
        for m in months
    ]

    reports = list(reports_col.find().sort('created_at', -1))
    return render_template(
        'admin/admin.html',
        reports=reports,
        total_reports=total_reports,
        pending=pending,
        in_progress=in_progress,
        resolved=resolved,
        urgent=urgent,
        resolution_rate=resolution_rate,
        recent_activity=recent_activity,
        category_percentages=category_percentages,
        months=months,
        avg_resolution_times=avg_resolution_times,
    )

@app.route('/adminlogin', methods=['GET', 'POST'])
def adminlogin():
    if request.method == 'POST':
        unit_id = request.form['unit-id']
        nin = request.form['nin']
        password = request.form['password']

        if not nin.isdigit() or len(nin) != 10:
            flash('NIN must be exactly 10 digits.')
            return render_template('admin/adminlogin.html')

        admin = admins_col.find_one({'unit_id': unit_id, 'nin': nin, 'password': password})
        if admin:
            session['admin_name'] = admin['first_name'] + ' ' + admin['last_name']
            flash('Login successful!')
            return redirect(url_for('admin'))
        else:
            flash('Invalid credentials.')
            return render_template('admin/adminlogin.html')
    return render_template('admin/adminlogin.html')

@app.route('/adminregister', methods=['GET', 'POST'])
def adminregister():
    if request.method == 'POST':
        first_name = request.form['first-name']
        last_name = request.form['last-name']
        email = request.form['email']
        phone_number = request.form['phone-number']
        unit_id = request.form['unit-id']
        nin = request.form['nin']
        bvn = request.form['bvn']
        password = request.form['password']
        confirm_password = request.form['confirm-password']

        if '@' not in email:
            flash('Invalid email format. Email must contain "@".')
            return render_template('admin/adminregister.html')
        if not phone_number.isdigit() or len(phone_number) != 11:
            flash('Phone must be 11 digits.')
            return render_template('admin/adminregister.html')
        if not nin.isdigit() or len(nin) != 10:
            flash('NIN must be exactly 10 digits.')
            return render_template('admin/adminregister.html')
        if not bvn.isdigit() or len(bvn) != 10:
            flash('BVN must be exactly 10 digits.')
            return render_template('admin/adminregister.html')
        if password != confirm_password:
            flash('Passwords do not match!')
            return render_template('admin/adminregister.html')

        if admins_col.find_one({'email': email}):
            flash('An admin with that email already exists.')
            return render_template('admin/adminregister.html')

        admins_col.insert_one({
            'first_name': first_name,
            'last_name': last_name,
            'email': email,
            'phone_number': phone_number,
            'unit_id': unit_id,
            'nin': nin,
            'bvn': bvn,
            'password': password
        })
        session['admin_name'] = first_name + ' ' + last_name
        flash('Registration successful! You are now logged in.')
        return redirect(url_for('admin'))
    return render_template('admin/adminregister.html')

@app.route('/adminlogout')
def adminlogout():
    session.pop('admin_name', None)
    flash('Logged out successfully.')
    return redirect(url_for('adminlogin'))

@app.route('/submit_report', methods=['POST'])
def submit_report():
    if not session.get('user_name'):
        flash('You must be logged in to submit a report.')
        return redirect(url_for('login'))

    title = request.form['title']
    description = request.form['description']
    location = request.form['location']
    issue_type = request.form['issue-type']
    visibility = request.form.get('visibility', 'public')
    reporter_name = session['user_name']

    report_id = reports_col.insert_one({
        'issue_type': issue_type,
        'title': title,
        'description': description,
        'location': location,
        'reporter_name': reporter_name,
        'status': 'pending',
        'priority': 'medium',
        'created_at': datetime.utcnow(),
        'visibility': visibility
    }).inserted_id

    # Log activity
    activities_col.insert_one({
        'action': 'submitted',
        'report_id': str(report_id),
        'user': reporter_name,
        'timestamp': datetime.utcnow(),
        'details': f'Report "{title}" submitted'
    })

    flash('Report submitted successfully!')
    return redirect(url_for('index'))

@app.route('/update_report_status/<report_id>', methods=['POST'])
def update_report_status(report_id):
    status = request.form['status']
    update_fields = {'status': status}
    if status == 'resolved':
        update_fields['resolved_at'] = datetime.utcnow()
    reports_col.update_one({'_id': ObjectId(report_id)}, {'$set': update_fields})
    return redirect(url_for('admin'))

@app.route('/update_report_priority/<report_id>', methods=['POST'])
def update_report_priority(report_id):
    priority = request.form['priority']
    reports_col.update_one({'_id': ObjectId(report_id)}, {'$set': {'priority': priority}})
    return redirect(url_for('admin'))

if __name__ == '__main__':
    app.run(debug=True)
