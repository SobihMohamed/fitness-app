<?php
namespace App\Controllers;

use App\Core\AbstractController;
use App\models\Orders;
use App\Helpers\NotifyHelper;

class OrdersController extends AbstractController {
  private $orderModel;

  public function __construct() {
    parent::__construct();
    $this->orderModel = new Orders();
  }

  // إنشاء طلب جديد
  public function create() {
    $user = $this->getUserFromToken();
    $data = json_decode(file_get_contents("php://input"), true);
    $data['user_id'] = $user['id'];
    $data['status'] = 'pending'; // الحالة الابتدائي
    $data['purchase_date'] = date('Y-m-d');

    $ok = $this->orderModel->create($data);

    if (!$ok) return $this->sendError("Order creation failed", 500);

      // NotifyHelper::pushToAllAdmins("طلب أوردر جديد",
      //                               "طلب أوردر جديد من المستخدم {$user['email']}"
      //                             );
    return $this->json(["status" => "success", "message" => "Order created"]);
  }

  // جلب جميع الطلبات الخاصة بالمستخدم الحالي
  public function myOrders() {
    $user = $this->getUserFromToken();
    $orders = $this->orderModel->getByUser($user['id']);

    return $this->json(["status" => "success", "data" => $orders]);
  }

  // جلب طلب معين خاص بالمستخدم
  public function showMyOrder($id) {
    $user = $this->getUserFromToken();
    $order = $this->orderModel->getByOrderId($id);

    if (!$order || $order['user_id'] != $user['id']) {
      return $this->sendError("Order not found or unauthorized", 403);
    }

    return $this->json(["status" => "success", "data" => $order]);
  }
}
