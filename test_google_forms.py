#!/usr/bin/env python3
"""
Google Forms API Test Script
This script tests the Google Forms API connection independently of the main application.
"""

import json
import sys

def test_google_forms_setup():
    """Test Google Forms API setup step by step"""
    print("🧪 Testing Google Forms API Setup")
    print("=" * 40)
    
    # Test 1: Check if required packages are installed
    print("\n1️⃣ Checking required packages...")
    try:
        from google.oauth2 import service_account
        from googleapiclient.discovery import build
        from googleapiclient.errors import HttpError
        print("✅ All required packages are installed")
    except ImportError as e:
        print(f"❌ Missing packages: {e}")
        print("💡 Install with: pip install google-api-python-client google-auth google-auth-oauthlib google-auth-httplib2")
        return False
    
    # Test 2: Check service account credentials
    print("\n2️⃣ Checking service account credentials...")
    try:
        # Service account info (same as in privateGPT.py)
        service_account_info = {
            "type": "service_account",
            "project_id": "fast-gadget-434518-q4",
            "private_key_id": "af35585b178c019f4d2cb5df4e2a33a81984507f",
            "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDboVL4B5dHFK0h\nfgHvW7T7AEVjMK7DBRMpymPjWCuYGosgQoWNPruQHD0R77o1IQCmEEALdMzhQrD/\nLr0imsuggUYpaChPotp+dUpADySoawS/oksg3bvw72WHEQiyfpZYbF7hJZPND1b/\nI1yR3Y33OvR1aTYu7lpQHdg2Y4SVyD2f01iK4WNoB6R9YiKcjXT2bt/w7MPaktGj\nKCrTxsFWd4oN8nSIVeq050QGqSkJ3B9XMn/Tzw+dLz/SQR7s7quqMZFlHcqtSZBc\nMF+Ak61gINzdudp422tPG5pikyBJqVtD34NpaQ1xU6yL0McEfrf5NOdTYvFmIkIh\nMIca9ZVvAgMBAAECggEAA1R72eTg506p8q24FnVRK35tOZFzD46Tzs4RxlBU64vO\nJja7/aXrhBuEKtxz+frpHpt1IndVOpPJ8+SKhkF16utq2+qHX0W8gwRWPt276Y3N\n1vX9UPSWX+h7+pid2s75NUKstu8x7CmvtlNGmQjp7nYHX4GxNPRKNu1s6iOHeW82\nRWWe3CPEe+4qggwfxUD0FBaDBRDJweFrQy9uPDkLScAtAzbuNFb6XO8uLuzM8YgS\ncN5gJaupc1s8g+MiSA11CaGp+VBCiaQ1GvbEU0o+VLkgPrv9oFEcj5L1LCBsdX1X\naHqoHo2aUDzVIkGVKFRvGNF5Ho98JTQvAouiHWEekQKBgQD37OHTAmTkMUBxfr0d\nz1i/5pamSzhO2r2HmeuTpr/zQVfCEeZVEIhaJG37xk654u4wrKwpmmTq2qyGxYwL\n7Epqi/BZpJubUWfwslE4qlh7d06FvYdDzg0B8T1v6EYwgWQn3VILBYDUbp1rRX0e\nNj8tuvtdk9uewnnG8bq81MkF6QKBgQDiyIbLwbDOpHKVROatBgq2rtKzh7KHCHYZ\ntAooe8o3P8V/1T7aslMCM9gPdZnubCR4r6OH73AJtCn1ebCmqc0d0xpqxNP6e+Sx\n00wkKPTJk8V3iZgWoYNi68ZxefmoGN/kWplWwhmi8DXx0L+AH1XuDaSknntgM8Lg\nVSqQN8WxlwKBgQDVMKJDk6R0QRHcRpKS5rC3W66h0r7Zt+kQiL/1WIdowwCWxlOd\nRDkr4nWc8jrSR5xwyJrGr5gmB+Ihhg/WVNrs4ebM/uo71fWeGYgURQ8PJFmmUYLW\nQIIY8HvXFhH9NdaNHRiml5XfljrRepCLgTQ0u7vZDQLmcu7KryTXqdYuuQKBgQDg\n2VTcnLQCjgWVffUAQ+dHbVo26inVvEvr/Be+P84krTPSJMnm57tpiaGE4mK2g749\nclc/JeT9mgWn/vlopR5ZohqlFXXe+gurTAZIK9tYKQ02EdQbTBQKdh4Q0JD5W4BQ\n1osF+/iTFntFwGS+UVNPbXN6TC+jGG71ITvMNZ/rDQKBgQCSfrLIPH8nE02e+VAa\nZNuQdmbR/6z7MX7qViPpQ7chmfLdL4SqzzzHgp8s6JBZoSy/i9/gpD5Wx42382it\nj49MHGWBRQYZKLeQUAIxQlXiKDtJiKGeDnKKNvDubvUK/pRCf1xi4poghraKQ3HX\nVrRZ58kpq4C3Q1M52Rvt8N0jtw==\n-----END PRIVATE KEY-----\n",
            "client_email": "agnate@fast-gadget-434518-q4.iam.gserviceaccount.com",
            "client_id": "102675804576189978994",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/agnate%40fast-gadget-434518-q4.iam.gserviceaccount.com",
            "universe_domain": "googleapis.com"
        }
        
        print("✅ Service account info loaded")
        print(f"   Project ID: {service_account_info['project_id']}")
        print(f"   Client Email: {service_account_info['client_email']}")
        
    except Exception as e:
        print(f"❌ Error loading service account info: {e}")
        return False
    
    # Test 3: Create credentials
    print("\n3️⃣ Creating service account credentials...")
    try:
        scopes = [
            'https://www.googleapis.com/auth/forms',
            'https://www.googleapis.com/auth/drive',
            'https://www.googleapis.com/auth/forms.body'
        ]
        
        credentials = service_account.Credentials.from_service_account_info(
            service_account_info, 
            scopes=scopes
        )
        print("✅ Service account credentials created successfully")
        
    except Exception as e:
        print(f"❌ Error creating credentials: {e}")
        return False
    
    # Test 4: Build Google Forms service
    print("\n4️⃣ Building Google Forms service...")
    try:
        service = build('forms', 'v1', credentials=credentials)
        print("✅ Google Forms service built successfully")
        
        # Check if forms method is available
        if hasattr(service, 'forms'):
            print("✅ Service has 'forms' method")
        else:
            print("❌ Service missing 'forms' method")
            return False
            
    except Exception as e:
        print(f"❌ Error building service: {e}")
        return False
    
    # Test 5: Test form creation
    print("\n5️⃣ Testing form creation...")
    try:
        test_form_body = {
            'info': {
                'title': 'Test Connection Form',
                'documentTitle': 'Test Connection Form'
            }
        }
        
        test_form = service.forms().create(body=test_form_body).execute()
        form_id = test_form['formId']
        print(f"✅ Test form created successfully with ID: {form_id}")
        
        # Clean up: Delete the test form
        service.forms().delete(formId=form_id).execute()
        print("✅ Test form deleted successfully")
        
    except Exception as e:
        print(f"❌ Error creating test form: {e}")
        return False
    
    print("\n🎉 All tests passed! Google Forms API is working correctly.")
    print("\n📋 Next steps:")
    print("1. Run the main application: streamlit run privateGPT.py")
    print("2. Navigate to 'Google Forms Generator'")
    print("3. Test the connection using the app's test button")
    
    return True

if __name__ == "__main__":
    try:
        success = test_google_forms_setup()
        if not success:
            print("\n❌ Setup failed. Please check the errors above.")
            sys.exit(1)
    except KeyboardInterrupt:
        print("\n\n⏹️ Test interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1) 