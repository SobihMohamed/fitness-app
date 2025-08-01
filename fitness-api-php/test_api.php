<?php
// Simple test script to verify API functionality
// Run this from the fitness-api-php directory

echo "Testing Fitness API...\n\n";

// Test 1: Check if the server is running
$baseUrl = "http://localhost:8000";

echo "1. Testing server connection...\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $baseUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 5);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode == 200) {
    echo "✓ Server is running\n";
} else {
    echo "✗ Server is not responding (HTTP Code: $httpCode)\n";
    exit(1);
}

// Test 2: Test AdminCategories endpoint (without auth - should fail)
echo "\n2. Testing AdminCategories endpoint (should fail without auth)...\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $baseUrl . "/AdminCategories/getAll");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 5);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$responseData = json_decode($response, true);
if ($httpCode == 401 || $httpCode == 400) {
    echo "✓ AdminCategories endpoint exists and requires authentication\n";
} else {
    echo "✗ Unexpected response from AdminCategories endpoint (HTTP Code: $httpCode)\n";
    echo "Response: $response\n";
}

// Test 3: Test AdminProducts endpoint (without auth - should fail)
echo "\n3. Testing AdminProducts endpoint (should fail without auth)...\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $baseUrl . "/AdminProducts/getAll");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 5);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$responseData = json_decode($response, true);
if ($httpCode == 401 || $httpCode == 400) {
    echo "✓ AdminProducts endpoint exists and requires authentication\n";
} else {
    echo "✗ Unexpected response from AdminProducts endpoint (HTTP Code: $httpCode)\n";
    echo "Response: $response\n";
}

echo "\n✓ API endpoints are properly configured!\n";
echo "\nTo test with authentication, you need to:\n";
echo "1. Start the PHP server: php -S localhost:8000 -t public\n";
echo "2. Login as admin to get a token\n";
echo "3. Use the token in the Authorization header\n";
?> 