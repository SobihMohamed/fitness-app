<?php
namespace App\Controllers;
use App\models\ManageAdmins;
use App\Core\AbstractController;

class ManageAdminsController extends AbstractController{
  
  public $adminModel;
  public function __construct() {
          parent::__construct();
    $this->adminModel= new ManageAdmins();
  }

      //! Super Admin Services On Admins in dashboard
    public function getAllAdmins(){
      if (!$this->isSuperAdmin()) {
        return $this->sendError("You are not authorized", 403);
      }

      $admins = $this->adminModel
                    ->getAllAdmins();
      if($admins !== false){
        return $this->json([
          "status" => "success",
          "users" => $admins
        ]);
      }
      return $this->sendError("No Admins",400);
    }
    public function searchAdmin(){
      if (!$this->isSuperAdmin()) {
        return $this->sendError("You are not authorized", 403);
      }
      $data = json_decode(file_get_contents("php://input"),true);
      if(!isset($data["keyword"])){
        $this->sendError("keyword Require");
      }
      $result = $this->adminModel
                ->searchAdmin($data["keyword"]);
      if($result === false){
        $this->sendError("Error During Search");
      }
      return $this->json([
        "status"=>"success",
        "data" => $result,
      ]);
    }
    public function getAdminById($id){
      if (!$this->isSuperAdmin()) {
        return $this->sendError("You are not authorized", 403);
      }
      $admin = $this->adminModel
              ->getAdminById($id);
      if($admin === false){
        $this->sendError("Error During Find User");
        return;
      }
      return $this->json([
        "status" => "success",
        "user" => $admin
      ]);
    }
    public function deleteAdmin($id){
      if (!$this->isSuperAdmin()) {
        return $this->sendError("You are not authorized", 403);
      }
      $isDeleted = $this->adminModel
                        ->deleteAdmin($id);
      if(!$isDeleted) {
        $this->sendError("Error During Delete User");
        return;
      }
      $this->json([
        "status"=>"success",
        "message"=>"Delete User Successfully"
      ]);
    }
    public function updateAdmin($id){
      if (!$this->isSuperAdmin()) {
        return $this->sendError("You are not authorized", 403);
      }
      $data = json_decode(file_get_contents("php://input"),true);
      $updated = $this->adminModel
                      ->updateAdmin($id,$data);
      if(!$updated){
        $this->sendError("Error During Update User");
        return;
      }
      $this->json([
        "status" => "success",
        "message" => "User Updated Successfully"
      ]);
    }
    public function addAdmin() {
      if (!$this->isSuperAdmin()) {
        return $this->sendError("You are not authorized", 403);
      }
      $data = json_decode(file_get_contents("php://input"), true);
      $added = $this->adminModel->addAdmin($data);
      if ($added) {
        return $this->json([
          "status" => "success",
          "message" => "User added successfully"
        ]);
      }
      return $this->sendError("Admin already exists or error occurred");
    }
}
?>