<?php
  namespace App\Controllers;

  use App\Core\AbstractController;
  use App\models\Promo_Codes;
  use App\models\Admin;

  class AdminPromoCodesController extends AbstractController{
    private $promoCodeModel;
    public function __construct(){
      parent::__construct();
      $this->promoCodeModel = new Promo_Codes();
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
    public function getAll(){
      $this->requireSuperAdmin();

      $promoCodes = $this->promoCodeModel->getAllPromoCodes();
      if($promoCodes === false){
        $this->sendError("Error During Get promoCodes");
        return;
      }elseif(empty($promoCodes)){
        $this->sendError("No PromoCode Found",404);
        return;
      }
      return $this->json([
        "status" => "success",
        "message" => "All promoCodes Found",
        "data" => $promoCodes
      ]);
    }

    public function getSinglePromoCode($id){
        $this->requireSuperAdmin();

      $promoCode = $this->promoCodeModel->getPromoCodeById($id);
      if($promoCode === false){
        $this->sendError("Error During Get promoCode");
        return;
      }elseif(empty($promoCode)){
        $this->sendError("No PromoCode Found",404);
        return;
      }
      return $this->json([
        "status" => "success",
        "message" => "All promoCode Found",
        "data" => $promoCode
      ]);
    }
    public function addPromoCode(){
      $this->requireSuperAdmin();
      $data = json_decode(file_get_contents("php://input"), true);
      if(empty($data)){
        $this->sendError("All Fields Are Required");
        return;
      }
      $added = $this->promoCodeModel->addPromoCode($data);
      if($added === false){
        $this->sendError("Error During Added");
      }
      return $this->json([
        "status" => "success",
        "message"=> "PromoCode Added Successfully"
      ]);
    }
    public function updatePromoCode($id){
      $this->requireSuperAdmin();
      $data = json_decode(file_get_contents("php://input"),true);
      $updated = $this->promoCodeModel
                      ->updatePromoCode($id,$data);
      if(!$updated){

        $this->sendError("Error During Update PromoCode");
        return;
      }
      $this->json([
        "status" => "success",
        "message" => "PromoCode Updated Successfully"
      ]);
    }
    public function deletePromoCode($id){
      $this->requireSuperAdmin();
      $isDeleted = $this->promoCodeModel
                        ->deletePromoCode($id);
      if(!$isDeleted) {
        $this->sendError("Error During Delete PromoCode");
        return;
      }
      $this->json([
        "status"=>"success",
        "message"=>"Delete PromoCode Successfully"
      ]);
    }
  }
?>