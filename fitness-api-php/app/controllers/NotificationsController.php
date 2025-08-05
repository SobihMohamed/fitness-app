<?php
namespace App\Controllers;

use App\Core\AbstractController;
use App\models\Notifications;

class NotificationsController extends AbstractController {
    protected $notifModel;

    public function __construct() {
        parent::__construct();
        $this->notifModel = new Notifications();
    }

    // GET /user/notifications
    public function getNotificationForUser() {
        $user = $this->getUserFromToken();
        $notifications = $this->notifModel->getAllForUser($user['id']);
        return $this->json([
            'status' => 'success',
            'data'=>    $notifications
        ]);
    }

    // put mark as read notification
    public function readNotification($notiId){
      $user = $this->getUserFromToken();
      $ok = $this->notifModel->markAsRead($notiId,$user['id']);
      if (!$ok) {
          return $this->sendError("Cannot mark as readed", 500);
      }
      return $this->json([
          'status' => 'success',
          'message' => 'Notification Marks As Readed'
      ]);
    }

    // DELETE notifications/{id}
    public function delete($id) {
        $ok = $this->notifModel->delete($id);
        if (!$ok) {
            return $this->sendError("Cannot delete", 500);
        }
        return $this->json([
            'status' => 'success',
            'message' => 'Notification deleted'
        ]);
    }
  }
?>