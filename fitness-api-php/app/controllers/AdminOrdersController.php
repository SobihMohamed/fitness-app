<?php
namespace App\Controllers;
use App\Core\AbstractController;
use App\models\Orders;
use App\models\Admin;
use App\Helpers\NotifyHelper;
class AdminOrdersController extends AbstractController{
  private $orderModel;
    public function __construct() {
      parent::__construct();
      $this->orderModel = new Orders();
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
    // get all orders
    public function getAll() {
      $this->requireSuperAdmin();
      $orders = $this->orderModel->getAll();
      return $this->json(["status" => "success", "data" => $orders]);
    }
    // get order by Id
    public function showOrder($id) {
      $this->requireSuperAdmin();
      $order = $this->orderModel->getByOrderId($id);
      if (!$order) return $this->sendError(message: "Order not found", code: 404);
      return $this->json(["status" => "success", "data" => $order]);
    }

    public function filterByStatus($status) {
      $this->requireSuperAdmin();
      $orders = $this->orderModel->getByStatus($status);
      return $this->json(["status" => "success", "data" => $orders]);
    }

    // PUT /approve/{id}
    // ! error of the name in more than one table
    public function approve($id){
    $this->requireSuperAdmin();
    $order = $this->orderModel->getByOrderId($id);
    if (!$order)
        return $this->sendError("Request not found", 404);
    $ok = $this->orderModel
                ->update($id, ["status"=>"approved"]);
    if (!$ok) 
      return $this->sendError("Cannot approve",500);

    NotifyHelper::pushToSpecificUser(
        $order['user_id'],
        "تمت الموافقة على طلبك",
        "تمت الموافقة على طلبك لمنتج: {$order['name']} (رقم الطلب: {$order['product_id']}) من قبل الإدارة."
    );

    // إشعار لكل الأدمنات (ماعدا اللي وافق نفسه)
        $admin = $this->getUserFromToken();
    NotifyHelper::pushToAllAdmins(
        "تمت الموافقة على طلب رقم {$id}",
        "الأدمن {$admin['email']} وافق على طلب المنتج: {$order['name']} (ID: {$order['product_id']}) للمستخدم ID: {$order['user_id']}.",
        $excludeAdminId = $admin['id']
    );

    return $this->json(["status"=>"success","message"=>"Request approved"]);
  }

  // PUT reject/{id}
<<<<<<< HEAD
  public function cancel($id){
=======
public function cancel($id) {
>>>>>>> upstream/main
    $this->requireSuperAdmin();

    $order = $this->orderModel->getByOrderId($id);
    if (!$order)
        return $this->sendError("Request not found", 404);

    $ok = $this->orderModel->update($id, ["status" => "cancel"]);
    if (!$ok)
        return $this->sendError("Cannot cancel request", 500);

    // احضر الأدمن اللي عمل الرفض
    $admin = $this->getUserFromToken();

    // إشعار للمستخدم
    NotifyHelper::pushToSpecificUser(
        $order['user_id'],
        "تم رفض طلبك",
        "تم رفض طلب الأوردر الخاص بك لمنتج: {$order['name']} من قبل الإدارة."
    );

    // إشعار لكل الأدمنات (عدا اللي رفض)
    NotifyHelper::pushToAllAdmins(
        "تم رفض طلب رقم {$id}",
        "الأدمن {$admin['email']} رفض طلب المنتج: {$order['name']} (ID: {$order['product_id']}) للمستخدم ID: {$order['user_id']}.",
        $excludeAdminId = $admin['id']
    );

    return $this->json(["status" => "success", "message" => "Order cancelled"]);
}

  
  // DELETE delete/{id}
  public function delete($id){
    $this->requireSuperAdmin();
    $ok = $this->orderModel->delete($id);
    if (!$ok) 
      return $this->sendError("Cannot delete",500);
    return $this->json(["status"=>"success","message"=>"Order deleted"]);
  }   
}
?>