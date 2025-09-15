<?php
  namespace App\Controllers;

  use App\Core\AbstractController;
  use App\models\Chapters;
  use App\models\Admin;

  class AdminCourseChaptersController extends AbstractController{
    private $chapterModel;
    public function __construct(){
      parent::__construct();
      $this->chapterModel = new Chapters();
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

      $chapters = $this->chapterModel->getAllChapters();
      if($chapters === false){
        $this->sendError("Error During Get Chapters");
        return;
      }elseif(empty($chapters)){
        $this->sendError("No Chapter Found",404);
        return;
      }
      return $this->json([
        "status" => "success",
        "message" => "All Chapters Found",
        "data" => $chapters
      ]);
    }
    public function searchChapter(){
      $data = json_decode(file_get_contents("php://input"),true);
      if(!isset($data["keyword"])){
        $this->sendError("keyword Require");
        return;
      }
      $result = $this->chapterModel
                ->searchChapters($data["keyword"]);
      if($result === false || empty($result)){
        $this->sendError("Not Found Chapters");
        return;
      }
      return $this->json([
        "status"=>"success",
        "data" => $result,
      ]);
    }
    public function getSingleChapter($id){
      $this->requireSuperAdmin();

      $Chapter = $this->chapterModel
              ->getChapterById($id);
      if($Chapter === false){
        $this->sendError("Error During Find Chapter");
        return;
      }
      return $this->json([
        "status" => "success",
        "Chapter" => $Chapter
      ]);
    }
    public function addChapter(){
      $this->requireSuperAdmin();
      $data = json_decode(file_get_contents("php://input"), true);
      if(empty($data)){
        $this->sendError("All Fields Are Required");
        return;
      }
      $added = $this->chapterModel->addChapter($data);
      if($added === false){
        $this->sendError("Error During Added");
      }
      return $this->json([
        "status" => "success",
        "message"=> "Chapter Added Successfully"
      ]);
    }
    public function updateChapter($id){
      $this->requireSuperAdmin();
      $data = json_decode(file_get_contents("php://input"),true);
      $updated = $this->chapterModel
                      ->updateChapter($id,$data);
      if(!$updated){

        $this->sendError("Error During Update Chapter");
        return;
      }
      $this->json([
        "status" => "success",
        "message" => "Chapter Updated Successfully"
      ]);
    }
    public function deleteChapter($id){
      $this->requireSuperAdmin();
      $isDeleted = $this->chapterModel
                        ->deleteChapter($id);
      if(!$isDeleted) {
        $this->sendError("Error During Delete Chapter");
        return;
      }
      $this->json([
        "status"=>"success",
        "message"=>"Delete Chapter Successfully"
      ]);
    }
  }
?>