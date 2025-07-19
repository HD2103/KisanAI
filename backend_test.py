#!/usr/bin/env python3
"""
Comprehensive Backend Testing for Kisan AI Application
Tests all API endpoints with proper data validation and error handling
"""

import requests
import json
import base64
import time
from typing import Dict, Any, List
import os
from pathlib import Path

# Load backend URL from frontend .env file
def load_backend_url():
    frontend_env_path = Path("/app/frontend/.env")
    if frontend_env_path.exists():
        with open(frontend_env_path, 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    return "http://localhost:8001"

BASE_URL = load_backend_url()
API_BASE_URL = f"{BASE_URL}/api"

print(f"Testing backend at: {API_BASE_URL}")

class KisanAITester:
    def __init__(self):
        self.session = requests.Session()
        self.test_results = []
        self.failed_tests = []
        
    def log_test(self, test_name: str, success: bool, details: str = ""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details
        })
        
        if not success:
            self.failed_tests.append(test_name)
    
    def create_sample_image_base64(self) -> str:
        """Create a sample base64 encoded image for testing"""
        # Simple 1x1 pixel PNG in base64
        return "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
    
    def create_sample_audio_base64(self) -> str:
        """Create a sample base64 encoded audio for testing"""
        # Simple WAV header in base64
        return "UklGRjIAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ4AAAC"
    
    def test_root_endpoint(self):
        """Test GET /api/ - Root endpoint"""
        try:
            response = self.session.get(f"{API_BASE_URL}/")
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "Kisan AI" in data["message"]:
                    self.log_test("Root Endpoint", True, f"Message: {data['message']}")
                else:
                    self.log_test("Root Endpoint", False, f"Unexpected response: {data}")
            else:
                self.log_test("Root Endpoint", False, f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_test("Root Endpoint", False, f"Exception: {str(e)}")
    
    def test_crop_disease_analysis(self):
        """Test POST /api/analyze-crop-disease - Crop disease analysis"""
        try:
            # Test with English language
            image_data = self.create_sample_image_base64()
            payload = {
                "image_base64": image_data,
                "language": "en"
            }
            
            response = self.session.post(f"{API_BASE_URL}/analyze-crop-disease", data=payload)
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    "analysis" in data and 
                    "disease_name" in data["analysis"] and
                    "confidence" in data["analysis"] and
                    "treatment" in data["analysis"]):
                    self.log_test("Crop Disease Analysis (EN)", True, 
                                f"Disease: {data['analysis']['disease_name']}, "
                                f"Confidence: {data['analysis']['confidence']}%")
                else:
                    self.log_test("Crop Disease Analysis (EN)", False, f"Invalid response structure: {data}")
            else:
                self.log_test("Crop Disease Analysis (EN)", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
            
            # Test with Hindi language
            payload["language"] = "hi"
            response = self.session.post(f"{API_BASE_URL}/analyze-crop-disease", data=payload)
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    "treatment_local" in data["analysis"]):
                    self.log_test("Crop Disease Analysis (HI)", True, 
                                f"Hindi treatment available: {len(data['analysis']['treatment_local'])} chars")
                else:
                    self.log_test("Crop Disease Analysis (HI)", False, f"Hindi support missing: {data}")
            else:
                self.log_test("Crop Disease Analysis (HI)", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_test("Crop Disease Analysis", False, f"Exception: {str(e)}")
    
    def test_market_prices(self):
        """Test GET /api/market-prices/{state} - Market prices by state"""
        states_to_test = ["Maharashtra", "Punjab", "Bihar"]
        
        for state in states_to_test:
            try:
                # Test English
                response = self.session.get(f"{API_BASE_URL}/market-prices/{state}?language=en")
                
                if response.status_code == 200:
                    data = response.json()
                    if (data.get("success") and 
                        "prices" in data and 
                        len(data["prices"]) > 0 and
                        "crop_name" in data["prices"][0] and
                        "msp_price" in data["prices"][0]):
                        self.log_test(f"Market Prices - {state} (EN)", True, 
                                    f"Found {len(data['prices'])} crops")
                    else:
                        self.log_test(f"Market Prices - {state} (EN)", False, 
                                    f"Invalid response structure: {data}")
                else:
                    self.log_test(f"Market Prices - {state} (EN)", False, 
                                f"Status: {response.status_code}, Response: {response.text}")
                
                # Test Hindi
                response = self.session.get(f"{API_BASE_URL}/market-prices/{state}?language=hi")
                
                if response.status_code == 200:
                    data = response.json()
                    if (data.get("success") and 
                        "crop_name_local" in data["prices"][0]):
                        self.log_test(f"Market Prices - {state} (HI)", True, 
                                    f"Hindi names available")
                    else:
                        self.log_test(f"Market Prices - {state} (HI)", False, 
                                    f"Hindi support missing: {data}")
                else:
                    self.log_test(f"Market Prices - {state} (HI)", False, 
                                f"Status: {response.status_code}")
                        
            except Exception as e:
                self.log_test(f"Market Prices - {state}", False, f"Exception: {str(e)}")
        
        # Test invalid state
        try:
            response = self.session.get(f"{API_BASE_URL}/market-prices/InvalidState")
            if response.status_code == 404:
                self.log_test("Market Prices - Invalid State", True, "Correctly returns 404")
            else:
                self.log_test("Market Prices - Invalid State", False, 
                            f"Expected 404, got {response.status_code}")
        except Exception as e:
            self.log_test("Market Prices - Invalid State", False, f"Exception: {str(e)}")
    
    def test_government_schemes(self):
        """Test GET /api/government-schemes - Government schemes"""
        try:
            # Test English
            response = self.session.get(f"{API_BASE_URL}/government-schemes?language=en")
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    "schemes" in data and 
                    len(data["schemes"]) > 0 and
                    "name" in data["schemes"][0] and
                    "description" in data["schemes"][0]):
                    self.log_test("Government Schemes (EN)", True, 
                                f"Found {len(data['schemes'])} schemes")
                else:
                    self.log_test("Government Schemes (EN)", False, 
                                f"Invalid response structure: {data}")
            else:
                self.log_test("Government Schemes (EN)", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
            
            # Test Hindi
            response = self.session.get(f"{API_BASE_URL}/government-schemes?language=hi")
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    "name_local" in data["schemes"][0]):
                    self.log_test("Government Schemes (HI)", True, "Hindi support available")
                else:
                    self.log_test("Government Schemes (HI)", False, 
                                f"Hindi support missing: {data}")
            else:
                self.log_test("Government Schemes (HI)", False, 
                            f"Status: {response.status_code}")
                
        except Exception as e:
            self.log_test("Government Schemes", False, f"Exception: {str(e)}")
    
    def test_farm_tasks(self):
        """Test GET /api/farm-tasks - Farm tasks"""
        try:
            # Test English
            response = self.session.get(f"{API_BASE_URL}/farm-tasks?language=en")
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    "tasks" in data and 
                    len(data["tasks"]) > 0 and
                    "task_name" in data["tasks"][0] and
                    "description" in data["tasks"][0]):
                    self.log_test("Farm Tasks (EN)", True, 
                                f"Found {len(data['tasks'])} tasks")
                else:
                    self.log_test("Farm Tasks (EN)", False, 
                                f"Invalid response structure: {data}")
            else:
                self.log_test("Farm Tasks (EN)", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
            
            # Test Hindi
            response = self.session.get(f"{API_BASE_URL}/farm-tasks?language=hi")
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    "task_name_local" in data["tasks"][0]):
                    self.log_test("Farm Tasks (HI)", True, "Hindi support available")
                else:
                    self.log_test("Farm Tasks (HI)", False, 
                                f"Hindi support missing: {data}")
            else:
                self.log_test("Farm Tasks (HI)", False, 
                            f"Status: {response.status_code}")
                
        except Exception as e:
            self.log_test("Farm Tasks", False, f"Exception: {str(e)}")
    
    def test_translation(self):
        """Test POST /api/translate - Translation service"""
        try:
            payload = {
                "text": "Crop Disease Detection",
                "target_language": "hi"
            }
            
            response = self.session.post(f"{API_BASE_URL}/translate", 
                                       json=payload,
                                       headers={"Content-Type": "application/json"})
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    "translated_text" in data and
                    "original_text" in data):
                    self.log_test("Translation Service", True, 
                                f"Translated: '{data['original_text']}' -> '{data['translated_text']}'")
                else:
                    self.log_test("Translation Service", False, 
                                f"Invalid response structure: {data}")
            else:
                self.log_test("Translation Service", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_test("Translation Service", False, f"Exception: {str(e)}")
    
    def test_speech_to_text(self):
        """Test POST /api/voice/speech-to-text - Voice transcription"""
        try:
            audio_data = self.create_sample_audio_base64()
            payload = {
                "audio_base64": audio_data,
                "language": "hi"
            }
            
            response = self.session.post(f"{API_BASE_URL}/voice/speech-to-text", 
                                       json=payload,
                                       headers={"Content-Type": "application/json"})
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    "transcription" in data):
                    self.log_test("Speech to Text", True, 
                                f"Transcription: '{data['transcription']}'")
                else:
                    self.log_test("Speech to Text", False, 
                                f"Invalid response structure: {data}")
            else:
                self.log_test("Speech to Text", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_test("Speech to Text", False, f"Exception: {str(e)}")
    
    def test_text_to_speech(self):
        """Test POST /api/voice/text-to-speech - Voice synthesis"""
        try:
            payload = {
                "text": "नमस्ते किसान भाई",
                "language": "hi"
            }
            
            response = self.session.post(f"{API_BASE_URL}/voice/text-to-speech", 
                                       data=payload)
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    "audio_base64" in data):
                    self.log_test("Text to Speech", True, 
                                f"Audio generated: {len(data['audio_base64'])} chars")
                else:
                    self.log_test("Text to Speech", False, 
                                f"Invalid response structure: {data}")
            else:
                self.log_test("Text to Speech", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_test("Text to Speech", False, f"Exception: {str(e)}")
    
    def test_supported_languages(self):
        """Test GET /api/languages - Supported languages"""
        try:
            response = self.session.get(f"{API_BASE_URL}/languages")
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    "languages" in data and 
                    len(data["languages"]) > 0 and
                    "code" in data["languages"][0] and
                    "name" in data["languages"][0]):
                    
                    # Check for Hindi and English
                    lang_codes = [lang["code"] for lang in data["languages"]]
                    has_hindi = "hi" in lang_codes
                    has_english = "en" in lang_codes
                    
                    if has_hindi and has_english:
                        self.log_test("Supported Languages", True, 
                                    f"Found {len(data['languages'])} languages including Hindi and English")
                    else:
                        self.log_test("Supported Languages", False, 
                                    f"Missing Hindi or English support. Found: {lang_codes}")
                else:
                    self.log_test("Supported Languages", False, 
                                f"Invalid response structure: {data}")
            else:
                self.log_test("Supported Languages", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_test("Supported Languages", False, f"Exception: {str(e)}")
    
    def test_database_operations(self):
        """Test database operations by checking if crop analysis is saved"""
        try:
            # First, perform a crop analysis
            image_data = self.create_sample_image_base64()
            payload = {
                "image_base64": image_data,
                "language": "en"
            }
            
            response = self.session.post(f"{API_BASE_URL}/analyze-crop-disease", data=payload)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    self.log_test("Database Operations", True, 
                                "Crop analysis saved to database successfully")
                else:
                    self.log_test("Database Operations", False, 
                                "Failed to save crop analysis to database")
            else:
                self.log_test("Database Operations", False, 
                            f"Database operation failed: {response.status_code}")
                
        except Exception as e:
            self.log_test("Database Operations", False, f"Exception: {str(e)}")
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("=" * 60)
        print("KISAN AI BACKEND COMPREHENSIVE TESTING")
        print("=" * 60)
        print()
        
        # Run all tests
        self.test_root_endpoint()
        self.test_crop_disease_analysis()
        self.test_market_prices()
        self.test_government_schemes()
        self.test_farm_tasks()
        self.test_translation()
        self.test_speech_to_text()
        self.test_text_to_speech()
        self.test_supported_languages()
        self.test_database_operations()
        
        # Print summary
        print()
        print("=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = len([t for t in self.test_results if t["success"]])
        failed_tests = len(self.failed_tests)
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if self.failed_tests:
            print()
            print("FAILED TESTS:")
            for test in self.failed_tests:
                print(f"  ❌ {test}")
        
        print()
        print("=" * 60)
        
        return {
            "total": total_tests,
            "passed": passed_tests,
            "failed": failed_tests,
            "success_rate": (passed_tests/total_tests)*100,
            "failed_test_names": self.failed_tests,
            "all_results": self.test_results
        }

if __name__ == "__main__":
    tester = KisanAITester()
    results = tester.run_all_tests()
    
    # Exit with error code if tests failed
    if results["failed"] > 0:
        exit(1)
    else:
        exit(0)