<?php
namespace App\Controllers;
use App\Core\AbstractController;
use App\models\Admin;

class AdminController extends AbstractController{
    protected $adminModel;
    public function __construct(){
      $this->adminModel = new Admin();
    }
    // Admins
    private function requireSuperAdmin(){
      $currentUser = $this->getUserFromToken();
      if( !(isset($currentUser['is_super_admin']) && $currentUser['is_super_admin'] == 1)){
        $this->sendError("Not Authorized");
        exit;
      }
    }
    public function getAllAdmins() {
      $this->requireSuperAdmin();

      $admins = $this->adminModel->getAllAdmins();
      if ($admins) {
        return $this->json([
          "status" => "success",
          "admins" => $admins
        ]);
      }
      return $this->sendError("No admins found");
    }
    

    
}
?>