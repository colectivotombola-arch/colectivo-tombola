import requests
import sys
import json
from datetime import datetime

class ProyectosFloresAPITester:
    def __init__(self, base_url="http://localhost:8001"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.active_activity = None

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response preview: {str(response_data)[:200]}...")
                    return True, response_data
                except:
                    return True, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root endpoint"""
        return self.run_test("Root Endpoint", "GET", "", 200)

    def test_get_active_activity(self):
        """Test getting active activity"""
        success, response = self.run_test("Get Active Activity", "GET", "api/activities/active", 200)
        if success and response:
            self.active_activity = response
            # Verify required fields
            required_fields = ['_id', 'number', 'title', 'images', 'sold_numbers', 'total_numbers', 'progress']
            missing_fields = [field for field in required_fields if field not in response]
            if missing_fields:
                print(f"⚠️  Warning: Missing fields in response: {missing_fields}")
            else:
                print(f"✅ All required fields present")
                print(f"   Activity: #{response.get('number')} - {response.get('title')}")
                print(f"   Progress: {response.get('progress')}% ({response.get('sold_numbers')}/{response.get('total_numbers')})")
        return success

    def test_get_packages(self):
        """Test getting number packages"""
        success, response = self.run_test("Get Packages", "GET", "api/packages", 200)
        if success and isinstance(response, list):
            print(f"✅ Found {len(response)} packages")
            for pkg in response:
                print(f"   Package: {pkg.get('quantity')} numbers for ${pkg.get('price')}")
        return success

    def test_purchase_numbers(self):
        """Test purchasing numbers"""
        if not self.active_activity:
            print("❌ Cannot test purchase - no active activity found")
            return False
            
        purchase_data = {
            "activity_id": self.active_activity.get('_id'),
            "quantity": 10,
            "email": f"test_{datetime.now().strftime('%H%M%S')}@test.com",
            "name": "Test User",
            "phone": "0999999999"
        }
        
        success, response = self.run_test("Purchase Numbers", "POST", "api/purchase", 200, purchase_data)
        if success and response:
            if response.get('success'):
                print(f"✅ Purchase successful")
                print(f"   Numbers assigned: {len(response.get('numbers', []))}")
                print(f"   Total paid: ${response.get('total_paid')}")
                if response.get('instant_wins'):
                    print(f"   🎉 Instant wins: {response.get('instant_wins')}")
                return True
            else:
                print(f"❌ Purchase failed: {response.get('message')}")
        return False

    def test_query_numbers(self):
        """Test querying numbers by email"""
        # First make a purchase to have data to query
        if not self.active_activity:
            print("❌ Cannot test query - no active activity found")
            return False
            
        test_email = f"query_test_{datetime.now().strftime('%H%M%S')}@test.com"
        
        # Make a purchase first
        purchase_data = {
            "activity_id": self.active_activity.get('_id'),
            "quantity": 5,
            "email": test_email,
            "name": "Query Test User",
            "phone": "0888888888"
        }
        
        purchase_success, _ = self.run_test("Purchase for Query Test", "POST", "api/purchase", 200, purchase_data)
        
        if purchase_success:
            # Now query the numbers
            query_data = {"email": test_email}
            success, response = self.run_test("Query Numbers", "POST", "api/query-numbers", 200, query_data)
            
            if success and response.get('success'):
                data = response.get('data', [])
                print(f"✅ Query successful - Found {len(data)} records")
                for record in data:
                    print(f"   Activity: {record.get('activity_title')}")
                    print(f"   Numbers: {len(record.get('numbers', []))} numbers")
                return True
        
        return False

    def test_get_past_activities(self):
        """Test getting past activities"""
        success, response = self.run_test("Get Past Activities", "GET", "api/past-activities", 200)
        if success and isinstance(response, list):
            print(f"✅ Found {len(response)} past activities")
            for activity in response[:3]:  # Show first 3
                print(f"   Activity #{activity.get('number')}: {activity.get('title')}")
                if activity.get('winner'):
                    print(f"     Winner: {activity.get('winner')}")
        return success

    def test_get_instant_prizes(self):
        """Test getting instant prizes for an activity"""
        if not self.active_activity:
            print("❌ Cannot test instant prizes - no active activity found")
            return False
            
        activity_id = self.active_activity.get('_id')
        success, response = self.run_test("Get Instant Prizes", "GET", f"api/instant-prizes/{activity_id}", 200)
        
        if success and isinstance(response, list):
            print(f"✅ Found {len(response)} instant prizes")
            claimed_count = sum(1 for prize in response if prize.get('claimed'))
            print(f"   Claimed: {claimed_count}, Available: {len(response) - claimed_count}")
        return success

    def test_invalid_endpoints(self):
        """Test invalid endpoints return proper errors"""
        print("\n🔍 Testing error handling...")
        
        # Test non-existent activity
        success, _ = self.run_test("Non-existent Activity", "GET", "api/activities/nonexistent", 404)
        
        # Test invalid purchase data
        invalid_purchase = {"activity_id": "invalid", "quantity": 0}
        success2, _ = self.run_test("Invalid Purchase", "POST", "api/purchase", 422)
        
        return success and success2

def main():
    print("🚀 Starting Proyectos Flores API Tests")
    print("=" * 50)
    
    tester = ProyectosFloresAPITester("http://localhost:8001")
    
    # Run all tests
    tests = [
        tester.test_root_endpoint,
        tester.test_get_active_activity,
        tester.test_get_packages,
        tester.test_purchase_numbers,
        tester.test_query_numbers,
        tester.test_get_past_activities,
        tester.test_get_instant_prizes,
        tester.test_invalid_endpoints
    ]
    
    for test in tests:
        try:
            test()
        except Exception as e:
            print(f"❌ Test failed with exception: {str(e)}")
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 FINAL RESULTS")
    print(f"Tests passed: {tester.tests_passed}/{tester.tests_run}")
    print(f"Success rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())