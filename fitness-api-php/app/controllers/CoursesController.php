<?php
  namespace App\Controllers;

  use App\Core\AbstractController;
  use App\models\Courses;
  
  class CoursesController extends AbstractController{
    private $courseModel;

    public function __construct(){
      $this->courseModel = new Courses();
    }
      public function getAll(){
      $Courses = $this->courseModel->getAll();
      if($Courses === false){
        $this->sendError("Error During Get Courses");
      }elseif(empty($Courses)){
        $this->sendError("No Courses Found",404);
      }
      return $this->json([
        "status" => "success",
        "message" => "All Courses Found",
        "data" => $Courses
      ]);
    }

    public function singleCourse($id){
      $Course = $this->courseModel
              ->getCourseById($id);
      if($Course === false){
        $this->sendError("Error During Find Course");
        return;
      }
      return $this->json([
        "status" => "success",
        "Course" => $Course
      ]);
    }

      public function searchCourse(){
      $data = json_decode(file_get_contents("php://input"),true);
      if(!isset($data["keyword"])){
        $this->sendError("keyword Require");
        return;
      }
      $result = $this->courseModel
                ->searchCourses($data["keyword"]);
      if($result === false || empty($result)){
        $this->sendError("Not Found Courses");
        return;
      }
      return $this->json([
        "status"=>"success",
        "data" => $result,
      ]);
    }

  }
?>