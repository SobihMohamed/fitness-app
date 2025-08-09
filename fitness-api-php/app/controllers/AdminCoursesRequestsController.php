<?php
namespace App\Controllers;
use App\Core\AbstractController;
use App\models\CoursesRequest;
use App\models\Admin;
use App\Helpers\NotifyHelper;

class AdminCoursesRequestsController extends AbstractController {
  protected $reqModel;

  public function __construct(){
    parent::__construct();
    $this->reqModel = new CoursesRequest();
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

      $request = $this->reqModel->showRequestDetails($id);
      if (!$request)
          return $this->sendError("Request not found", 404);

      $ok = $this->reqModel->update($id, ["status" => "approved"]);
      if (!$ok) 
          return $this->sendError("Cannot approve", 500);

      // إشعار لليوزر
      NotifyHelper::pushToSpecificUser(
          $request['user_id'],
          "طلب الاشتراك بالكورس {$request['title']} تم قبوله",
          "تمت الموافقة على طلب الاشتراك الخاص بك. نتمنى لك التوفيق!"
      );

      // إشعار لكل الأدمنات (مع استثناء الأدمن الحالي)
      $admin = $this->getUserFromToken();
      NotifyHelper::pushToAllAdmins(
          "تمت الموافقة على طلب كورس رقم {$id}",
          "الأدمن {$admin['email']} وافق على طلب كورس للمستخدم ID: {$request['user_id']}",
          $excludeAdminId = $admin['id']
      );

      return $this->json(["status" => "success", "message" => "Request approved"]);
  }


    // PUT reject/{id}
  public function canecl($id){
      $this->requireSuperAdmin();

      $request = $this->reqModel->showRequestDetails($id);
      if (!$request)
          return $this->sendError("Request not found", 404);

      $ok = $this->reqModel->update($id, ["status" => "cancelled"]);
      if (!$ok) 
          return $this->sendError("Cannot Cancelled", 500);

      // إشعار لليوزر
      NotifyHelper::pushToSpecificUser(
          $request['user_id'],
          "طلب الاشتراك بالكورس {$request['title']} تم رفضه",
          "تم رفض طلب الاشتراك الخاص بك. للمزيد من التفاصيل تواصل معنا عبر البريد الإلكتروني."
      );

      // إشعار لكل الأدمنات (مع استثناء الأدمن الحالي)
      $admin = $this->getUserFromToken();
      NotifyHelper::pushToAllAdmins(
          "تم رفض طلب كورس رقم {$id}",
          "الأدمن {$admin['email']} رفض طلب كورس للمستخدم ID: {$request['user_id']}",
          $excludeAdminId = $admin['id']
      );

      return $this->json(["status" => "success", "message" => "Request Cancelled"]);
  }

  
  // DELETE delete/{id}
  public function delete($id){
    $this->requireSuperAdmin();
    $ok = $this->reqModel->delete($id);
    if (!$ok) 
      return $this->sendError("Cannot delete",500);
    return $this->json(["status"=>"success","message"=>"Request deleted"]);
  }
}
?>
