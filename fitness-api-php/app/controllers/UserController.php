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
  public function getProfileInfo(){
    $this->requireLogin();

    $email = $_SESSION['user']['email'];
    $user = $this->userModel
            ->getUserInfoByEmail($email);
    if(!$user){
      $this->sendError("User Not Found",404);
    }
    
    unset($user['password']);
    $this->json([
        "status" => "success",
        "user" => $user
    ]);
  }
  public function updateProfile(){
    $this->requireLogin();

    $data = json_decode(file_get_contents("php://input"),true);
    $email = $_SESSION['user']['email'];
    // ? data based on DB
  }
}
?>