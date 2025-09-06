<?php
  namespace App\Controllers;

  use App\Core\AbstractController;
  use App\models\Modules;
  use App\models\Admin;

  class AdminCourseModulesController extends AbstractController{
    private $moduleModel;
    public function __construct(){
      parent::__construct();
      $this->moduleModel = new Modules();
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
      $this->requireSuperAdmin();

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
    public function addModule(){
      $this->requireSuperAdmin();
      $data = json_decode(file_get_contents("php://input"), true);
      if(empty($data)){
        $this->sendError("All Fields Are Required");
        return;
      }
      $added = $this->moduleModel->addModule($data);
      if($added === false){
        $this->sendError("Error During Added");
      }
      return $this->json([
        "status" => "success",
        "message"=> "Module Added Successfully"
      ]);
    }
    public function updateModule($id){
      $this->requireSuperAdmin();
      $data = json_decode(file_get_contents("php://input"),true);
      $updated = $this->moduleModel
                      ->updateModule($id,$data);
      if(!$updated){

        $this->sendError("Error During Update Module");
        return;
      }
      $this->json([
        "status" => "success",
        "message" => "Module Updated Successfully"
      ]);
    }
    public function deleteModule($id){
      $this->requireSuperAdmin();
      $isDeleted = $this->moduleModel
                        ->deleteModule($id);
      if(!$isDeleted) {
        $this->sendError("Error During Delete Module");
        return;
      }
      $this->json([
        "status"=>"success",
        "message"=>"Delete Module Successfully"
      ]);
    }
  }
?>