import { apiService } from "./apiService";

export const testApiConnection = async () => {
  try {
    console.log("🔍 Testing API connection...");
    console.log("📍 API URL:", apiService["baseURL"]);

    // Test basic connectivity
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${apiService["baseURL"]}/health`, {
      method: "GET",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      console.log("✅ API connection successful!");
      return true;
    } else {
      console.log("ℹ️ API health endpoint not available");
      return false;
    }
  } catch (error) {
    console.log("❌ API connection failed:", error);
    return false;
  }
};

export const testAuthEndpoints = async () => {
  try {
    console.log("🔍 Testing auth endpoints...");

    // Test login endpoint (this will fail but we can see if the endpoint exists)
    const response = await fetch(`${apiService["baseURL"]}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "test@example.com",
        password: "testpassword",
      }),
    });

    console.log("📊 Auth endpoint response status:", response.status);
    console.log("📊 Auth endpoint response headers:", response.headers);

    return response.status !== 404; // If not 404, endpoint exists
  } catch (error) {
    console.log("❌ Auth endpoint test failed:", error);
    return false;
  }
};

export const testSignupEndpoint = async () => {
  try {
    console.log("🔍 Testing signup endpoint...");

    const testUser = {
      fullName: "Test User",
      email: `test${Date.now()}@example.com`,
      password: "testpassword123",
    };

    console.log("📝 Test user data:", testUser);

    const response = await fetch(`${apiService["baseURL"]}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testUser),
    });

    console.log("📊 Signup response status:", response.status);

    if (response.ok) {
      const responseData = await response.json();
      console.log("📊 Signup response data:", responseData);
      return { success: true, data: responseData };
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.log("📊 Signup error data:", errorData);
      return { success: false, error: errorData };
    }
  } catch (error) {
    console.log("❌ Signup endpoint test failed:", error);
    return { success: false, error: error };
  }
};

export const runApiTests = async () => {
  console.log("🚀 Starting API tests...");

  const connectionTest = await testApiConnection();
  const authTest = await testAuthEndpoints();
  const signupTest = await testSignupEndpoint();

  console.log("📋 Test Results:");
  console.log("  Connection:", connectionTest ? "✅" : "❌");
  console.log("  Auth Endpoints:", authTest ? "✅" : "❌");
  console.log("  Signup Test:", signupTest.success ? "✅" : "❌");

  return {
    connection: connectionTest,
    auth: authTest,
    signup: signupTest,
  };
};
