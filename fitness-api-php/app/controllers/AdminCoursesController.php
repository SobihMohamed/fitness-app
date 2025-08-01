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
    public function addCourse(){
    $this->requireSuperAdmin();

    if ($_SERVER["REQUEST_METHOD"] !== "POST") {
        $this->sendError("Invalid Request");
        return;
    }

    $data = $_POST;

    if (empty($data)) {
        $this->sendError("All Fields Are Required");
        return;
    }

    if (isset($_FILES['image_url'])) {
        $image = $_FILES['image_url'];

        // تنظيف اسم الصورة من أي مسار إضافي
        $cleanName = basename($image['name']);
        $imageName = time() . '_' . $cleanName;

        $uploadDir = '/uploads/Courses/';
        $targetPath = __DIR__ . '/../../public' . $uploadDir . $imageName;

        if (move_uploaded_file($image['tmp_name'], $targetPath)) {
            // المسار النسبي فقط لتخزينه في قاعدة البيانات
            $imageUrl = $uploadDir . $imageName;
        } else {
            $this->sendError("Failed to Upload Image");
            return;
        }
    } else {
        $imageUrl = null;
    }

    $data['image_url'] = $imageUrl;

    $added = $this->courseModel->addCourse($data);

    if ($added === false) {
        $this->sendError("Error During Added");
        return;
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
            $imageName = time() . '_' . $_FILES['image_url']['name'];
            $imageTmpName = $_FILES['image_url']['tmp_name'];
            $uploadPath = __DIR__ . '/../../public/uploads/Courses/' . $imageName;

            if (move_uploaded_file($imageTmpName, $uploadPath)) {
                // حذف الصورة القديمة (بعد تنظيف المسار)
                $oldImageName = basename($Course['image_url']); // هنا بنستخرج اسم الصورة فقط
                $oldPath = __DIR__ . '/../../public/uploads/Courses/' . $oldImageName;
                if (file_exists($oldPath)) {
                    unlink($oldPath);
                }

                // تخزين المسار الجديد
                $data['image_url'] = '/uploads/Courses/' . $imageName;
            } else {
                $this->sendError("Failed to upload new image");
                return;
            }

        } elseif (!empty($data['image_url']) && $data['image_url'] !== $Course['image_url']) {
            // حذف الصورة القديمة فقط لو الرابط اتغير (نادراً ما يحصل لو بترفع من جديد)
            $oldImageName = basename($Course['image_url']);
            $oldPath = __DIR__ . '/../../public/uploads/Courses/' . $oldImageName;
            if (file_exists($oldPath)) {
                unlink($oldPath);
            }
        } else {
            // مفيش تغيير في الصورة
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

      // 3. Delete the image file if it exists
      if (!empty($course['image_url'])) {
          $imagePath = __DIR__ . '/../../public' . $course['image_url'];
          if (file_exists($imagePath)) {
              unlink($imagePath);
          }
      }

      $this->json([
          "status" => "success",
          "message" => "Delete Course Successfully"
      ]);
    }

}
?>