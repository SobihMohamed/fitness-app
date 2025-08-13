<?php
namespace App\Models;

use App\Database\DB;
use Exception;

class Notifications {
    private $db;
    private $recipientDb;
    private $tableName = "notifications";
    private $recipientTable = "notification_recipients";

    public function __construct() {
        $this->db = new DB($this->tableName);
        $this->recipientDb = new DB($this->recipientTable);
    }

    public function create($data, $recipients) {
        try {
            if (empty($data['message_title']) || empty($data['content'])) {
                return false;
            }

            // أولاً: أضف الإشعار إلى جدول notifications
            $this->db->insert([
                'message_title' => $data['message_title'],
                'content' => $data['content'],
                'created_at' => date("Y-m-d H:i:s")
            ])->excute();

            // احصل على ID آخر إشعار تم إدخاله
            $notificationId = $this->db->getLastInsertedId();
            // var_dump($recipients);
            // ثانياً: أضف البيانات إلى جدول notification_recipients
        foreach ($recipients as $recipient) {
            $userId = isset($recipient['user_id']) && $recipient['user_id'] !== '' ? (int) $recipient['user_id'] : null;
            $adminId = isset($recipient['admin_id']) && $recipient['admin_id'] !== '' ? (int) $recipient['admin_id'] : null;

            // تجاهل السطر إذا ما فيش جهة مستلمة
            if (is_null($userId) && is_null($adminId)) {
                continue;
            }

          $recipientData = [
              'notification_id' => $notificationId,
              'user_id' => is_null($userId) ? null : (int)$userId,
              'admin_id' => is_null($adminId) ? null : (int)$adminId,
              'is_read' => false,
              'delivered_at' => date("Y-m-d H:i:s")
          ];


            $this->recipientDb->insert($recipientData)->excute();
        }


            return true;

        } catch (Exception $e) {
            return false;
        }
    }

    public function getAll() {
        try {
            return $this->db->select()->fetchAll();
        } catch (Exception $e) {
            return false;
        }
    }

    public function getAllForUser($userId) {
    try {
        return $this->recipientDb
            ->select("n.notification_id, n.message_title, n.content, is_read, delivered_at")
            ->join(
                S_Table: "notifications",          // جدول التوصيل
                C_F_Table: "notification_id",      // العمود في الجدول الأساسي (recipient)
                C_S_Table: "notification_id",      // العمود في جدول notifications
                Alias_STable: "n"                  // alias لجدول notifications
            )
            ->where("user_id", "=", $userId) // العمود في alias بتاع جدول recipient
            ->fetchAll();
    } catch (Exception $e) {
        return false;
    }
}


  public function getAllForAdmin($adminId) {
    try {
        return $this->recipientDb
            ->select("n.notification_id, n.message_title, n.content, is_read, delivered_at")
            ->join(S_Table: "notifications", C_F_Table: "notification_id", C_S_Table: "notification_id", Alias_STable: "n")
            ->where(coulmn: "admin_id", operator: "=", value: $adminId)
            ->fetchAll();
    } catch (Exception $e) {
        return false;
    }
}

  public function markAsRead($notificationId, $userId = null, $adminId = null) {
      try {
          // لازم يكون واحد من الاتنين موجود
          if (!$userId && !$adminId) {
              return false;
          }

          // نبني شرط التحديث
          if ($userId != null) {
            $this->recipientDb->update(['is_read' => 1])
                      ->where('notification_id', '=', $notificationId)
                      ->andWhere('user_id', '=', $userId)
                      ->excute();
          } elseif ($adminId != null) {
            $this->recipientDb->update(['is_read' => 1])
                      ->where('notification_id', '=', $notificationId)
                      ->andWhere('admin_id', '=', $adminId)
                      ->excute();
          }

          return true;
      } catch (Exception $e) {
          return false;
      }
  }


    public function delete($id) {
        try {
          $this->recipientDb
            ->delete()
            ->where('notification_id', '=', $id)
            ->excute();

          $this->db->delete()
          ->where('notification_id', '=', $id)
          ->excute();
        } catch (Exception $e) {
            return false;
        }
    }
}
