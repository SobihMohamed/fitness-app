<?php
namespace App\Controllers;
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
      if( !(isset($currentUser['is_super_admin']) && $currentUser['is_super_admin'] == 1)){
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
      }
      $result = $this->userModel
                ->searchUser($data["keyword"]);
      if($result === false){
        $this->sendError("Error During Search");
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
      $added = $this->userModel->addUser($data);
      if ($added) {
        return $this->json([
          "status" => "success",
          "message" => "User added successfully"
        ]);
      }
      return $this->sendError("User already exists or error occurred");
    }
    public function getUsersByType($type) {
      $this->requireSuperAdmin();
      $users = $this->userModel->getUsersByType($type);
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