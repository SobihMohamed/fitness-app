<?php
namespace App\Controllers;
use App\Core\AbstractController;
use App\models\User;
use Exception;
use PHPMailer\PHPMailer\PHPMailer;
require_once __DIR__ . '/../../vendor/autoload.php';

class AuthController extends AbstractController{
  protected $userModel;
  public function __construct(){
    parent::__construct(); // to put the headers
    $this->userModel = new User();
  }
  public function register(){
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            return $this->sendError("Method Not Allowed", 405);
        }
    //? get all data in body of request
    $data = json_decode(file_get_contents("php://input"),true);
    file_put_contents("debug.txt", json_encode($data)); // Debug
    if(empty($data['email']) || empty($data['name']) || empty($data['password']) ){
      return $this->sendError("All Fields are required" , 422);
    }
    // Normalize email
    $data['email'] = strtolower($data['email']);

    $isExist =  $this->userModel
                ->getUserInfoByEmail($data['email']);
    if($isExist){
      return $this->sendError("Email Already Exist",409);
    }

    $regesterSuccess = $this->userModel
                ->register($data);
    if(!$regesterSuccess){
      return $this->sendError("Error During Register",500);
    }

    $this->json([
      "message"=>'User Registered Successfully',
      "status"=>"success"
    ],201);
  }
  public function login(){
    $data = json_decode(file_get_contents("php://input"),true);
    if(empty($data['email']) || empty($data['password']) ){
      return $this->sendError("All Fields are required" , 422);
    }
    $isExist =  $this->userModel
                ->getUserInfoByEmail($data['email']);
    if(!$isExist){
      return $this->sendError("Email Not Exist ",422);
    }
    // ? return user 
    $user= $this->userModel
                  ->login($data['email'],$data['password']);
    if(!$user){
      return $this->sendError("Incorrect Email or Password",401);
    }
    $this->json([
      "message"=> "user Login Successfully",
      "user"=>$user,
      "status"=>"success"
    ]);
  }
  public function logout(){
    $isLoggedout = $this->userModel
                ->logout();
    if(!$isLoggedout){
      return $this->sendError("Error During Logout",500);
    }
    $this->json([
      "message"=>"loggedOut Success",
      "status"=>"success"
    ]);
  }
  // after enter email to send otp
  public function forgetPassword(){
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
      return $this->sendError("Method Not Allowed From Not Post Request", 405);
    }
    header("Content-Type: application/json");
    //? get all data in body of request
    $data = json_decode(file_get_contents("php://input"),true);
    if(!isset($data['email'])){
      return $this->sendError("Email is Required",400);
    }

    $user = $this->userModel
            ->getUserInfoByEmail($data['email']);
    if(!$user){
      return $this->sendError("User Not Found",404);
    }
    // بعد  ما أتأكدت ان الايميل موجود هعمل الكود اللي يتعبت علي ايميله بعد كدا
  
    $otp = rand(100000,999999);
    $this ->userModel
          ->saveOtp($data['email'],$otp);
    //! خطوات ارسال الكود لل الايميل 
    $mail = new PHPMailer(true);
    try{
      $mail->isSMTP();
      $mail->Host='smtp.gmail.com';
      $mail->SMTPAuth=true;
      $mail->Username='sobihmohamedsobih@gmail.com';
      $mail->Password='dpxctdbonnagdprc';
      $mail->SMTPSecure = 'tls';
      $mail->Port = 587;
      $mail->setFrom('sobihmohamedsobih@gmail.com', 'Gym OTP Sender'); 
      $mail->addAddress($data['email']);                 
      $mail->Subject = 'Reset Your Password - OTP';
      $mail->Body    = "Hello,\nYour OTP code is: $otp\n.";
      $mail->send();

      $this->json([
        "status" => "success",
        "message" => "OTP sent ot your email",
        // "otp"=>$otp // مؤقت هيتشال
      ],200);
    }catch(Exception $e){
      return $this->sendError("Email could not be sent. Mailer Error: {$mail->ErrorInfo}", 500);
    }
  }
  // after enter the otp and new password
  public function verifyOtpAndUpdatePassword(){
    if($_SERVER["REQUEST_METHOD"] !== "POST"){
      return $this->sendError("Method Not Allowed From Not Post Request", 405);
    }
    // get all data 
    $data = json_decode(file_get_contents("php://input"),true);
    if(empty($data['email']) || empty($data['otp']) || empty($data['newPassword']) ){
      return $this->sendError("All field are required", 422);
    }
    $isValid = $this->userModel
                    ->verifyOtp($data['email'],$data['otp']);
    if(!$isValid){
      return $this->sendError("Incorrect OTP", 422);
    }
    $isupdated = $this -> userModel
          ->updatePassword($data['email'],$data['newPassword']);
    if(!$isupdated){
      return $this->sendError("Error During Update Password", 500);
    }
    // الغي ال session 
    unset($_SESSION['otp'][$data['email']]);

    $this->json([
      "status" => "success",
      "message" => "password Updated Successfully"
    ]);
  }
}

?>