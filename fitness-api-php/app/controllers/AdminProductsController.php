<?php
namespace App\Controllers;
use App\models\Product;
use App\models\Admin;
use App\Core\AbstractController;

class AdminProductsController extends AbstractController{
    private $productModel;
    public function __construct() {
      $this->productModel = new Product();
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

      $products = $this->productModel->getAllProducts();
      if($products === false){
        $this->sendError("Error During Get Products");
        return;
      }elseif(empty($products)){
        $this->sendError("No Products Found",404);
        return;
      }
      return $this->json([
        "status" => "success",
        "message" => "All Products Found",
        "data" => $products
      ]);
    }
    public function addProduct(){
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

          $uploadDir = '/uploads/Products/';
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

      $added = $this->productModel->addProduct($data);

      if ($added === false) {
          $this->sendError("Error During Added");
          return;
      }

      return $this->json([
          "status" => "success",
          "message" => "Product Added Successfully"
      ]);
    }

    public function getProductById($id){
      $this->requireSuperAdmin();

      $Product = $this->productModel
              ->getProductById($id);
      if($Product === false){
        $this->sendError("Error During Find Product");
        return;
      }
      return $this->json([
        "status" => "success",
        "Product" => $Product
      ]);
    }
    public function updateProduct($id){
        $this->requireSuperAdmin();
        $data = $_POST;

        $Product = $this->productModel->getProductById($id);
        if (!$Product) {
            $this->sendError("Product Not Found");
            return;
        }

        // حالة لو في صورة جديدة مرفوعة
        if (!empty($_FILES['image_url']['name'])) {
            $imageName = time() . '_' . $_FILES['image_url']['name'];
            $imageTmpName = $_FILES['image_url']['tmp_name'];
            $uploadPath = __DIR__ . '/../../public/uploads/Products/' . $imageName;

            if (move_uploaded_file($imageTmpName, $uploadPath)) {
                // حذف الصورة القديمة (بعد تنظيف المسار)
                $oldImageName = basename($Product['image_url']); // هنا بنستخرج اسم الصورة فقط
                $oldPath = __DIR__ . '/../../public/uploads/Products/' . $oldImageName;
                if (file_exists($oldPath)) {
                    unlink($oldPath);
                }

                // تخزين المسار الجديد
                $data['image_url'] = '/uploads/Products/' . $imageName;
            } else {
                $this->sendError("Failed to upload new image");
                return;
            }

        } elseif (!empty($data['image_url']) && $data['image_url'] !== $Product['image_url']) {
            // حذف الصورة القديمة فقط لو الرابط اتغير (نادراً ما يحصل لو بترفع من جديد)
            $oldImageName = basename($Product['image_url']);
            $oldPath = __DIR__ . '/../../public/uploads/Products/' . $oldImageName;
            if (file_exists($oldPath)) {
                unlink($oldPath);
            }
        } else {
            // مفيش تغيير في الصورة
            $data['image_url'] = $Product['image_url'];
        }

        $updated = $this->productModel->updateProduct($id, $data);

        if ($updated) {
            $this->json(["status" => "success", "message" => "Product updated"]);
        } else {
            $this->sendError("Failed to update Product");
        }
    }
    public function deleteproduct($productId) {
      $this->requireSuperAdmin();

      // 1. Get the product to retrieve the image URL
      $product = $this->productModel->getProductById($productId);
      if (!$product) {
          $this->sendError("product Not Found");
          return;
      }

      // 2. Delete the product from the database
      $isDeleted = $this->productModel->deleteProduct($productId);
      if (!$isDeleted) {
          $this->sendError("Error During Delete product");
          return;
      }

      // 3. Delete the image file if it exists
      if (!empty($product['image_url'])) {
          $imagePath = __DIR__ . '/../../public' . $product['image_url'];
          if (file_exists($imagePath)) {
              unlink($imagePath);
          }
      }

      $this->json([
          "status" => "success",
          "message" => "Delete product Successfully"
      ]);
    }
  }
?>