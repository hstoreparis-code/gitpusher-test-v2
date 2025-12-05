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
try:
    import pyotp
    PYOTP_AVAILABLE = True
except ImportError:
    PYOTP_AVAILABLE = False
    print("⚠️ pyotp not available - 2FA tests will be limited")

class BackendAPITester:
    def __init__(self, base_url="https://megadash-secure.preview.emergentagent.com"):
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

    def test_support_chat_system(self):
        """Test complete support chat system flow"""
        print("\n🔧 Testing Support Chat System...")
        
        # Step 1: Login as demo user
        try:
            response = requests.post(
                f"{self.api_url}/auth/demo",
                timeout=10
            )
            
            if response.status_code != 200:
                return self.log_test(
                    "Support Chat - Demo Login",
                    False,
                    f"Demo login failed: {response.text}",
                    200,
                    response.status_code
                )
            
            demo_token = response.json().get("access_token")
            if not demo_token:
                return self.log_test("Support Chat - Demo Login", False, "No access token received")
            
            self.log_test("Support Chat - Demo Login", True, "Demo user successfully logged in")
            
        except Exception as e:
            return self.log_test("Support Chat - Demo Login", False, f"Error: {str(e)}")
        
        # Step 2: Demo user sends a support message
        try:
            user_message = "J'ai un problème avec mes crédits"
            response = requests.post(
                f"{self.api_url}/support/messages",
                json={"message": user_message},
                headers={"Authorization": f"Bearer {demo_token}"},
                timeout=10
            )
            
            success = response.status_code == 200
            details = ""
            if success:
                data = response.json()
                if data.get("ok"):
                    details = f"Message sent successfully, ID: {data.get('message_id', 'N/A')}"
                else:
                    success = False
                    details = "Response missing 'ok' field"
            else:
                details = f"Failed to send message: {response.text}"
            
            if not self.log_test(
                "Support Chat - User Send Message",
                success,
                details,
                200,
                response.status_code
            ):
                return False
                
        except Exception as e:
            return self.log_test("Support Chat - User Send Message", False, f"Error: {str(e)}")
        
        # Step 3: Login as admin
        try:
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
                    "Support Chat - Admin Login",
                    False,
                    f"Admin login failed: {response.text}",
                    200,
                    response.status_code
                )
            
            admin_token = response.json().get("access_token")
            if not admin_token:
                return self.log_test("Support Chat - Admin Login", False, "No access token received")
            
            self.log_test("Support Chat - Admin Login", True, "Admin successfully logged in")
            
        except Exception as e:
            return self.log_test("Support Chat - Admin Login", False, f"Error: {str(e)}")
        
        # Step 4: Admin retrieves all conversations
        try:
            response = requests.get(
                f"{self.api_url}/support/conversations",
                headers={"Authorization": f"Bearer {admin_token}"},
                timeout=10
            )
            
            success = response.status_code == 200
            details = ""
            demo_user_id = None
            
            if success:
                conversations = response.json()
                if isinstance(conversations, list):
                    details = f"Retrieved {len(conversations)} conversation(s)"
                    
                    # Find the demo user's conversation
                    demo_conversation = None
                    for conv in conversations:
                        if conv.get("user_email") == "demo@pushin.app":
                            demo_conversation = conv
                            demo_user_id = conv.get("user_id")
                            break
                    
                    if demo_conversation:
                        messages = demo_conversation.get("messages", [])
                        user_msg_found = any(
                            msg.get("message") == user_message and not msg.get("is_admin")
                            for msg in messages
                        )
                        if user_msg_found:
                            details += f", found demo user message"
                        else:
                            success = False
                            details += f", demo user message NOT found in conversation"
                    else:
                        success = False
                        details += f", demo user conversation NOT found"
                else:
                    success = False
                    details = f"Expected list, got: {type(conversations)}"
            else:
                details = f"Failed to retrieve conversations: {response.text}"
            
            if not self.log_test(
                "Support Chat - Admin Get Conversations",
                success,
                details,
                200,
                response.status_code
            ):
                return False
                
        except Exception as e:
            return self.log_test("Support Chat - Admin Get Conversations", False, f"Error: {str(e)}")
        
        # Step 5: Admin sends a response to the user
        try:
            if not demo_user_id:
                return self.log_test(
                    "Support Chat - Admin Send Response",
                    False,
                    "Demo user ID not found from conversations"
                )
            
            admin_response = "Bonjour, je peux vous aider. Quel est le problème exact ?"
            response = requests.post(
                f"{self.api_url}/support/messages",
                json={
                    "message": admin_response,
                    "user_id": demo_user_id
                },
                headers={"Authorization": f"Bearer {admin_token}"},
                timeout=10
            )
            
            success = response.status_code == 200
            details = ""
            if success:
                data = response.json()
                if data.get("ok"):
                    details = f"Admin response sent successfully, ID: {data.get('message_id', 'N/A')}"
                else:
                    success = False
                    details = "Response missing 'ok' field"
            else:
                details = f"Failed to send admin response: {response.text}"
            
            if not self.log_test(
                "Support Chat - Admin Send Response",
                success,
                details,
                200,
                response.status_code
            ):
                return False
                
        except Exception as e:
            return self.log_test("Support Chat - Admin Send Response", False, f"Error: {str(e)}")
        
        # Step 6: User retrieves their messages and sees admin response
        try:
            response = requests.get(
                f"{self.api_url}/support/my-messages",
                headers={"Authorization": f"Bearer {demo_token}"},
                timeout=10
            )
            
            success = response.status_code == 200
            details = ""
            
            if success:
                messages = response.json()
                if isinstance(messages, list):
                    details = f"Retrieved {len(messages)} message(s)"
                    
                    # Check if user message exists
                    user_msg_found = any(
                        msg.get("message") == user_message and not msg.get("is_admin")
                        for msg in messages
                    )
                    
                    # Check if admin response exists
                    admin_msg_found = any(
                        msg.get("message") == admin_response and msg.get("is_admin")
                        for msg in messages
                    )
                    
                    if user_msg_found and admin_msg_found:
                        details += f", both user and admin messages found"
                    elif user_msg_found:
                        success = False
                        details += f", user message found but admin response NOT found"
                    elif admin_msg_found:
                        success = False
                        details += f", admin response found but user message NOT found"
                    else:
                        success = False
                        details += f", neither user nor admin messages found"
                else:
                    success = False
                    details = f"Expected list, got: {type(messages)}"
            else:
                details = f"Failed to retrieve user messages: {response.text}"
            
            if not self.log_test(
                "Support Chat - User Get Messages",
                success,
                details,
                200,
                response.status_code
            ):
                return False
                
        except Exception as e:
            return self.log_test("Support Chat - User Get Messages", False, f"Error: {str(e)}")
        
        # Step 7: Check admin online status
        try:
            response = requests.get(
                f"{self.api_url}/support/admin-online",
                timeout=10
            )
            
            success = response.status_code == 200
            details = ""
            
            if success:
                data = response.json()
                if "online" in data:
                    details = f"Admin online status: {data.get('online')}, Name: {data.get('admin_name', 'N/A')}"
                else:
                    success = False
                    details = "Response missing 'online' field"
            else:
                details = f"Failed to check admin status: {response.text}"
            
            return self.log_test(
                "Support Chat - Admin Online Status",
                success,
                details,
                200,
                response.status_code
            )
                
        except Exception as e:
            return self.log_test("Support Chat - Admin Online Status", False, f"Error: {str(e)}")

    def test_admin_2fa_endpoints(self):
        """Test complete 2FA admin flow as requested"""
        print("\n🔐 Testing Admin 2FA Endpoints...")
        
        admin_email = "admin@pushin.app"
        admin_password = "Admin1234!"
        
        # Step 1: Ensure admin exists and has valid password
        try:
            response = requests.post(
                f"{self.api_url}/auth/login-admin",
                json={
                    "email": admin_email,
                    "password": admin_password
                },
                timeout=10
            )
            
            if response.status_code != 200:
                return self.log_test(
                    "2FA - Admin User Exists",
                    False,
                    f"Admin login failed: {response.text}",
                    200,
                    response.status_code
                )
            
            login_data = response.json()
            session_cookie = None
            
            # Check if session cookie was set (no 2FA case)
            if "Set-Cookie" in response.headers:
                cookies = response.headers["Set-Cookie"]
                if "gitpusher_session" in cookies:
                    # Extract session cookie value
                    import re
                    match = re.search(r'gitpusher_session=([^;]+)', cookies)
                    if match:
                        session_cookie = match.group(1)
            
            self.log_test("2FA - Admin User Exists", True, f"Admin exists with valid credentials, requires_2fa: {login_data.get('requires_2fa', False)}")
            
        except Exception as e:
            return self.log_test("2FA - Admin User Exists", False, f"Error: {str(e)}")
        
        # Step 2: Test admin-status endpoint with session cookie
        if session_cookie:
            try:
                response = requests.get(
                    f"{self.api_url}/auth/admin-status",
                    cookies={"gitpusher_session": session_cookie},
                    timeout=10
                )
                
                success = response.status_code == 200
                details = ""
                if success:
                    data = response.json()
                    is_admin = data.get("is_admin", False)
                    details = f"Admin status confirmed: {is_admin}"
                    success = is_admin
                else:
                    details = f"Failed to check admin status: {response.text}"
                
                if not self.log_test(
                    "2FA - Admin Status via Cookie",
                    success,
                    details,
                    200,
                    response.status_code
                ):
                    return False
                    
            except Exception as e:
                return self.log_test("2FA - Admin Status via Cookie", False, f"Error: {str(e)}")
        
        # Step 3: Setup 2FA for admin (using session cookie if available, otherwise get JWT token)
        auth_header = None
        if not session_cookie:
            # Need to get JWT token for 2FA setup
            try:
                response = requests.post(
                    f"{self.api_url}/auth/login",
                    json={
                        "email": admin_email,
                        "password": admin_password
                    },
                    timeout=10
                )
                
                if response.status_code == 200:
                    jwt_token = response.json().get("access_token")
                    if jwt_token:
                        auth_header = f"Bearer {jwt_token}"
                        
            except Exception:
                pass
        
        # Setup 2FA
        try:
            headers = {}
            cookies = {}
            
            if session_cookie:
                cookies["gitpusher_session"] = session_cookie
            elif auth_header:
                headers["Authorization"] = auth_header
            else:
                return self.log_test("2FA - Setup", False, "No authentication method available")
            
            response = requests.post(
                f"{self.api_url}/auth/2fa/setup",
                headers=headers,
                cookies=cookies,
                timeout=10
            )
            
            success = response.status_code == 200
            secret = None
            otpauth_url = None
            
            if success:
                data = response.json()
                secret = data.get("secret")
                otpauth_url = data.get("otpauth_url")
                if secret and otpauth_url:
                    details = f"2FA setup successful, secret received: {secret[:8]}..."
                else:
                    success = False
                    details = "2FA setup response missing secret or otpauth_url"
            else:
                details = f"2FA setup failed: {response.text}"
            
            if not self.log_test(
                "2FA - Setup",
                success,
                details,
                200,
                response.status_code
            ):
                return False
                
        except Exception as e:
            return self.log_test("2FA - Setup", False, f"Error: {str(e)}")
        
        # Step 4: Generate TOTP code and verify 2FA
        if secret:
            try:
                import pyotp
                totp = pyotp.TOTP(secret)
                code = totp.now()
                
                response = requests.post(
                    f"{self.api_url}/auth/2fa/verify",
                    json={"code": code},
                    headers=headers,
                    cookies=cookies,
                    timeout=10
                )
                
                success = response.status_code == 200
                if success:
                    data = response.json()
                    if data.get("status") == "ok":
                        details = "2FA verification successful"
                    else:
                        success = False
                        details = f"2FA verification failed: unexpected response {data}"
                else:
                    details = f"2FA verification failed: {response.text}"
                
                if not self.log_test(
                    "2FA - Verify",
                    success,
                    details,
                    200,
                    response.status_code
                ):
                    return False
                    
            except ImportError:
                return self.log_test("2FA - Verify", False, "pyotp library not available")
            except Exception as e:
                return self.log_test("2FA - Verify", False, f"Error: {str(e)}")
        
        # Step 5: Test 2FA login flow
        try:
            # First, try login-admin again (should now require 2FA)
            response = requests.post(
                f"{self.api_url}/auth/login-admin",
                json={
                    "email": admin_email,
                    "password": admin_password
                },
                timeout=10
            )
            
            success = response.status_code == 200
            temp_token = None
            
            if success:
                data = response.json()
                requires_2fa = data.get("requires_2fa", False)
                temp_token = data.get("temp_token")
                
                if requires_2fa and temp_token:
                    details = f"2FA required as expected, temp_token received"
                else:
                    # If 2FA was not enabled yet, this is still valid
                    details = f"Login successful, requires_2fa: {requires_2fa}"
            else:
                details = f"Admin login failed: {response.text}"
            
            if not self.log_test(
                "2FA - Login Admin (2FA Flow)",
                success,
                details,
                200,
                response.status_code
            ):
                return False
            
            # If we have a temp_token, test the 2FA login completion
            if temp_token and secret:
                try:
                    import pyotp
                    totp = pyotp.TOTP(secret)
                    code = totp.now()
                    
                    response = requests.post(
                        f"{self.api_url}/auth/login-2fa",
                        json={
                            "code": code,
                            "temp_token": temp_token
                        },
                        timeout=10
                    )
                    
                    success = response.status_code == 200
                    new_session_cookie = None
                    
                    if success:
                        data = response.json()
                        if data.get("status") == "ok":
                            # Check for new session cookie
                            if "Set-Cookie" in response.headers:
                                cookies = response.headers["Set-Cookie"]
                                if "gitpusher_session" in cookies:
                                    import re
                                    match = re.search(r'gitpusher_session=([^;]+)', cookies)
                                    if match:
                                        new_session_cookie = match.group(1)
                            
                            details = f"2FA login completion successful, session cookie: {'Yes' if new_session_cookie else 'No'}"
                        else:
                            success = False
                            details = f"2FA login completion failed: unexpected response {data}"
                    else:
                        details = f"2FA login completion failed: {response.text}"
                    
                    if not self.log_test(
                        "2FA - Login Completion",
                        success,
                        details,
                        200,
                        response.status_code
                    ):
                        return False
                    
                    # Test admin-status with new session cookie
                    if new_session_cookie:
                        try:
                            response = requests.get(
                                f"{self.api_url}/auth/admin-status",
                                cookies={"gitpusher_session": new_session_cookie},
                                timeout=10
                            )
                            
                            success = response.status_code == 200
                            if success:
                                data = response.json()
                                is_admin = data.get("is_admin", False)
                                details = f"Admin status after 2FA login: {is_admin}"
                                success = is_admin
                            else:
                                details = f"Failed to check admin status: {response.text}"
                            
                            self.log_test(
                                "2FA - Admin Status After 2FA Login",
                                success,
                                details,
                                200,
                                response.status_code
                            )
                            
                        except Exception as e:
                            self.log_test("2FA - Admin Status After 2FA Login", False, f"Error: {str(e)}")
                        
                        # Store the session cookie for protected endpoint tests
                        self.admin_session_cookie = new_session_cookie
                    
                except ImportError:
                    self.log_test("2FA - Login Completion", False, "pyotp library not available")
                except Exception as e:
                    self.log_test("2FA - Login Completion", False, f"Error: {str(e)}")
                    
        except Exception as e:
            return self.log_test("2FA - Login Admin (2FA Flow)", False, f"Error: {str(e)}")
        
        return True

    def test_admin_protected_endpoints(self):
        """Test that admin endpoints are properly protected and accessible after 2FA"""
        print("\n🛡️ Testing Admin Protected Endpoints...")
        
        # Test endpoints without authentication (should fail)
        protected_endpoints = [
            "/admin/users",
            "/admin/performance", 
            "/admin/ai-indexing"
        ]
        
        for endpoint in protected_endpoints:
            try:
                response = requests.get(
                    f"{self.api_url}{endpoint}",
                    timeout=10
                )
                
                # Should return 401 or 403
                success = response.status_code in [401, 403]
                details = f"Endpoint properly protected, returned {response.status_code}"
                if not success:
                    details = f"Endpoint not protected, returned {response.status_code}"
                
                self.log_test(
                    f"Protected Endpoint - {endpoint} (No Auth)",
                    success,
                    details,
                    "401/403",
                    response.status_code
                )
                
            except Exception as e:
                self.log_test(f"Protected Endpoint - {endpoint} (No Auth)", False, f"Error: {str(e)}")
        
        # Test with session cookie if available
        if hasattr(self, 'admin_session_cookie') and self.admin_session_cookie:
            for endpoint in protected_endpoints:
                try:
                    response = requests.get(
                        f"{self.api_url}{endpoint}",
                        cookies={"gitpusher_session": self.admin_session_cookie},
                        timeout=10
                    )
                    
                    success = response.status_code == 200
                    details = ""
                    if success:
                        try:
                            data = response.json()
                            if isinstance(data, list):
                                details = f"Endpoint accessible, returned {len(data)} items"
                            elif isinstance(data, dict):
                                details = f"Endpoint accessible, returned data object"
                            else:
                                details = f"Endpoint accessible, returned {type(data)}"
                        except:
                            details = "Endpoint accessible, non-JSON response"
                    else:
                        details = f"Endpoint not accessible: {response.text[:100]}"
                    
                    self.log_test(
                        f"Protected Endpoint - {endpoint} (With Auth)",
                        success,
                        details,
                        200,
                        response.status_code
                    )
                    
                except Exception as e:
                    self.log_test(f"Protected Endpoint - {endpoint} (With Auth)", False, f"Error: {str(e)}")
        else:
            self.log_test("Protected Endpoints (With Auth)", False, "No admin session cookie available from 2FA test")
        
        return True

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
            self.test_support_chat_system,
            self.test_admin_2fa_endpoints,
            self.test_admin_protected_endpoints,
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