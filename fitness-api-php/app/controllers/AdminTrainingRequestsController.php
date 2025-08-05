<?php
namespace App\Controllers;
use App\Core\AbstractController;
use App\models\TrainingRequest;
use App\models\Admin;

class AdminTrainingRequestsController extends AbstractController{
  protected $reqModel;

  public function __construct(){
    parent::__construct();
    $this->reqModel = new TrainingRequest();
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
  // GET All
  public function getAll(){
    $this->requireSuperAdmin();
    $all = $this->reqModel->getAll();
    if ($all === false) 
      return $this->sendError("Error fetching requests");
    return $this->json(["status"=>"success","data"=>$all]);
  }

  // Get Req Details by {id}
  public function showDetails($id){
    $this->requireSuperAdmin();
    $reqDetails = $this->reqModel->showRequestDetails($id);
    if (!$reqDetails)
      return $this->sendError("Request not found",404);
    return $this->json(["status"=>"success","data"=>$reqDetails]);
  }

  // PUT /approve/{id}
  public function approve($id){
    $this->requireSuperAdmin();
    $ok = $this->reqModel
                ->update($id, ["status"=>"approved"]);
    if (!$ok) 
      return $this->sendError("Cannot approve",500);
    return $this->json(["status"=>"success","message"=>"Request approved"]);
  }

  // PUT reject/{id}
  public function canecl($id){
    $this->requireSuperAdmin();
    $ok = $this->reqModel
                ->update($id, ["status"=>"Cancelled"]);
    if (!$ok) 
      return $this->sendError("Cannot Cancelled",500);
    return $this->json(["status"=>"success","message"=>"Request Cancelled"]);
  }
  
  // DELETE delete/{id}
  public function delete($id){
    $this->requireSuperAdmin();
    $ok = $this->reqModel->delete($id);
    if (!$ok) 
      return $this->sendError("Cannot delete",500);
    return $this->json(["status"=>"success","message"=>"Request deleted"]);
  }

  //get expiration soon
  public function getExpirationSoon(){
    $this->requireSuperAdmin();
    $this->reqModel->updateExpiredStatuses(); // تحديث الحالات المنتهيه
    $soon = $this->reqModel->getExpiringSoon();
    if(!$soon){
      $this->sendError("Not Found",404);
      return;
    }
    return $this->json(["status"=>"success", "data"=>$soon]);
  }
}
?>