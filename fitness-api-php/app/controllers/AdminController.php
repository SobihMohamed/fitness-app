<?php
namespace App\Controllers;
use App\Core\AbstractController;
use App\Core\JWTHandler;
use App\models\Admin;

class AdminController extends AbstractController{
    protected $adminModel;
    public function __construct(){
      $this->adminModel = new Admin();
    }
    // Admins
    public function login(){
      $data = json_decode(file_get_contents("php://input"), true);
      // var_dump($data);
      // echo password_hash("111111", PASSWORD_DEFAULT);

      if (empty($data['email']) || empty($data['password'])) {
          return $this->sendError("All Fields are required", 422);
      }
      $admin = $this->adminModel
                    ->getAdminByEmail($data['email']);
      if(empty($admin) || !$admin || !password_verify($data['password'],$admin['password'])){
        return $this->sendError("Wrong Email Or Password", 422);
      }
      // var_dump($admin);

      // Create JWT token
      $jwt = new JWTHandler();
      $token = $jwt->generateToken([
          "id" => $admin['admin_id'],
          "email" => $admin['email']
      ]);

      $this->json([
          "message" => "Admin Login Successfully",
          "token" => $token,
          "status" => "success"
      ]);
    }
}
?>