#!/usr/bin/env python3
"""
Test 2FA Admin Endpoints as requested
Tests the complete 2FA flow for admin users
"""

import requests
import json
import pyotp
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os

class Admin2FATest:
    def __init__(self, base_url="https://megadash-secure.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.admin_email = "admin@pushin.app"
        self.admin_password = "Admin1234!"
        self.results = []

    def log_result(self, step, success, details=""):
        """Log test result"""
        status = "✅" if success else "❌"
        print(f"{status} {step}: {details}")
        self.results.append({"step": step, "success": success, "details": details})
        return success

    async def reset_admin_2fa(self):
        """Reset admin 2FA settings for clean test"""
        try:
            client = AsyncIOMotorClient('mongodb://localhost:27017')
            db = client['test_database']
            
            # Reset 2FA settings
            await db.users.update_one(
                {"email": self.admin_email},
                {"$unset": {
                    "two_fa_secret": "",
                    "two_fa_enabled": "",
                    "requires_2fa": ""
                }}
            )
            
            client.close()
            print("🔄 Admin 2FA settings reset for clean test")
            return True
        except Exception as e:
            print(f"❌ Failed to reset admin 2FA: {e}")
            return False

    async def check_admin_2fa_status(self):
        """Check current 2FA status in database"""
        try:
            client = AsyncIOMotorClient('mongodb://localhost:27017')
            db = client['test_database']
            
            admin = await db.users.find_one({"email": self.admin_email})
            if admin:
                return {
                    "two_fa_enabled": admin.get("two_fa_enabled", False),
                    "two_fa_secret": admin.get("two_fa_secret"),
                    "requires_2fa": admin.get("requires_2fa", False)
                }
            
            client.close()
            return None
        except Exception as e:
            print(f"❌ Failed to check admin 2FA status: {e}")
            return None

    def test_step_1_admin_exists(self):
        """Step 1: Ensure admin exists with valid password"""
        print("\n📋 Step 1: Verify admin user exists and has valid password")
        
        try:
            response = requests.post(
                f"{self.api_url}/auth/login-admin",
                json={
                    "email": self.admin_email,
                    "password": self.admin_password
                },
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                requires_2fa = data.get("requires_2fa", False)
                
                # Extract session cookie if present
                session_cookie = None
                if "Set-Cookie" in response.headers:
                    cookies = response.headers["Set-Cookie"]
                    if "gitpusher_session" in cookies:
                        import re
                        match = re.search(r'gitpusher_session=([^;]+)', cookies)
                        if match:
                            session_cookie = match.group(1)
                
                return self.log_result(
                    "Admin user verification",
                    True,
                    f"Admin exists, requires_2fa: {requires_2fa}, session_cookie: {'Yes' if session_cookie else 'No'}"
                ), session_cookie, data.get("temp_token")
            else:
                return self.log_result(
                    "Admin user verification",
                    False,
                    f"Login failed: {response.text}"
                ), None, None
                
        except Exception as e:
            return self.log_result(
                "Admin user verification",
                False,
                f"Error: {str(e)}"
            ), None, None

    def test_step_2_admin_status_cookie(self, session_cookie):
        """Step 2: Test admin-status endpoint with session cookie"""
        print("\n📋 Step 2: Test /api/auth/admin-status with session cookie")
        
        if not session_cookie:
            return self.log_result(
                "Admin status via cookie",
                False,
                "No session cookie available"
            )
        
        try:
            response = requests.get(
                f"{self.api_url}/auth/admin-status",
                cookies={"gitpusher_session": session_cookie},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                is_admin = data.get("is_admin", False)
                return self.log_result(
                    "Admin status via cookie",
                    is_admin,
                    f"Admin status confirmed: {is_admin}"
                )
            else:
                return self.log_result(
                    "Admin status via cookie",
                    False,
                    f"Status check failed: {response.text}"
                )
                
        except Exception as e:
            return self.log_result(
                "Admin status via cookie",
                False,
                f"Error: {str(e)}"
            )

    def test_step_3_setup_2fa(self, session_cookie):
        """Step 3: Setup 2FA for admin"""
        print("\n📋 Step 3: Setup 2FA for admin")
        
        if not session_cookie:
            return self.log_result(
                "2FA setup",
                False,
                "No session cookie available"
            ), None, None
        
        try:
            response = requests.post(
                f"{self.api_url}/auth/2fa/setup",
                cookies={"gitpusher_session": session_cookie},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                secret = data.get("secret")
                otpauth_url = data.get("otpauth_url")
                
                if secret and otpauth_url:
                    return self.log_result(
                        "2FA setup",
                        True,
                        f"2FA setup successful, secret: {secret[:8]}..., otpauth_url received"
                    ), secret, otpauth_url
                else:
                    return self.log_result(
                        "2FA setup",
                        False,
                        "Missing secret or otpauth_url in response"
                    ), None, None
            else:
                return self.log_result(
                    "2FA setup",
                    False,
                    f"Setup failed: {response.text}"
                ), None, None
                
        except Exception as e:
            return self.log_result(
                "2FA setup",
                False,
                f"Error: {str(e)}"
            ), None, None

    def test_step_4_verify_2fa(self, session_cookie, secret):
        """Step 4: Generate TOTP and verify 2FA"""
        print("\n📋 Step 4: Generate TOTP code and verify 2FA")
        
        if not session_cookie or not secret:
            return self.log_result(
                "2FA verification",
                False,
                "Missing session cookie or secret"
            )
        
        try:
            # Generate TOTP code
            totp = pyotp.TOTP(secret)
            code = totp.now()
            
            response = requests.post(
                f"{self.api_url}/auth/2fa/verify?code={code}",
                cookies={"gitpusher_session": session_cookie},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "ok":
                    return self.log_result(
                        "2FA verification",
                        True,
                        f"2FA verification successful with code: {code}"
                    )
                else:
                    return self.log_result(
                        "2FA verification",
                        False,
                        f"Unexpected response: {data}"
                    )
            else:
                return self.log_result(
                    "2FA verification",
                    False,
                    f"Verification failed: {response.text}"
                )
                
        except Exception as e:
            return self.log_result(
                "2FA verification",
                False,
                f"Error: {str(e)}"
            )

    async def test_step_5_check_db_2fa_enabled(self):
        """Step 5: Verify in MongoDB that user has two_fa_enabled=true"""
        print("\n📋 Step 5: Verify in MongoDB that admin has two_fa_enabled=true")
        
        status = await self.check_admin_2fa_status()
        if status:
            two_fa_enabled = status.get("two_fa_enabled", False)
            return self.log_result(
                "Database 2FA status",
                two_fa_enabled,
                f"MongoDB shows two_fa_enabled: {two_fa_enabled}"
            )
        else:
            return self.log_result(
                "Database 2FA status",
                False,
                "Failed to check database status"
            )

    def test_step_6_2fa_login_flow(self, secret):
        """Step 6: Test complete 2FA login flow"""
        print("\n📋 Step 6: Test 2FA login flow")
        
        # Step 6a: Login admin (should require 2FA now)
        try:
            response = requests.post(
                f"{self.api_url}/auth/login-admin",
                json={
                    "email": self.admin_email,
                    "password": self.admin_password
                },
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                requires_2fa = data.get("requires_2fa", False)
                temp_token = data.get("temp_token")
                
                if requires_2fa and temp_token:
                    self.log_result(
                        "2FA login step 1",
                        True,
                        f"Login requires 2FA as expected, temp_token received"
                    )
                else:
                    return self.log_result(
                        "2FA login step 1",
                        False,
                        f"Expected requires_2fa=true and temp_token, got: {data}"
                    )
            else:
                return self.log_result(
                    "2FA login step 1",
                    False,
                    f"Login failed: {response.text}"
                )
                
        except Exception as e:
            return self.log_result(
                "2FA login step 1",
                False,
                f"Error: {str(e)}"
            )
        
        # Step 6b: Complete 2FA login with TOTP
        if secret and temp_token:
            try:
                totp = pyotp.TOTP(secret)
                code = totp.now()
                
                response = requests.post(
                    f"{self.api_url}/auth/login-2fa?code={code}&temp_token={temp_token}",
                    timeout=10
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("status") == "ok":
                        # Check for new session cookie
                        new_session_cookie = None
                        if "Set-Cookie" in response.headers:
                            cookies = response.headers["Set-Cookie"]
                            if "gitpusher_session" in cookies:
                                import re
                                match = re.search(r'gitpusher_session=([^;]+)', cookies)
                                if match:
                                    new_session_cookie = match.group(1)
                        
                        success = new_session_cookie is not None
                        return self.log_result(
                            "2FA login completion",
                            success,
                            f"2FA login completed, new session cookie: {'Yes' if new_session_cookie else 'No'}"
                        ), new_session_cookie
                    else:
                        return self.log_result(
                            "2FA login completion",
                            False,
                            f"Unexpected response: {data}"
                        ), None
                else:
                    return self.log_result(
                        "2FA login completion",
                        False,
                        f"2FA login failed: {response.text}"
                    ), None
                    
            except Exception as e:
                return self.log_result(
                    "2FA login completion",
                    False,
                    f"Error: {str(e)}"
                ), None
        else:
            return self.log_result(
                "2FA login completion",
                False,
                "Missing secret or temp_token"
            ), None

    def test_step_7_admin_status_after_2fa(self, session_cookie):
        """Step 7: Test admin-status with new session cookie"""
        print("\n📋 Step 7: Test /api/auth/admin-status after 2FA login")
        
        if not session_cookie:
            return self.log_result(
                "Admin status after 2FA",
                False,
                "No session cookie from 2FA login"
            )
        
        try:
            response = requests.get(
                f"{self.api_url}/auth/admin-status",
                cookies={"gitpusher_session": session_cookie},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                is_admin = data.get("is_admin", False)
                return self.log_result(
                    "Admin status after 2FA",
                    is_admin,
                    f"Admin status confirmed after 2FA: {is_admin}"
                )
            else:
                return self.log_result(
                    "Admin status after 2FA",
                    False,
                    f"Status check failed: {response.text}"
                )
                
        except Exception as e:
            return self.log_result(
                "Admin status after 2FA",
                False,
                f"Error: {str(e)}"
            )

    def test_step_8_protected_endpoints(self, session_cookie):
        """Step 8: Test protected admin endpoints"""
        print("\n📋 Step 8: Test protected admin endpoints")
        
        endpoints = ["/admin/users", "/admin/jobs", "/admin/transactions"]
        
        # Test without authentication
        for endpoint in endpoints:
            try:
                response = requests.get(f"{self.api_url}{endpoint}", timeout=10)
                success = response.status_code in [401, 403]
                self.log_result(
                    f"Protected endpoint {endpoint} (no auth)",
                    success,
                    f"Properly protected, returned {response.status_code}"
                )
            except Exception as e:
                self.log_result(
                    f"Protected endpoint {endpoint} (no auth)",
                    False,
                    f"Error: {str(e)}"
                )
        
        # Test with session cookie
        if session_cookie:
            for endpoint in endpoints:
                try:
                    response = requests.get(
                        f"{self.api_url}{endpoint}",
                        cookies={"gitpusher_session": session_cookie},
                        timeout=10
                    )
                    success = response.status_code == 200
                    details = ""
                    if success:
                        try:
                            data = response.json()
                            if isinstance(data, list):
                                details = f"Accessible, returned {len(data)} items"
                            else:
                                details = "Accessible, returned data"
                        except:
                            details = "Accessible"
                    else:
                        details = f"Not accessible: {response.status_code}"
                    
                    self.log_result(
                        f"Protected endpoint {endpoint} (with auth)",
                        success,
                        details
                    )
                except Exception as e:
                    self.log_result(
                        f"Protected endpoint {endpoint} (with auth)",
                        False,
                        f"Error: {str(e)}"
                    )
        else:
            self.log_result(
                "Protected endpoints (with auth)",
                False,
                "No session cookie available"
            )

    async def run_complete_test(self):
        """Run the complete 2FA test as requested"""
        print("🔐 Testing Admin 2FA Endpoints - Complete Flow")
        print("=" * 60)
        
        # Reset 2FA for clean test
        await self.reset_admin_2fa()
        
        # Step 1: Verify admin exists
        success1, session_cookie, temp_token = self.test_step_1_admin_exists()
        if not success1:
            return False
        
        # Step 2: Test admin-status with cookie
        success2 = self.test_step_2_admin_status_cookie(session_cookie)
        
        # Step 3: Setup 2FA
        success3, secret, otpauth_url = self.test_step_3_setup_2fa(session_cookie)
        if not success3:
            return False
        
        # Step 4: Verify 2FA
        success4 = self.test_step_4_verify_2fa(session_cookie, secret)
        if not success4:
            return False
        
        # Step 5: Check database
        success5 = await self.test_step_5_check_db_2fa_enabled()
        
        # Step 6: Test 2FA login flow
        success6, new_session_cookie = self.test_step_6_2fa_login_flow(secret)
        
        # Step 7: Test admin-status after 2FA
        success7 = self.test_step_7_admin_status_after_2fa(new_session_cookie)
        
        # Step 8: Test protected endpoints
        self.test_step_8_protected_endpoints(new_session_cookie)
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 Test Summary:")
        passed = sum(1 for r in self.results if r["success"])
        total = len(self.results)
        print(f"Passed: {passed}/{total} tests")
        
        if passed == total:
            print("🎉 All 2FA tests passed!")
            return True
        else:
            print("⚠️ Some tests failed")
            return False

async def main():
    tester = Admin2FATest()
    success = await tester.run_complete_test()
    return 0 if success else 1

if __name__ == "__main__":
    import sys
    sys.exit(asyncio.run(main()))