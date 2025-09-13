<?php
namespace App\Controllers;

use App\Core\AbstractController;
use App\models\Orders;
use App\models\Product;
use App\models\Promo_Codes;

use App\Helpers\NotifyHelper;
use DateTime;

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

    $product = $this->productModel->getProductById($data['product_id']);

    $data['original_total'] = $data['quantity'] * $product['price'];

    if($data['promo_code_used'] != null && trim($data['promo_code_used']) != "") {
        $promoModel = new Promo_Codes();
        $PromoCode = $promoModel->getPromoByPromo($data['promo_code_used']);
        if(empty($PromoCode)){
          $this->sendError("InValid Promo Code");
          return;
        }
        $currentDate = new DateTime();
        $endDate = new DateTime($PromoCode['end_date']);
        $percentageOfDiscount = 0;
        if(!empty($PromoCode)){
          if($currentDate < $endDate){
            $percentageOfDiscount = $PromoCode['percentage_of_discount'];
            $data['discount_value'] = $percentageOfDiscount;
            $data['net_total'] = $data['original_total'] - ($data['original_total'] * $percentageOfDiscount / 100) ;
          }else{
            $this->sendError("Promo Code Not Available");
            return;
          }
        }
    }

    $ok = $this->orderModel->create($data);

    if (!$ok) return $this->sendError("Order creation failed", 500);
    
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
