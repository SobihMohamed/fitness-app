<?php
// Test script to create a super admin account
require_once 'vendor/autoload.php';
require_once 'app/Database/Connection.php';

use App\Database\Connection;

try {
    $conn = Connection::getInstance();
    
    // Check if admin already exists
    $checkQuery = "SELECT * FROM admins WHERE email = 'admin@fitness.com'";
    $result = mysqli_query($conn, $checkQuery);
    
    if (mysqli_num_rows($result) > 0) {
        echo "Admin account already exists!\n";
        echo "Email: admin@fitness.com\n";
        echo "Password: password\n";
    } else {
        // Create super admin account
        $hashedPassword = password_hash('password', PASSWORD_DEFAULT);
        $insertQuery = "INSERT INTO admins (name, email, password, is_super_admin, is_active) 
                       VALUES ('Super Admin', 'admin@fitness.com', '$hashedPassword', 1, 1)";
        
        if (mysqli_query($conn, $insertQuery)) {
            echo "Super admin account created successfully!\n";
            echo "Email: admin@fitness.com\n";
            echo "Password: password\n";
        } else {
            echo "Error creating admin account: " . mysqli_error($conn) . "\n";
        }
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?> 