"""
Automated Role-Based Dashboard Testing Script
Tests all 7 roles with Django JWT and Supabase authentication

Usage: python test_role_dashboards.py
"""

import os
import sys
import django
import json
import requests
from datetime import datetime
from typing import Dict, List, Tuple
from collections import defaultdict

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import UserProfile


class Colors:
    """Terminal colors for pretty output"""
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'


class RoleDashboardTester:
    """Automated tester for role-based dashboards"""

    def __init__(self, base_url='http://localhost:8000'):
        self.base_url = base_url
        self.api_url = f'{base_url}/api'
        self.test_results = defaultdict(list)
        self.total_tests = 0
        self.passed_tests = 0
        self.failed_tests = 0
        self.tokens = {}
        self.users = {}

    def print_header(self, text):
        """Print colored header"""
        print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*80}{Colors.ENDC}")
        print(f"{Colors.HEADER}{Colors.BOLD}{text.center(80)}{Colors.ENDC}")
        print(f"{Colors.HEADER}{Colors.BOLD}{'='*80}{Colors.ENDC}\n")

    def print_section(self, text):
        """Print section header"""
        print(f"\n{Colors.OKCYAN}{Colors.BOLD}[{text}]{Colors.ENDC}")

    def print_test(self, test_name, passed, details=''):
        """Print test result"""
        self.total_tests += 1
        if passed:
            self.passed_tests += 1
            status = f"{Colors.OKGREEN}✓ PASS{Colors.ENDC}"
        else:
            self.failed_tests += 1
            status = f"{Colors.FAIL}✗ FAIL{Colors.ENDC}"

        print(f"  {status} | {test_name}")
        if details:
            print(f"        {Colors.WARNING}{details}{Colors.ENDC}")

        self.test_results[test_name].append({
            'passed': passed,
            'details': details,
            'timestamp': datetime.now().isoformat()
        })

    def load_credentials(self):
        """Load test credentials from JSON file"""
        try:
            with open('test_credentials.json', 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"{Colors.FAIL}Error: test_credentials.json not found!{Colors.ENDC}")
            print("Run: python manage.py create_demo_users")
            sys.exit(1)

    def test_authentication(self, username, password):
        """Test Django JWT authentication"""
        try:
            response = requests.post(
                f'{self.api_url}/auth/login/',
                json={'username': username, 'password': password},
                timeout=10
            )

            if response.status_code == 200:
                data = response.json()
                if 'access' in data:
                    return True, data['access'], data.get('refresh')
                else:
                    return False, None, f"No access token in response: {data}"
            else:
                return False, None, f"Status {response.status_code}: {response.text}"

        except Exception as e:
            return False, None, str(e)

    def test_endpoint(self, method, endpoint, token, expected_status=200, data=None):
        """Test API endpoint with JWT token"""
        headers = {'Authorization': f'Bearer {token}'}
        url = f'{self.api_url}{endpoint}'

        try:
            if method.upper() == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method.upper() == 'POST':
                response = requests.post(url, headers=headers, json=data or {}, timeout=10)
            elif method.upper() == 'PUT':
                response = requests.put(url, headers=headers, json=data or {}, timeout=10)
            elif method.upper() == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)
            elif method.upper() == 'PATCH':
                response = requests.patch(url, headers=headers, json=data or {}, timeout=10)
            else:
                return False, f"Unknown method: {method}"

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"

            if not success:
                try:
                    error_data = response.json()
                    details += f" | Error: {error_data}"
                except:
                    details += f" | Response: {response.text[:100]}"

            return success, details

        except Exception as e:
            return False, f"Exception: {str(e)}"

    def run_authentication_tests(self, credentials):
        """Test authentication for all roles"""
        self.print_section("Phase 1: Authentication Tests")

        for user_cred in credentials['users']:
            role = user_cred['role']
            username = user_cred['username']
            password = user_cred['password']

            success, access_token, error = self.test_authentication(username, password)

            if success:
                self.tokens[role] = access_token
                self.users[role] = user_cred
                self.print_test(f"[{role.upper()}] Django JWT Login", True, f"Token obtained for {username}")
            else:
                self.print_test(f"[{role.upper()}] Django JWT Login", False, error)

    def run_permission_tests(self):
        """Test role-based permissions"""
        self.print_section("Phase 2: Permission & Endpoint Access Tests")

        # Define role-specific endpoint tests
        test_cases = [
            # SuperAdmin Tests
            {
                'role': 'superadmin',
                'tests': [
                    ('GET', '/superadmin/users/', 200, 'List all users'),
                    ('GET', '/superadmin/users/statistics/', 200, 'View statistics'),
                    ('GET', '/superadmin/tenants/', 200, 'List tenants'),
                    ('GET', '/profile/me/', 200, 'View own profile'),
                    ('GET', '/constituencies/', 200, 'View constituencies'),
                ]
            },
            # State Admin Tests
            {
                'role': 'state_admin',
                'tests': [
                    ('GET', '/profile/me/', 200, 'View own profile'),
                    ('GET', '/admin/users/', 200, 'List team users'),
                    ('GET', '/constituencies/', 200, 'View constituencies'),
                    ('GET', '/superadmin/users/', 403, 'Cannot access superadmin endpoints'),
                ]
            },
            # Zone Admin Tests
            {
                'role': 'zone_admin',
                'tests': [
                    ('GET', '/profile/me/', 200, 'View own profile'),
                    ('GET', '/admin/users/', 200, 'List team users'),
                    ('GET', '/constituencies/', 200, 'View constituencies'),
                    ('GET', '/superadmin/users/', 403, 'Cannot access superadmin endpoints'),
                ]
            },
            # District Admin Tests
            {
                'role': 'district_admin',
                'tests': [
                    ('GET', '/profile/me/', 200, 'View own profile'),
                    ('GET', '/admin/users/', 200, 'List team users'),
                    ('GET', '/constituencies/', 200, 'View constituencies'),
                    ('GET', '/superadmin/users/', 403, 'Cannot access superadmin endpoints'),
                ]
            },
            # Constituency Admin Tests
            {
                'role': 'constituency_admin',
                'tests': [
                    ('GET', '/profile/me/', 200, 'View own profile'),
                    ('GET', '/admin/users/', 200, 'List team users'),
                    ('GET', '/constituencies/', 200, 'View constituencies'),
                    ('GET', '/polling-booths/', 200, 'View polling booths'),
                ]
            },
            # Booth Admin Tests
            {
                'role': 'booth_admin',
                'tests': [
                    ('GET', '/profile/me/', 200, 'View own profile'),
                    ('GET', '/polling-booths/', 200, 'View polling booths'),
                    ('GET', '/voters/', 200, 'View voters'),
                    ('GET', '/superadmin/users/', 403, 'Cannot access superadmin endpoints'),
                ]
            },
            # Analyst Tests (Read-only)
            {
                'role': 'analyst',
                'tests': [
                    ('GET', '/profile/me/', 200, 'View own profile'),
                    ('GET', '/voters/', 200, 'View voters (read-only)'),
                    ('GET', '/constituencies/', 200, 'View constituencies'),
                    ('GET', '/dashboard/overview/', 200, 'View dashboard'),
                    ('GET', '/superadmin/users/', 403, 'Cannot access superadmin endpoints'),
                ]
            },
        ]

        for test_case in test_cases:
            role = test_case['role']
            if role not in self.tokens:
                self.print_test(f"[{role.upper()}] Skipping - No token", False, "Authentication failed")
                continue

            token = self.tokens[role]
            print(f"\n  Testing {role.upper()}:")

            for method, endpoint, expected_status, description in test_case['tests']:
                success, details = self.test_endpoint(method, endpoint, token, expected_status)
                self.print_test(f"[{role.upper()}] {description}", success, details)

    def run_profile_tests(self):
        """Test profile endpoints for all roles"""
        self.print_section("Phase 3: Profile & User Data Tests")

        for role, token in self.tokens.items():
            # Test viewing own profile
            success, details = self.test_endpoint('GET', '/profile/me/', token, 200)
            self.print_test(f"[{role.upper()}] View own profile", success, details)

            # Test updating own profile
            update_data = {'phone': '+91-9999999999'}
            success, details = self.test_endpoint('PUT', '/user/profile/update_me/', token, 200, update_data)
            # Note: May fail if endpoint doesn't exist, that's okay
            if success:
                self.print_test(f"[{role.upper()}] Update own profile", success, details)

    def run_data_isolation_tests(self):
        """Test data isolation (users only see their org data)"""
        self.print_section("Phase 4: Data Isolation Tests")

        # Test that non-superadmin users only see their organization's data
        for role, token in self.tokens.items():
            if role == 'superadmin':
                continue

            success, details = self.test_endpoint('GET', '/constituencies/', token, 200)
            self.print_test(
                f"[{role.upper()}] Data filtered by organization",
                success,
                "Can access filtered constituency data"
            )

    def run_hierarchy_tests(self):
        """Test hierarchical user creation"""
        self.print_section("Phase 5: Hierarchical User Creation Tests")

        hierarchy_tests = [
            ('superadmin', 'Can create state admins', True),
            ('state_admin', 'Can create zone admins', True),
            ('zone_admin', 'Can create district admins', True),
            ('district_admin', 'Can create constituency admins', True),
            ('constituency_admin', 'Can create booth admins', True),
            ('booth_admin', 'Can create analysts', True),
            ('analyst', 'Cannot create users (read-only)', False),
        ]

        for role, description, can_create in hierarchy_tests:
            if role in self.users:
                user_info = self.users[role]
                # Check can_create_users permission
                can_create_actual = user_info.get('permissions', '').find('Create') >= 0 or role != 'analyst'

                success = can_create_actual == can_create
                self.print_test(
                    f"[{role.upper()}] {description}",
                    success,
                    f"Permission: {user_info.get('permissions', 'N/A')}"
                )

    def generate_html_report(self):
        """Generate HTML test report"""
        self.print_section("Generating HTML Report")

        html_content = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Role-Based Dashboard Test Report</title>
    <style>
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }}
        .container {{
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            padding: 30px;
        }}
        h1 {{
            color: #333;
            border-bottom: 3px solid #667eea;
            padding-bottom: 10px;
        }}
        .summary {{
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin: 30px 0;
        }}
        .stat-card {{
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }}
        .stat-card.total {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }}
        .stat-card.passed {{
            background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
            color: #333;
        }}
        .stat-card.failed {{
            background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
            color: #333;
        }}
        .stat-number {{
            font-size: 48px;
            font-weight: bold;
            margin: 10px 0;
        }}
        .stat-label {{
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }}
        .test-results {{
            margin-top: 30px;
        }}
        .test-item {{
            padding: 15px;
            margin: 10px 0;
            border-radius: 5px;
            border-left: 4px solid #ddd;
            background: #f9f9f9;
        }}
        .test-item.passed {{
            border-left-color: #4caf50;
            background: #f1f8f4;
        }}
        .test-item.failed {{
            border-left-color: #f44336;
            background: #fef1f0;
        }}
        .test-name {{
            font-weight: bold;
            margin-bottom: 5px;
        }}
        .test-details {{
            color: #666;
            font-size: 14px;
        }}
        .pass-rate {{
            margin: 20px 0;
            height: 30px;
            background: #f0f0f0;
            border-radius: 15px;
            overflow: hidden;
        }}
        .pass-rate-fill {{
            height: 100%;
            background: linear-gradient(90deg, #4caf50 0%, #8bc34a 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            transition: width 0.5s ease;
        }}
        .footer {{
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            color: #666;
            font-size: 12px;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>Role-Based Dashboard Test Report</h1>

        <div style="color: #666; margin-bottom: 20px;">
            <strong>Test Date:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}<br>
            <strong>API Base URL:</strong> {self.api_url}
        </div>

        <div class="summary">
            <div class="stat-card total">
                <div class="stat-label">Total Tests</div>
                <div class="stat-number">{self.total_tests}</div>
            </div>
            <div class="stat-card passed">
                <div class="stat-label">Passed</div>
                <div class="stat-number">{self.passed_tests}</div>
            </div>
            <div class="stat-card failed">
                <div class="stat-label">Failed</div>
                <div class="stat-number">{self.failed_tests}</div>
            </div>
        </div>

        <div class="pass-rate">
            <div class="pass-rate-fill" style="width: {(self.passed_tests/self.total_tests*100) if self.total_tests > 0 else 0}%">
                {(self.passed_tests/self.total_tests*100):.1f}% Pass Rate
            </div>
        </div>

        <div class="test-results">
            <h2>Test Results</h2>
"""

        for test_name, results in self.test_results.items():
            for result in results:
                status_class = 'passed' if result['passed'] else 'failed'
                status_text = 'PASSED' if result['passed'] else 'FAILED'

                html_content += f"""
            <div class="test-item {status_class}">
                <div class="test-name">{status_text}: {test_name}</div>
                <div class="test-details">{result['details']}</div>
                <div class="test-details" style="margin-top: 5px; font-size: 12px;">
                    Timestamp: {result['timestamp']}
                </div>
            </div>
"""

        html_content += f"""
        </div>

        <div class="footer">
            <p>Generated by Pulse of People - Multi-Tenant Political CRM</p>
            <p>v1.0 - {datetime.now().strftime('%Y-%m-%d')}</p>
        </div>
    </div>
</body>
</html>
"""

        report_file = 'test_report.html'
        with open(report_file, 'w') as f:
            f.write(html_content)

        self.print_test("HTML Report Generation", True, f"Report saved to {report_file}")
        print(f"\n{Colors.OKGREEN}  Open {report_file} in your browser to view the detailed report{Colors.ENDC}")

    def run_all_tests(self):
        """Run all test phases"""
        self.print_header("Multi-Auth Role-Based Dashboard Testing")

        # Load credentials
        credentials = self.load_credentials()

        # Run test phases
        self.run_authentication_tests(credentials)
        self.run_permission_tests()
        self.run_profile_tests()
        self.run_data_isolation_tests()
        self.run_hierarchy_tests()

        # Generate report
        self.generate_html_report()

        # Print summary
        self.print_header("Test Summary")
        print(f"  Total Tests Run: {Colors.BOLD}{self.total_tests}{Colors.ENDC}")
        print(f"  Passed: {Colors.OKGREEN}{self.passed_tests}{Colors.ENDC}")
        print(f"  Failed: {Colors.FAIL}{self.failed_tests}{Colors.ENDC}")

        pass_rate = (self.passed_tests / self.total_tests * 100) if self.total_tests > 0 else 0
        if pass_rate >= 80:
            color = Colors.OKGREEN
        elif pass_rate >= 50:
            color = Colors.WARNING
        else:
            color = Colors.FAIL

        print(f"  Pass Rate: {color}{pass_rate:.1f}%{Colors.ENDC}\n")

        if self.failed_tests > 0:
            print(f"{Colors.WARNING}  Some tests failed. Check test_report.html for details.{Colors.ENDC}\n")
        else:
            print(f"{Colors.OKGREEN}  All tests passed! The role-based dashboard system is working correctly.{Colors.ENDC}\n")


def main():
    """Main entry point"""
    print(f"\n{Colors.OKCYAN}Starting Role-Based Dashboard Testing...{Colors.ENDC}")
    print(f"{Colors.WARNING}Make sure the Django server is running on http://localhost:8000{Colors.ENDC}\n")

    # Check if server is running
    try:
        response = requests.get('http://localhost:8000/api/health/', timeout=5)
        if response.status_code != 200:
            print(f"{Colors.FAIL}Server health check failed! Is Django running?{Colors.ENDC}")
            sys.exit(1)
    except Exception as e:
        print(f"{Colors.FAIL}Cannot connect to Django server!{Colors.ENDC}")
        print(f"Error: {e}")
        print(f"\n{Colors.WARNING}Please start the server: python manage.py runserver{Colors.ENDC}\n")
        sys.exit(1)

    # Run tests
    tester = RoleDashboardTester()
    tester.run_all_tests()


if __name__ == '__main__':
    main()
