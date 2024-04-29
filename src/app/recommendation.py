from flask import Flask, jsonify, request
from supabase import create_client
import pandas as pd
from flask_cors import CORS
from functools import wraps

app = Flask(__name__)
CORS(app, origins='*', supports_credentials=True, methods=['GET', 'POST', 'OPTIONS'], headers=['Content-Type'])

supabaseURL = 'https://vnhnpwrekixhemmtyeea.supabase.co'
supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuaG5wd3Jla2l4aGVtbXR5ZWVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDA0OTA4NzcsImV4cCI6MjAxNjA2Njg3N30.qWWTJvHbQiZY86F7cJ1qrBxIIFinBZt_SZ1gu-wInAk'
supabase = create_client(supabaseURL, supabaseKey)

def require_api_key(func):
    @wraps(func)
    def check_api_key(*args, **kwargs):
        api_key = request.headers.get('apikey')
        if api_key == supabaseKey:  
            return func(*args, **kwargs)
        else:
            return jsonify({'message': 'Invalid API key'}), 401
    return check_api_key

@app.route('/api/recommendations', methods=['OPTIONS'])
def preflight():
    return '', 204

@app.route('/api/recommendations', methods=['POST', 'GET', 'OPTIONS'])
def recommend():
    try:
        # Fetch clinic data
        clinic_response, clinic_error = supabase.from_('clinic_tbl').select('*').execute()
        # if clinic_response:
        #     return jsonify({'clinic_response': (clinic_response)})
        # if clinic_error:
        #     return jsonify({'clinic_error': str(clinic_error)})

        if not clinic_response['data']:
            return jsonify({'clinic_error': 'No clinics available'})

        clinic_data = {
            'cName': [],
            'cService': [],
            # 'cHealthcare': [],
            'cSchedule': [],
        }
        
        clinic_data_list = []

        for idx, row_data in enumerate(clinic_response['data']):
            clinic_data = {
                'cName': row_data['cName'],
                'cService': row_data['cService'].split(', '),  # Split the string into a list
                'cSchedule': row_data['cSchedule'].split(', '),  # Split the string into a list
            }

            clinic_data_list.append(clinic_data)

        df_clinic = pd.DataFrame(clinic_data_list)
        # Fetch user preferences
        user_data, user_error = supabase.from_('find_clinic_tbl').select('*').single().execute()

        if user_data:
            user_preferences = set([user_data['fService'], user_data['fSchedule']])
            return jsonify({'user_preference': str(user_data)})

        if user_error:
            return jsonify({'user_error': str(user_error)})

        if not user_data:
            return jsonify({'user_error': 'No user data available'})

        # Calculate matching recommendations
        matches = []

        for idx, row in df_clinic.iterrows():
            clinic_attributes = set([row['cService'], row['cHealthcare'], row['cSchedule']])
            similarity = len(user_preferences.intersection(clinic_attributes)) / len(user_preferences.union(clinic_attributes))

            # You can adjust this threshold based on your preference
            if similarity > 0.5:
                matches.append({'clinic_name': row['cName'], 'similarity': similarity})

        # Sort matches by similarity (higher similarity first)
        matches = sorted(matches, key=lambda x: x['similarity'], reverse=True)
        recommendations_match = [match['clinic_name'] for match in matches]

        # Print recommendations to the console
        print("Recommended Clinics:", recommendations_match)

        return jsonify({'message': 'Recommendations printed to console'})

    except Exception as e:
        return jsonify({'global_error': str(e)})

if __name__ == '__main__':
    app.run(debug=True)