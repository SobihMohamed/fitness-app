<?php
namespace App\Controllers;
use App\Core\AbstractController;
use App\models\User;

class UserController extends AbstractController{
  protected $userModel;

  public function __construct(){
      parent::__construct();
      $this->userModel = new User();
  }

  public function getProfile(){
    // $this->requireLogin();

    $decode = $this->getUserFromToken();
    $id = $decode['id'];
    $user = $this->userModel
            ->getUserInfoById($id);
    if(!$user){
      $this->sendError("User Not Found",404);
    }
    // unset($user['password']);
    $this->json([
        "status" => "success",
        "user" => $user
    ]);
  }
  public function updateProfile(){
    // $this->requireLogin();

    $data = json_decode(file_get_contents("php://input"),true);
    // $allowFields = ['name','phone','address','gender'];
    if (!$data || !is_array($data)) {
      return $this->sendError("Invalid data", 422);
    }
    $decoded = $this->getUserFromToken();
    $email = $decoded['email'];
    if (!$email) {
      return $this->sendError("Unauthorized", 401);
    }

    $isUpdated = $this ->userModel
                        ->updateUserInfoByEmail($email,$data);
    if($isUpdated){
      $newUser = $this->userModel->getUserInfoByEmail($email);
      unset($newUser['password']);
      return $this->json([
        "status" => "success",
        "message" => "updated Successfully",
        "user" => $newUser
      ]);
    }
    return $this->sendError("Error While Updating Data",400);
  }
}
?>