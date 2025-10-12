<?php
  namespace App\Controllers;

  use App\Core\AbstractController;
  use App\models\Courses;
  use App\models\CoursesRequest;
  use App\models\Modules;
  use App\Models\Chapters;
  
  class CoursesController extends AbstractController{
    private $courseModel;
    private $modulModel;
    private $chapterModel;
    private $requestModel;

    public function __construct(){
      $this->courseModel = new Courses();
      $this->modulModel = new Modules();
      $this->chapterModel = new Chapters();
      $this->requestModel = new CoursesRequest();
    }
    public function getAll(){
      $Courses = $this->courseModel->getAll();
      $user = $this->getUserFromToken();
      $userId = $user["id"];

      $userCourses = $this->requestModel->getRequestsByUserId($userId);
      $userCoursesIds = array_column($userCourses,'course_id');

      foreach ($Courses as &$course) {
        $course['is_subscribed'] = in_array($course['course_id'],$userCoursesIds);
      }

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
    public function CoursePage($id) {
    $Course = $this->courseModel->getCourseById($id);
    if ($Course === false) {
        $this->sendError("Error During Find Course");
        return;
    }

    // هات الموديولات
    $modules = $this->modulModel->getModulesByCrsId($id);

    foreach ($modules as &$module) {
        // هات الشابترز الخاصة بالموديول ده
        $chapters = $this->chapterModel->getChaptersByModId($module['module_id']);

        // ترتيب الشابترز بالـ order_number
        usort($chapters, function($a, $b) {
            return $a['order_number'] <=> $b['order_number'];
        });

        // تنسيق التواريخ للشابترز
        foreach ($chapters as &$ch) {
            if (!empty($ch['created_at'])) {
                $ch['created_at'] = date('c', strtotime($ch['created_at'])); // ISO 8601
            }
        }

        $module['chapters'] = $chapters;

        // تنسيق تاريخ الموديول
        if (!empty($module['created_at'])) {
            $module['created_at'] = date('c', strtotime($module['created_at']));
        }
    }

    // ترتيب الموديولات بالـ order_number
    usort($modules, function($a, $b) {
        return $a['order_number'] <=> $b['order_number'];
    });

    // ضيف الموديولات للكورس
    $Course['modules'] = $modules;

    // تنسيق تاريخ الكورس
    if (!empty($Course['created_at'])) {
        $Course['created_at'] = date('c', strtotime($Course['created_at']));
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