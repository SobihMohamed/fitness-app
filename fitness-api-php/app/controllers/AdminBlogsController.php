<?php
namespace App\Controllers;
use App\Core\AbstractController;
use App\models\Blogs;
use App\models\Admin;

class AdminBlogsController extends AbstractController{
  private $blogsModel;
  private $admin_id;
  public function __construct() {
    parent::__construct();
    $this->blogsModel = new Blogs();
  }

  private function requireSuperAdmin(){
      $currentUser = $this->getUserFromToken();
      $adminModel = new Admin();
      $admin = $adminModel->getAdminById($currentUser["id"]);
      $this->admin_id = $admin['admin_id'];
    if( !(isset($admin['is_super_admin']) && $admin['is_super_admin'] == 1)){
      $this->sendError("Not Authorized");
      exit;
    }
  }
public function getAll(){
      $this->requireSuperAdmin();

      $Blogs = $this->blogsModel->getAll();
      if($Blogs === false){
        $this->sendError("Error During Get Blogs");
        return;
      }elseif(empty($Blogs)){
        $this->sendError("No Blogs Found",404);
        return;
      }
      return $this->json([
        "status" => "success",
        "message" => "All Blogs Found",
        "data" => $Blogs
      ]);
    }
    public function addBlog(){
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

    if (isset($_FILES['main_image'])) {
        $image = $_FILES['main_image'];

        // تنظيف اسم الصورة من أي مسار إضافي
        $cleanName = basename($image['name']);
        $imageName = time() . '_' . $cleanName;

        $uploadDir = '/uploads/Blogs/';
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

    $data['main_image'] = $imageUrl;
    $data['admin_id'] = $this->admin_id;

    $added = $this->blogsModel->addBlog($data);

    if ($added === false) {
        $this->sendError("Error During Added");
        return;
    }

    return $this->json([
        "status" => "success",
        "message" => "Blog Added Successfully"
    ]);
    }
    public function updateBlog($id){
        $this->requireSuperAdmin();
        $data = $_POST;

        $Blog = $this->blogsModel->getBlogById($id);
        if (!$Blog) {
            $this->sendError("Blog Not Found");
            return;
        }

        // حالة لو في صورة جديدة مرفوعة
        if (!empty($_FILES['main_image']['name'])) {
            $imageName = time() . '_' . $_FILES['main_image']['name'];
            $imageTmpName = $_FILES['main_image']['tmp_name'];
            $uploadPath = __DIR__ . '/../../public/uploads/Blogs/' . $imageName;

            if (move_uploaded_file($imageTmpName, $uploadPath)) {
                // حذف الصورة القديمة (بعد تنظيف المسار)
                $oldImageName = basename($Blog['main_image']); // هنا بنستخرج اسم الصورة فقط
                $oldPath = __DIR__ . '/../../public/uploads/Blogs/' . $oldImageName;
                if (file_exists($oldPath)) {
                    unlink($oldPath);
                }

                // تخزين المسار الجديد
                $data['main_image'] = '/uploads/Blogs/' . $imageName;
            } else {
                $this->sendError("Failed to upload new image");
                return;
            }

        } elseif (!empty($data['main_image']) && $data['main_image'] !== $Blog['main_image']) {
            // حذف الصورة القديمة فقط لو الرابط اتغير (نادراً ما يحصل لو بترفع من جديد)
            $oldImageName = basename($Blog['main_image']);
            $oldPath = __DIR__ . '/../../public/uploads/Blogs/' . $oldImageName;
            if (file_exists($oldPath)) {
                unlink($oldPath);
            }
        } else {
            // مفيش تغيير في الصورة
            $data['main_image'] = $Blog['main_image'];
        }
        $data['admin_id'] = $this->admin_id;
        $updated = $this->blogsModel->updateBlog($id, $data);

        if ($updated) {
            $this->json(["status" => "success", "message" => "Blog updated"]);
        } else {
            $this->sendError("Failed to update Blog");
        }
    }

    public function getBlogById($id){
      $this->requireSuperAdmin();

      $Blog = $this->blogsModel
              ->getBlogById($id);
      if($Blog === false){
        $this->sendError("Error During Find Blog");
        return;
      }
      return $this->json([
        "status" => "success",
        "Blog" => $Blog
      ]);
    }
    public function deleteBlog($BlogId) {
      $this->requireSuperAdmin();

      // 1. Get the Blog to retrieve the image URL
      $Blog = $this->blogsModel->getBlogById($BlogId);
      if (!$Blog) {
          $this->sendError("Blog Not Found");
          return;
      }

      // 2. Delete the Blog from the database
      $isDeleted = $this->blogsModel->deleteBlog($BlogId);
      if (!$isDeleted) {
          $this->sendError("Error During Delete Blog");
          return;
      }

      // 3. Delete the image file if it exists
      if (!empty($Blog['main_image'])) {
          $imagePath = __DIR__ . '/../../public' . $Blog['main_image'];
          if (file_exists($imagePath)) {
              unlink($imagePath);
          }
      }

      $this->json([
          "status" => "success",
          "message" => "Delete Blog Successfully"
      ]);
    }

}