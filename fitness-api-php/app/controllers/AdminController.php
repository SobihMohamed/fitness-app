<?php
namespace App\Controllers;
use App\Core\AbstractController;
use App\models\Admin;

class AdminController extends AbstractController{
    protected $userModel;
    public function __construct(){
      $this->userModel = new Admin();
    }


    // Admins
    public function getAllAdmins() {
      if (!$this->isSuperAdmin()) {
        return $this->sendError("You are not authorized", 403);
      }
      $admins = $this->userModel->getAllAdmins();
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