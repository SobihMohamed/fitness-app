<?php
  namespace App\Controllers;

  use App\Core\AbstractController;
  use App\models\Service;
  
  class ServicesController extends AbstractController{
    private $serviceModel;

    public function __construct(){
      $this->serviceModel = new Service();
    }
    public function getAll(){
      $Services = $this->serviceModel->getAll();
      if($Services === false){
        $this->sendError("Error During Get Services");
      }elseif(empty($Services)){
        $this->sendError("No Services Found",404);
      }
      // نشيل admin_id من كل Service
      foreach ($Services as &$service) {
          unset($service['admin_id']);
      }
      return $this->json([
        "status" => "success",
        "message" => "All Services Found",
        "data" => $Services
      ]);
    }

    public function singleService($id){
      $Service = $this->serviceModel
              ->getServiceById($id);
      if($Service === false){
        $this->sendError("Error During Find Service");
        return;
      }
        // نشيل admin_id من كل Service
        unset($Service['admin_id']);

      return $this->json([
        "status" => "success",
        "Service" => $Service
      ]);
    }

      public function searchService(){
      $data = json_decode(file_get_contents("php://input"),true);
      if(!isset($data["keyword"])){
        $this->sendError("keyword Require");
        return;
      }
      $result = $this->serviceModel
                ->searchService($data["keyword"]);
      if($result === false || empty($result)){
        $this->sendError("Not Found Services");
        return;
      }
        foreach ($result as &$r) {
          unset($r['admin_id']);
      }
      return $this->json([
        "status"=>"success",
        "data" => $result,
      ]);
    }

  }
?>