<?php
  namespace App\Controllers;

  use App\Core\AbstractController;
  use App\models\Modules;

  class CourseModulesController extends AbstractController{
    private $moduleModel;
    public function __construct(){
      parent::__construct();
      $this->moduleModel = new Modules();
    }
  
    public function getAll(){

      $Modules = $this->moduleModel->getAllModules();
      if($Modules === false){
        $this->sendError("Error During Get Modules");
        return;
      }elseif(empty($Modules)){
        $this->sendError("No Modules Found",404);
        return;
      }
      return $this->json([
        "status" => "success",
        "message" => "All Modules Found",
        "data" => $Modules
      ]);
    }

    public function searchModule(){
      $data = json_decode(file_get_contents("php://input"),true);
      if(!isset($data["keyword"])){
        $this->sendError("keyword Require");
        return;
      }
      $result = $this->moduleModel
                ->searchModules($data["keyword"]);
      if($result === false || empty($result)){
        $this->sendError("Not Found Modules");
        return;
      }
      return $this->json([
        "status"=>"success",
        "data" => $result,
      ]);
    }
    public function getSingleModule($id){

      $Module = $this->moduleModel
              ->getModuleById($id);
      if($Module === false){
        $this->sendError("Error During Find Module");
        return;
      }
      return $this->json([
        "status" => "success",
        "Module" => $Module
      ]);
    }
  }
?>