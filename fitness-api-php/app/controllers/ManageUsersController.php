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
      //! Admin Services in dashboard
    public function getAllUsers(){
      if (!$this->isSuperAdmin()) {
        return $this->sendError("You are not authorized", 403);
      }

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
      if (!$this->isSuperAdmin()) {
        return $this->sendError("You are not authorized", 403);
      }
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
      if (!$this->isSuperAdmin()) {
        return $this->sendError("You are not authorized", 403);
      }
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
      if (!$this->isSuperAdmin()) {
        return $this->sendError("You are not authorized", 403);
      }
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
      if (!$this->isSuperAdmin()) {
        return $this->sendError("You are not authorized", 403);
      }
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
      if (!$this->isSuperAdmin()) {
        return $this->sendError("You are not authorized", 403);
      }
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
      if (!$this->isSuperAdmin()) {
        return $this->sendError("You are not authorized", 403);
      }
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