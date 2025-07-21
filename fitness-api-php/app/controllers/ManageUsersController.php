<?php
namespace App\Controllers;
use App\models\Admin;
use App\Core\AbstractController;
use App\models\ManageUsers;

class ManageUsersController extends AbstractController{
  protected $userModel;

  public function __construct(){
      parent::__construct();
      $this->userModel = new ManageUsers();
  }

    private function requireSuperAdmin(){
      $currentUser = $this->getUserFromToken();
      $adminModel = new Admin();
      $admin = $adminModel->getAdminById($currentUser["id"]);
      // var_dump($admin);
      if( !(isset($admin['is_super_admin']) && $admin['is_super_admin'] == 1)){
        $this->sendError("Not Authorized");
        exit;
      }
    }
      //! Admin Services On Users in dashboard
    public function getAllUsers(){
      $this->requireSuperAdmin();
      $users = $this->userModel
                    ->getAllUsers();
      if($users !== false){
        return $this->json([
          "status" => "success",
          "users" => $users
        ]);
      }
      return $this->sendError("No Users",400);
    }
    public function searchUser(){
      $this->requireSuperAdmin();
      $data = json_decode(file_get_contents("php://input"),true);
      if(!isset($data["keyword"])){
        $this->sendError("keyword Require");
        return;
      }
      $result = $this->userModel
                ->searchUser($data["keyword"]);
      if($result === false || empty($result)){
        $this->sendError("Not Found Email");
        return;
      }
      return $this->json([
        "status"=>"success",
        "data" => $result,
      ]);
    }
    public function getUserById($id){
      $this->requireSuperAdmin();

      $user = $this->userModel
              ->getUserById($id);
      if($user === false){
        $this->sendError("Error During Find User");
        return;
      }
      return $this->json([
        "status" => "success",
        "user" => $user
      ]);
    }
    public function deleteUser($id){
      $this->requireSuperAdmin();
      $isDeleted = $this->userModel
                        ->deleteUser($id);
      if(!$isDeleted) {
        $this->sendError("Error During Delete User");
        return;
      }
      $this->json([
        "status"=>"success",
        "message"=>"Delete User Successfully"
      ]);
    }
    public function updateUser($id){
      $this->requireSuperAdmin();
      $data = json_decode(file_get_contents("php://input"),true);
      $updated = $this->userModel
                      ->updateUser($id,$data);
      if(!$updated){
        $this->sendError("Error During Update User");
        return;
      }
      $this->json([
        "status" => "success",
        "message" => "User Updated Successfully"
      ]);
    }
    public function addUser() {
      $this->requireSuperAdmin();
      $data = json_decode(file_get_contents("php://input"), true);
      if(empty($data)){
        $this->sendError("All Fields Are Required");
      }
      $added = $this->userModel->addUser($data);
      if ($added) {
        return $this->json([
          "status" => "success",
          "message" => "User added successfully"
        ]);
      }
      return $this->sendError("User already exists or error occurred");
    }
    public function filterByType() {
      $this->requireSuperAdmin();
      $data = json_decode(file_get_contents("php://input"), true);
      if(empty($data)){
        $this->sendError("All Fields Are Required");
      }
      $users = $this->userModel->getUsersByType($data['user_type']);
      if ($users) {
        return $this->json([
          "status" => "success",
          "users" => $users
        ]);
      }
      return $this->sendError("No users of this type found");
    }
}

?>