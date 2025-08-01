<?php
namespace App\Controllers;

use App\Core\AbstractController;
use App\models\Notifications;
use App\models\Admin;

class AdminNotificationsController extends AbstractController {
  protected $notifModel;
  public function __construct(){
    parent::__construct();
    $this->notifModel = new Notifications();
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
    public function getAllNotifications(){
      $this->requireSuperAdmin();
      $notifications = $this->notifModel->getAll();
      if(empty($notifications) || $notifications === false){
        return $this->sendError("Not Found Notifications",404);
      }
      return $this->json([
        "status" =>'success',
        "data" => $notifications
      ]);
    }

    public function delete($id){
      $this->requireSuperAdmin();
      $ok = $this->notifModel->delete($id);
      if (!$ok) {
          return $this->sendError("Cannot delete", 500);
      }
      return $this->json([
          'status' => 'success',
          'message' => 'Notification deleted'
      ]);
    }
}