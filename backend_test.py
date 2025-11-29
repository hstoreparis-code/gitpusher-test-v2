#!/usr/bin/env python3
"""
Backend API Testing for No-Code GitHub Pusher
Tests all authentication and workflow endpoints
"""

import requests
import sys
import json
import uuid
from datetime import datetime
from pathlib import Path
import tempfile
import os

class BackendAPITester:
    def __init__(self, base_url="https://gitpusher-1.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details="", expected_status=None, actual_status=None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
            if expected_status and actual_status:
                print(f"   Expected: {expected_status}, Got: {actual_status}")
        
        self.test_results.append({
            "name": name,
            "success": success,
            "details": details,
            "expected_status": expected_status,
            "actual_status": actual_status
        })
        return success

    def test_api_health(self):
        """Test basic API connectivity"""
        try:
            response = requests.get(f"{self.api_url}/", timeout=10)
            success = response.status_code == 200
            return self.log_test(
                "API Health Check", 
                success, 
                f"API root endpoint accessible",
                200, 
                response.status_code
            )
        except Exception as e:
            return self.log_test("API Health Check", False, f"Connection error: {str(e)}")

    def test_user_registration(self):
        """Test user registration endpoint"""
        test_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        test_password = "TestPassword123!"
        test_name = "Test User"
        
        try:
            response = requests.post(
                f"{self.api_url}/auth/register",
                json={
                    "email": test_email,
                    "password": test_password,
                    "display_name": test_name
                },
                timeout=10
            )
            
            success = response.status_code == 200
            if success:
                data = response.json()
                self.user_id = data.get("id")
                # Store credentials for login test
                self.test_email = test_email
                self.test_password = test_password
                
            return self.log_test(
                "User Registration",
                success,
                f"Email: {test_email}",
                200,
                response.status_code
            )
        except Exception as e:
            return self.log_test("User Registration", False, f"Error: {str(e)}")

    def test_user_login(self):
        """Test user login endpoint"""
        if not hasattr(self, 'test_email'):
            return self.log_test("User Login", False, "No registered user available")
            
        try:
            response = requests.post(
                f"{self.api_url}/auth/login",
                json={
                    "email": self.test_email,
                    "password": self.test_password
                },
                timeout=10
            )
            
            success = response.status_code == 200
            if success:
                data = response.json()
                self.token = data.get("access_token")
                
            return self.log_test(
                "User Login",
                success,
                f"Token received: {'Yes' if self.token else 'No'}",
                200,
                response.status_code
            )
        except Exception as e:
            return self.log_test("User Login", False, f"Error: {str(e)}")

    def test_user_profile(self):
        """Test user profile endpoint with JWT"""
        if not self.token:
            return self.log_test("User Profile", False, "No authentication token available")
            
        try:
            response = requests.get(
                f"{self.api_url}/auth/me",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=10
            )
            
            success = response.status_code == 200
            details = ""
            if success:
                data = response.json()
                details = f"User ID: {data.get('id')}, Email: {data.get('email')}"
                
            return self.log_test(
                "User Profile",
                success,
                details,
                200,
                response.status_code
            )
        except Exception as e:
            return self.log_test("User Profile", False, f"Error: {str(e)}")

    def test_create_project(self):
        """Test project creation endpoint"""
        if not self.token:
            return self.log_test("Create Project", False, "No authentication token available")
            
        try:
            response = requests.post(
                f"{self.api_url}/workflows/projects",
                json={
                    "name": f"test-project-{uuid.uuid4().hex[:8]}",
                    "description": "Test project for API testing",
                    "language": "en"
                },
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=10
            )
            
            success = response.status_code == 200
            if success:
                data = response.json()
                self.project_id = data.get("id")
                
            return self.log_test(
                "Create Project",
                success,
                f"Project ID: {getattr(self, 'project_id', 'None')}",
                200,
                response.status_code
            )
        except Exception as e:
            return self.log_test("Create Project", False, f"Error: {str(e)}")

    def test_list_projects(self):
        """Test project listing endpoint"""
        if not self.token:
            return self.log_test("List Projects", False, "No authentication token available")
            
        try:
            response = requests.get(
                f"{self.api_url}/workflows/projects",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=10
            )
            
            success = response.status_code == 200
            details = ""
            if success:
                data = response.json()
                details = f"Projects found: {len(data)}"
                
            return self.log_test(
                "List Projects",
                success,
                details,
                200,
                response.status_code
            )
        except Exception as e:
            return self.log_test("List Projects", False, f"Error: {str(e)}")

    def test_file_upload(self):
        """Test file upload endpoint"""
        if not self.token or not hasattr(self, 'project_id'):
            return self.log_test("File Upload", False, "No token or project available")
            
        try:
            # Create a temporary test file
            with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
                f.write("This is a test file for upload testing.")
                temp_file_path = f.name
            
            try:
                with open(temp_file_path, 'rb') as f:
                    files = {'files': ('test.txt', f, 'text/plain')}
                    response = requests.post(
                        f"{self.api_url}/workflows/projects/{self.project_id}/upload",
                        files=files,
                        headers={"Authorization": f"Bearer {self.token}"},
                        timeout=15
                    )
                
                success = response.status_code == 200
                details = ""
                if success:
                    data = response.json()
                    details = f"Files uploaded: {data.get('uploaded', 0)}"
                    
                return self.log_test(
                    "File Upload",
                    success,
                    details,
                    200,
                    response.status_code
                )
            finally:
                # Clean up temp file
                os.unlink(temp_file_path)
                
        except Exception as e:
            return self.log_test("File Upload", False, f"Error: {str(e)}")

    def test_project_process_without_github(self):
        """Test project processing without GitHub token (should fail gracefully)"""
        if not self.token or not hasattr(self, 'project_id'):
            return self.log_test("Process Project (No GitHub)", False, "No token or project available")
            
        try:
            response = requests.post(
                f"{self.api_url}/workflows/projects/{self.project_id}/process",
                json={},
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=20
            )
            
            # Should return 400 because no GitHub token is linked
            success = response.status_code == 400
            details = ""
            if success:
                data = response.json()
                details = f"Error message: {data.get('detail', 'No detail')}"
            else:
                details = f"Unexpected status code: {response.status_code}"
                
            return self.log_test(
                "Process Project (No GitHub)",
                success,
                details,
                400,
                response.status_code
            )
        except Exception as e:
            return self.log_test("Process Project (No GitHub)", False, f"Error: {str(e)}")

    def test_admin_login_and_users_endpoint(self):
        """Test admin login and /api/admin/users endpoint after AdminUserSummary model fix"""
        try:
            # Step 1: Admin login
            admin_email = "admin@pushin.app"
            admin_password = "Admin1234!"
            
            response = requests.post(
                f"{self.api_url}/auth/login",
                json={
                    "email": admin_email,
                    "password": admin_password
                },
                timeout=10
            )
            
            if response.status_code != 200:
                return self.log_test(
                    "Admin Login",
                    False,
                    f"Admin login failed: {response.text}",
                    200,
                    response.status_code
                )
            
            admin_token = response.json().get("access_token")
            if not admin_token:
                return self.log_test("Admin Login", False, "No access token received")
            
            self.log_test("Admin Login", True, "Admin successfully logged in")
            
            # Step 2: Verify admin status
            response = requests.get(
                f"{self.api_url}/auth/admin-status",
                headers={"Authorization": f"Bearer {admin_token}"},
                timeout=10
            )
            
            if response.status_code != 200:
                return self.log_test(
                    "Admin Status Check",
                    False,
                    f"Admin status check failed: {response.text}",
                    200,
                    response.status_code
                )
            
            admin_status = response.json()
            if not admin_status.get("is_admin"):
                return self.log_test("Admin Status Check", False, "User is not admin")
            
            self.log_test("Admin Status Check", True, "Admin status confirmed")
            
            # Step 3: Test /api/admin/users endpoint
            response = requests.get(
                f"{self.api_url}/admin/users",
                headers={"Authorization": f"Bearer {admin_token}"},
                timeout=10
            )
            
            success = response.status_code == 200
            details = ""
            
            if success:
                try:
                    users_data = response.json()
                    if isinstance(users_data, list):
                        details = f"Successfully retrieved {len(users_data)} users"
                        # Check if any user has email field (should be str now, not EmailStr)
                        if users_data:
                            sample_user = users_data[0]
                            if "email" in sample_user:
                                details += f", sample email: {sample_user['email']}"
                    else:
                        success = False
                        details = f"Expected list, got: {type(users_data)}"
                except json.JSONDecodeError as e:
                    success = False
                    details = f"JSON decode error: {str(e)}"
            else:
                details = f"HTTP error: {response.text}"
            
            return self.log_test(
                "Admin Users Endpoint",
                success,
                details,
                200,
                response.status_code
            )
            
        except Exception as e:
            return self.log_test("Admin Login and Users Endpoint", False, f"Error: {str(e)}")

    def test_invalid_auth(self):
        """Test endpoints with invalid authentication"""
        try:
            response = requests.get(
                f"{self.api_url}/auth/me",
                headers={"Authorization": "Bearer invalid_token"},
                timeout=10
            )
            
            success = response.status_code == 401
            return self.log_test(
                "Invalid Auth Handling",
                success,
                "Should reject invalid tokens",
                401,
                response.status_code
            )
        except Exception as e:
            return self.log_test("Invalid Auth Handling", False, f"Error: {str(e)}")

    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Backend API Tests")
        print(f"Testing against: {self.base_url}")
        print("-" * 50)
        
        # Test sequence
        tests = [
            self.test_api_health,
            self.test_user_registration,
            self.test_user_login,
            self.test_user_profile,
            self.test_create_project,
            self.test_list_projects,
            self.test_file_upload,
            self.test_project_process_without_github,
            self.test_admin_login_and_users_endpoint,
            self.test_invalid_auth,
        ]
        
        for test in tests:
            test()
            
        print("-" * 50)
        print(f"📊 Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All backend tests passed!")
            return True
        else:
            print("⚠️  Some backend tests failed")
            return False

    def get_summary(self):
        """Get test summary"""
        return {
            "total_tests": self.tests_run,
            "passed_tests": self.tests_passed,
            "success_rate": (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0,
            "test_results": self.test_results
        }

def main():
    tester = BackendAPITester()
    success = tester.run_all_tests()
    
    # Save results
    summary = tester.get_summary()
    with open("/app/backend_test_results.json", "w") as f:
        json.dump(summary, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())