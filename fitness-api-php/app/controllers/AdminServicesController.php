<?php
namespace App\Controllers;
use App\Core\AbstractController;
use App\models\Service;
use App\models\Admin;

class AdminServicesController extends AbstractController{
  private $servicesModel;
  private $admin_id;
  public function __construct() {
    parent::__construct();
    $this->servicesModel = new Service();
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

      $Services = $this->servicesModel->getAll();
      if($Services === false){
        $this->sendError("Error During Get Services");
        return;
      }elseif(empty($Services)){
        $this->sendError("No Services Found",404);
        return;
      }
      return $this->json([
        "status" => "success",
        "message" => "All Services Found",
        "data" => $Services
      ]);
    }
    public function addService(){
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

    if (isset($_FILES['picture'])) {
        $image = $_FILES['picture'];

        // تنظيف اسم الصورة من أي مسار إضافي
        $cleanName = basename($image['name']);
        $imageName = time() . '_' . $cleanName;

        $uploadDir = '/uploads/Services/';
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

    $data['picture'] = $imageUrl;
    $data['admin_id'] = $this->admin_id;

    $added = $this->servicesModel->addService($data);

    if ($added === false) {
        $this->sendError("Error During Added");
        return;
    }

    return $this->json([
        "status" => "success",
        "message" => "Service Added Successfully"
    ]);
    }
    public function updateService($id){
        $this->requireSuperAdmin();
        $data = $_POST;

        $Service = $this->servicesModel->getServiceById($id);
        if (!$Service) {
            $this->sendError("Service Not Found");
            return;
        }

        // حالة لو في صورة جديدة مرفوعة
        if (!empty($_FILES['picture']['name'])) {
            $imageName = time() . '_' . $_FILES['picture']['name'];
            $imageTmpName = $_FILES['picture']['tmp_name'];
            $uploadPath = __DIR__ . '/../../public/uploads/Services/' . $imageName;

            if (move_uploaded_file($imageTmpName, $uploadPath)) {
                // حذف الصورة القديمة (بعد تنظيف المسار)
                $oldImageName = basename($Service['picture']); // هنا بنستخرج اسم الصورة فقط
                $oldPath = __DIR__ . '/../../public/uploads/Services/' . $oldImageName;
                if (file_exists($oldPath)) {
                    unlink($oldPath);
                }

                // تخزين المسار الجديد
                $data['picture'] = '/uploads/Services/' . $imageName;
            } else {
                $this->sendError("Failed to upload new image");
                return;
            }

        } elseif (!empty($data['picture']) && $data['picture'] !== $Service['picture']) {
            // حذف الصورة القديمة فقط لو الرابط اتغير (نادراً ما يحصل لو بترفع من جديد)
            $oldImageName = basename($Service['picture']);
            $oldPath = __DIR__ . '/../../public/uploads/Services/' . $oldImageName;
            if (file_exists($oldPath)) {
                unlink($oldPath);
            }
        } else {
            // مفيش تغيير في الصورة
            $data['picture'] = $Service['picture'];
        }
        $data['admin_id'] = $this->admin_id;
        $updated = $this->servicesModel->updateService($id, $data);

        if ($updated) {
            $this->json(["status" => "success", "message" => "Service updated"]);
        } else {
            $this->sendError("Failed to update Service");
        }
    }

    public function getServiceById($id){
      $this->requireSuperAdmin();

      $Service = $this->servicesModel
              ->getServiceById($id);
      if($Service === false){
        $this->sendError("Error During Find Service");
        return;
      }
      return $this->json([
        "status" => "success",
        "Service" => $Service
      ]);
    }
    public function deleteService($ServiceId) {
      $this->requireSuperAdmin();

      // 1. Get the Service to retrieve the image URL
      $Service = $this->servicesModel->getServiceById($ServiceId);
      if (!$Service) {
          $this->sendError("Service Not Found");
          return;
      }

      // 2. Delete the Service from the database
      $isDeleted = $this->servicesModel->deleteService($ServiceId);
      if (!$isDeleted) {
          $this->sendError("Error During Delete Service");
          return;
      }

      // 3. Delete the image file if it exists
      if (!empty($Service['picture'])) {
          $imagePath = __DIR__ . '/../../public' . $Service['picture'];
          if (file_exists($imagePath)) {
              unlink($imagePath);
          }
      }

      $this->json([
          "status" => "success",
          "message" => "Delete Service Successfully"
      ]);
    }

}