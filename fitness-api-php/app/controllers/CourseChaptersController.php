<?php
  namespace App\Controllers;

  use App\Core\AbstractController;
  use App\models\Chapters;
  use App\models\Admin;

  class CourseChaptersController extends AbstractController{
    private $chapterModel;
    public function __construct(){
      parent::__construct();
      $this->chapterModel = new Chapters();
    }
    public function getAll(){

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
  }
?>