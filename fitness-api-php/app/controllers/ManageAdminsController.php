<?php
namespace App\Controllers;
use App\models\Admin;
use App\Core\AbstractController;

class ManageAdminsController extends AbstractController{
  
  public $adminModel;
  public function __construct() {
    parent::__construct();
    $this->adminModel= new Admin();
  }

    private function requireSuperAdmin(){
      $currentUser = $this->getUserFromToken();
      $admin = $this->adminModel->getAdminById($currentUser["id"]);
      // var_dump($admin);
      if( !(isset($admin['is_super_admin']) && $admin['is_super_admin'] == 1)){
        $this->sendError("Not Authorizeddddd");
        exit;
      }
    }
      //! Super Admin Services On Admins in dashboard
    public function getAllAdmins(){
      $this->requireSuperAdmin();
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
      $this->requireSuperAdmin();
      $data = json_decode(file_get_contents("php://input"),true);
      if(!isset($data["keyword"])){
        $this->sendError("keyword Require");
      }
      $result = $this->adminModel
                ->searchAdmin($data["keyword"]);
      if($result === false || empty($result) ){
        $this->sendError("No Admins Found",404);
        return;
      }
      return $this->json([
        "status"=>"success",
        "data" => $result,
      ]);
    }
    public function getAdminById($id){
    $this->requireSuperAdmin();
      $admin = $this->adminModel
              ->getAdminById($id);
      if($admin === false || empty($admin) ){
        $this->sendError("No Admin Found",404);
        return;
      }
      return $this->json([
        "status" => "success",
        "user" => $admin
      ]);
    }
    public function deleteAdmin($id){
      $this->requireSuperAdmin();
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
      $this->requireSuperAdmin();
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
      $this->requireSuperAdmin();
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