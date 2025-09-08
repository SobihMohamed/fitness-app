<?php
namespace App\Controllers;
use App\Core\AbstractController;
use App\models\Courses;
use App\models\Admin;

class AdminCoursesController extends AbstractController{
  private $courseModel;
    public function __construct() {
      parent::__construct();
      $this->courseModel = new Courses();
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

      $Courses = $this->courseModel->getAll();
      if($Courses === false){
        $this->sendError("Error During Get Courses");
        return;
      }elseif(empty($Courses)){
        $this->sendError("No Courses Found",404);
        return;
      }
      return $this->json([
        "status" => "success",
        "message" => "All Courses Found",
        "data" => $Courses
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
    public function addCourse(){
    $this->requireSuperAdmin();

    if ($_SERVER["REQUEST_METHOD"] !== "POST") {
        $this->sendError("Invalid Request");
        return;
    }

    $data = $_POST;
    $data['image_url'] = null;

    $this->courseModel->addCourse($data);
    $courseId = $this->courseModel->lastInserted();
    if (!$courseId) {
          $this->sendError("Error During Adding Course");
          return;
      }

    if (isset($_FILES['image_url'])) {
        $image = $_FILES['image_url'];

        // تنظيف اسم الصورة من أي مسار إضافي
        $cleanName = basename($image['name']);
        $imageName = time() . '_' . $cleanName;

        $uploadDir = "/uploads/Courses/$courseId/";
        $targetDir  = __DIR__ . '/../../public' . $uploadDir;
        if (!is_dir($targetDir)) {
            mkdir($targetDir, 0777, true);
        }
        $targetPath = $targetDir . $imageName;

        if (move_uploaded_file($image['tmp_name'], $targetPath )) {
            // المسار النسبي فقط لتخزينه في قاعدة البيانات
            $imageUrl = $uploadDir . $imageName;
            $this->courseModel->updateCourse($courseId, [
                    'image_url' => $imageUrl
                ]);
        } else {
            $this->sendError("Failed to Upload Image");
            return;
        }
    }

    return $this->json([
        "status" => "success",
        "message" => "Course Added Successfully"
    ]);
    }
    public function updateCourse($id){
        $this->requireSuperAdmin();
        $data = $_POST;

        $Course = $this->courseModel->getCourseById($id);
        if (!$Course) {
            $this->sendError("Course Not Found");
            return;
        }

        // حالة لو في صورة جديدة مرفوعة
    if (!empty($_FILES['image_url']['name'])) {
        $image = $_FILES['image_url'];
        $cleanName = basename($image['name']);
        $imageName = time() . '_' . $cleanName;

        // نفس هيكلة addCourse
        $uploadDir = "/uploads/Courses/$id/";
        $targetDir = __DIR__ . '/../../public' . $uploadDir;
        if (!is_dir($targetDir)) {
            mkdir($targetDir, 0777, true);
        }

        $targetPath = $targetDir . $imageName;

        if (move_uploaded_file($image['tmp_name'], $targetPath)) {
            // حذف الصورة القديمة لو موجودة
            if (!empty($Course['image_url'])) {
                $oldPath = __DIR__ . '/../../public' . $Course['image_url'];
                if (file_exists($oldPath)) {
                    unlink($oldPath);
                }
            }

            // تخزين المسار الجديد
            $data['image_url'] = $uploadDir . $imageName;
        } else {
            $this->sendError("Failed to upload new image");
            return;
        }
    }elseif (isset($_POST['image_url']) && empty($_POST['image_url'])) {
        // المستخدم مسح الصورة من الـ input
        if (!empty($Course['image_url'])) {
            $oldPath = __DIR__ . '/../../public' . $Course['image_url'];
            if (file_exists($oldPath)) {
                unlink($oldPath);
            }
        }
        $data['image_url'] = null; // امسحها من الداتابيز

    } else {
        // مفيش صورة جديدة → خلي القديمة زي ما هي
        $data['image_url'] = $Course['image_url'];
    }
        $updated = $this->courseModel->updateCourse($id, $data);

        if ($updated) {
            $this->json(["status" => "success", "message" => "Course updated"]);
        } else {
            $this->sendError("Failed to update Course");
        }
    }
    public function getCourseById($id){
      $this->requireSuperAdmin();

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
    public function deleteCourse($courseId) {
      $this->requireSuperAdmin();

      // 1. Get the course to retrieve the image URL
      $course = $this->courseModel->getCourseById($courseId);
      if (!$course) {
          $this->sendError("Course Not Found");
          return;
      }

      // 2. Delete the course from the database
      $isDeleted = $this->courseModel->deleteCourse($courseId);
      if (!$isDeleted) {
          $this->sendError("Error During Delete Course");
          return;
      }

      // 3. Delete the whole folder of the course (if exists)
      $courseFolder = __DIR__ . "/../../public/uploads/Courses/$courseId/";
      if (is_dir($courseFolder)) {
          $this->deleteDirectory($courseFolder);
      }

      $this->json([
          "status" => "success",
          "message" => "Delete Course Successfully"
      ]);
    }
    private function deleteDirectory($dir) {
      if (!file_exists($dir)) {
          return true;
      }
      if (!is_dir($dir)) {
          return unlink($dir);
      }
      foreach (scandir($dir) as $item) {
          if ($item == '.' || $item == '..') {
              continue;
          }
          if (!$this->deleteDirectory($dir . DIRECTORY_SEPARATOR . $item)) {
              return false;
          }
      }
      return rmdir($dir);
    }
    public function deleteCourseImage($courseId) {
      $this->requireSuperAdmin();

      $Course = $this->courseModel->getCourseById($courseId);
      if (!$Course) {
          $this->sendError("Course Not Found");
          return;
      }

      if (!empty($Course['image_url'])) {
          $oldPath = __DIR__ . '/../../public' . $Course['image_url'];
          if (file_exists($oldPath)) {
              unlink($oldPath);
              $courseFolder = __DIR__ . "/../../public/uploads/Courses/$courseId/";
              if (is_dir($courseFolder)) {
                $this->deleteDirectory($courseFolder);
            }
          }
      }

      $this->courseModel->updateCourse($courseId, ['image_url' => null]);

      $this->json([
          "status" => "success",
          "message" => "Course image deleted successfully"
      ]);
    }
}
?>