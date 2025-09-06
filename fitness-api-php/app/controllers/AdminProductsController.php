<?php
namespace App\Controllers;
use App\models\Product;
use App\models\Product_sub_images;
use App\models\Admin;
use App\Core\AbstractController;

class AdminProductsController extends AbstractController{
    private $productModel;
    private $productSubImageModel;
    public function __construct() {
      parent::__construct();
      $this->productModel = new Product();
      $this->productSubImageModel = new Product_sub_images();
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
    public function addProduct()
    {
        $this->requireSuperAdmin();

        if ($_SERVER["REQUEST_METHOD"] !== "POST") {
            return $this->sendError("Invalid Request");
        }

        $data = $_POST;

        if (empty($data) || empty($data['name'])) {
            return $this->sendError("All Fields Are Required (including name)");
        }

        $data['main_image_url'] = null;

        // قص الصور الفرعية
        $subImages = $_FILES['sub_images'] ?? null;
        unset($data['sub_images']);

        // 1- أضف المنتج في الداتابيز (من غير صور)
        $added = $this->productModel->addProduct($data);
        if ($added === false) {
            return $this->sendError("Error During Adding Product");
        }

        $productId = $this->productModel->lastInserted();

        // 2- جهز فولدر المنتج (باسم الـ ID)
        $uploadBase = __DIR__ . '/../../public/uploads/Products/';
        $productFolder = $uploadBase . $productId . "/";
        if (!is_dir($productFolder)) {
            mkdir($productFolder, 0777, true);
        }
        $relativeFolder = '/uploads/Products/' . $productId . '/';

        // 3- رفع الصورة الرئيسية
        if (isset($_FILES['main_image_url']) && !empty($_FILES['main_image_url']['name'])) {
            $image = $_FILES['main_image_url'];
            $cleanName = basename($image['name']);
            $ext = strtolower(pathinfo($cleanName, PATHINFO_EXTENSION));
            $allowed = ['jpg','jpeg','png','gif','webp'];
            if (!in_array($ext, $allowed)) {
                return $this->sendError("Invalid main image type");
            }

            $imageName = time() . '_' . uniqid() . '.' . $ext;
            $targetPath = $productFolder . $imageName;
            $main_image_url = $relativeFolder . $imageName;

            if (move_uploaded_file($image['tmp_name'], $targetPath)) {
                // اعمل تحديث لعمود الصورة الرئيسية
                $this->productModel->updateProduct($productId, [
                    'main_image_url' => $main_image_url
                ]);
            } else {
                return $this->sendError("Failed to Upload Main Image");
            }
        }

        // 4- رفع الصور الفرعية
        if ($subImages && !empty($subImages['name'][0])) {
            $files = $subImages;
            for ($i = 0; $i < count($files['name']); $i++) {
                $cleanName = basename($files['name'][$i]);
                $ext = strtolower(pathinfo($cleanName, PATHINFO_EXTENSION));
                $allowed = ['jpg','jpeg','png','gif','webp'];
                if (!in_array($ext, $allowed)) {
                    continue;
                }

                $imageName = time() . '_' . uniqid() . '.' . $ext;
                $targetPath = $productFolder . $imageName;
                $relativePath = $relativeFolder . $imageName;

                if (move_uploaded_file($files['tmp_name'][$i], $targetPath)) {
                    $this->productSubImageModel->addSubImage($productId, $relativePath);
                }
            }
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
      $subImages = $this->productSubImageModel->getByProductId($id);
      if($Product === false){
        $this->sendError("Error During Find Product");
        return;
      }
      $Product['sub_images'] = array_map(function($img){
        return $img['sub_image_url'];
      },$subImages?: []);
      return $this->json([
        "status" => "success",
        "Product" => $Product
      ]);
    }
    public function updateProduct($id) {
        $this->requireSuperAdmin();
        $data = $_POST;

        $Product = $this->productModel->getProductById($id);
        if (!$Product) {
            $this->sendError("Product Not Found");
            return;
        }

        /*** قص الصور الفرعية من $data ***/
        $subImages = $_FILES['sub_images'] ?? null;
        unset($data['sub_images']);

        /*** تجهيز فولدر المنتج (استخدام product_id لتفادي تكرار الفولدر) ***/
        $productId = $Product['product_id'];
        $uploadBase = __DIR__ . '/../../public/uploads/Products/';
        $productFolder = $uploadBase . $productId . '/';
        if (!is_dir($productFolder)) {
            mkdir($productFolder, 0777, true);
        }
        $relativeFolder = '/uploads/Products/' . $productId . '/';

        /*** تحديث الصورة الرئيسية ***/
        if (!empty($_FILES['main_image_url']['name'])) {
            $image = $_FILES['main_image_url'];
            $cleanName = basename($image['name']);
            $ext = strtolower(pathinfo($cleanName, PATHINFO_EXTENSION));
            $allowed = ['jpg','jpeg','png','gif','webp'];

            if (!in_array($ext, $allowed)) {
                $this->sendError("Invalid main image type");
                return;
            }

            $imageName = time() . '_' . uniqid() . '.' . $ext;
            $targetPath = $productFolder . $imageName;
            $main_image_url = $relativeFolder . $imageName;

            if (move_uploaded_file($image['tmp_name'], $targetPath)) {
                // حذف القديمة من السيرفر
                if (!empty($Product['main_image_url'])) {
                    $oldPath = __DIR__ . '/../../public' . $Product['main_image_url'];
                    if (file_exists($oldPath)) unlink($oldPath);
                }
                $data['main_image_url'] = $main_image_url;
            } else {
                $this->sendError("Failed to upload new main image");
                return;
            }
        } else {
            $data['main_image_url'] = $Product['main_image_url'];
        }

        /*** تحديث بيانات المنتج ***/
        $updated = $this->productModel->updateProduct($id, $data);
        if (!$updated) {
            $this->sendError("Failed to update Product");
            return;
        }

        /*** تحديث الصور الفرعية ***/
        if (isset($_FILES['sub_images'])) {
            if (!empty($_FILES['sub_images']['name'][0])) {
                // في صور جديدة → امسح القديم (DB + Server)
                $oldSubImages = $this->productSubImageModel->getByProductId($id);
                if ($oldSubImages) {
                    foreach ($oldSubImages as $img) {
                        $oldPath = __DIR__ . '/../../public' . $img['sub_image_url'];
                        if (file_exists($oldPath)) unlink($oldPath);
                    }
                    $this->productSubImageModel->deleteByProductId($id);
                }

                // رفع الصور الجديدة
                $files = $_FILES['sub_images'];
                for ($i = 0; $i < count($files['name']); $i++) {
                    $cleanName = basename($files['name'][$i]);
                    $ext = strtolower(pathinfo($cleanName, PATHINFO_EXTENSION));
                    $allowed = ['jpg','jpeg','png','gif','webp'];
                    if (!in_array($ext, $allowed)) {
                        continue;
                    }

                    $imageName = time() . '_' . uniqid() . '.' . $ext;
                    $targetPath = $productFolder . $imageName;
                    $relativePath = $relativeFolder . $imageName;

                    if (move_uploaded_file($files['tmp_name'][$i], $targetPath)) {
                        $this->productSubImageModel->addSubImage($id, $relativePath);
                    }
                }
            } else {
                // الحقل موجود بس فاضي → امسح كل الصور الفرعية (DB + Server)
                $oldSubImages = $this->productSubImageModel->getByProductId($id);
                if ($oldSubImages) {
                    foreach ($oldSubImages as $img) {
                        $oldPath = __DIR__ . '/../../public' . $img['sub_image_url'];
                        if (file_exists($oldPath)) unlink($oldPath);
                    }
                    $this->productSubImageModel->deleteByProductId($id);
                }
            }
        }
        // else: الحقل مش موجود → سيب القديم زي ما هو

        return $this->json([
            "status" => "success",
            "message" => "Product updated successfully"
        ]);
    }
    public function deleteProduct($productId) {
        $this->requireSuperAdmin();

        // 1. Get the product
        $product = $this->productModel->getProductById($productId);
        if (!$product) {
            $this->sendError("Product Not Found");
            return;
        }

        // 2. Delete the product from the database
        $isDeleted = $this->productModel->deleteProduct($productId);
        if (!$isDeleted) {
            $this->sendError("Error During Delete Product");
            return;
        }

        // 3. Delete the main image file if it exists
        if (!empty($product['main_image_url'])) {
            $imagePath = __DIR__ . '/../../public' . $product['main_image_url'];
            if (file_exists($imagePath)) {
                unlink($imagePath);
            }
        }

        // 4. Delete all sub images (DB + server)
        $this->deleteAllSubImages($productId);

        // 5. Delete the product folder
        $productFolder = __DIR__ . '/../../public/uploads/Products/' . $productId . '/';
        if (is_dir($productFolder)) {
            $files = glob($productFolder . '*');
            foreach ($files as $file) {
                if (is_file($file)) unlink($file);
            }
            rmdir($productFolder);
        }

        return $this->json([
            "status" => "success",
            "message" => "Product deleted successfully"
        ]);
    }
    public function deleteAllSubImages($id) {
        $oldSubImages = $this->productSubImageModel->getByProductId($id);
        if ($oldSubImages) {
            foreach ($oldSubImages as $img) {
                $oldPath = __DIR__ . '/../../public' . $img['sub_image_url'];
                if (file_exists($oldPath)) {
                    unlink($oldPath);
                }
            }
            // مسح من DB
            $this->productSubImageModel->deleteByProductId($id);
        }
    }
  }
?>