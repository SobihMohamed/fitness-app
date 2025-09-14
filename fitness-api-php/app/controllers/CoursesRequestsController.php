<?php
namespace App\Controllers;
use App\Core\AbstractController;
use App\models\CoursesRequest;
use App\models\Courses;
use App\Helpers\NotifyHelper;
class CoursesRequestsController extends AbstractController {
  protected $reqModel;

  public function __construct(){
    parent::__construct();
    $this->reqModel = new CoursesRequest();
  }

   // POST /user/requests  (submit new) required user_id in hidden and all data
  public function create(){
    $user = $this->getUserFromToken();
    if ($_SERVER['REQUEST_METHOD']!=='POST')
      return $this->sendError("Invalid",405);

    $data = json_decode(file_get_contents("php://input"), true);
    $data['user_id'] = $user['id'];

// تأكد أن course_id مرسل
    if (empty($data['course_id']))
        return $this->sendError("Course ID is required", 400);

    // احضر بيانات الكورس من جدول الكورسات للتأكد من وجوده
    $courseModel = new Courses();
    $course = $courseModel->getCourseById($data['course_id']);
    if (!$course)
        return $this->sendError("Course not found", 404);

    $ok = $this->reqModel->create($data);
    if (!$ok) 
      return $this->sendError("Cannot submit request",500);

    // إشعار لكل الأدمنات
    NotifyHelper::pushToAllAdmins(
        "طلب اشتراك في كورس جديد",
        "قام المستخدم {$user['email']} بطلب الاشتراك في الكورس: {$course['title']} (ID: {$data['course_id']})"
    );

    // إشعار للمستخدم
    NotifyHelper::pushToSpecificUser(
        $data['user_id'],
        "تم استلام طلبك",
        "تم استلام طلب الاشتراك في الكورس بنجاح، وسيتم مراجعته قريبًا."
    );
                                
    return $this->json(["status"=>"success","message"=>"Request submitted"]);
  }
  //get requests sent
  public function getMyRequests(){
    $user = $this->getUserFromToken();
    $requests = $this->reqModel->getRequestsByUserId($user['id']);
    if(!$requests || $requests === false){
      $this->sendError("No Requests Found" ,404 );
      return;
    }
      return $this->json(["status"=>"success","data"=>$requests]);
  }
}
?>