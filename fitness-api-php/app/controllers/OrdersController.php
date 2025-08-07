<?php
namespace App\Controllers;

use App\Core\AbstractController;
use App\models\Orders;
use App\models\Product;

use App\Helpers\NotifyHelper;

class OrdersController extends AbstractController {
  private $orderModel;
  private $productModel;
  public function __construct() {
    parent::__construct();
    $this->orderModel = new Orders();
    $this->productModel = new Product();
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
    
    $product = $this->productModel->getProductById($data['product_id']);
    NotifyHelper::pushToAllAdmins(
        "طلب أوردر جديد",
        "قام المستخدم {$user['email']} بطلب المنتج: {$product['name']} (ID: {$data['product_id']})"
    );
  // إشعار للمستخدم
    NotifyHelper::pushToSpecificUser(
        $data['user_id'],
        "تم استلام طلبك",
        "تم استلام طلب الأوردر الخاص بك بنجاح، وسيتم مراجعته قريبًا."
    );
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
