<?php
namespace App\Database;
use App\Database\Connection;

interface dbContract{
  public function insert($data);
  public function select($columns="*");
  public function update($data);
  public function delete();
  public function where($coulmn,$operator,$value);
  public function getRow();
  public function excute();
  public function fetchAll();
}

class DB implements dbContract{
  private $table;
  private $sql;
  public $conn;
  
  public function __construct($table){
    $this->table=$table;
    $this->conn = Connection::getInstance();
  }
  public function insert($data){
    $columns="";
    $values="";
    foreach ($data as $key => $value) {
      $columns.="`$key`,";
      $values.="'$value',";
    }
    // ? remove the last , exist
    $columns = rtrim($columns,",");
    $values = rtrim($values,",");
    $this->sql="INSERT INTO `$this->table` ($columns) VALUES ($values)";
    // ? return this to make the excution
    // echo "<pre>$this->sql</pre>";
    return $this;
  }
  public function select($columns="*"){
    $this->sql = "SELECT $columns FROM $this->table ";
    // ? return this to make the excution
    return $this;
  }
  public function join($S_Table,$C_F_Table,$C_S_Table,$Alias_STable=""){
    if(!empty($Alias_STable)){
      $this->sql .= " JOIN $S_Table AS $Alias_STable ON
      $this->table.$C_F_Table =
      $Alias_STable.$C_S_Table
      ";
    }else{
        $this->sql .= " JOIN $S_Table ON
      $this->table.$C_F_Table =
      $S_Table.$C_S_Table
      ";
    }
    return $this;
  } 
  public function orderBy($col_in_firstTable){
    $this->sql .= " ORDER BY 
                  $this->table.$col_in_firstTable
                  DESC
                  ";
    return $this;
  }
  public function update($data){
    $rows = "";
    foreach ($data as $key => $value) {
      if(is_int($value)){
        $rows.="$key = $value,";
      }else{
        $safeValue = addslashes($value);
        $rows.="$key = '$safeValue',";
      }
    }
    $rows = rtrim($rows,",");
    // echo "<pre>";
    // print_r($rows);
    // echo "</pre>";
    $this->sql="UPDATE $this->table SET $rows";
    // // ? return this to make the excution
    return $this;
  }
  public function delete(){
    $this->sql = "DELETE FROM $this->table";
    // ? to complete condition
    return $this;
  }
  public function where($coulmn,$operator,$value,$Alias=""){
    if($Alias===""){
      $this->sql .=" WHERE $coulmn $operator '$value'";
      return $this;
    }
    $this->sql .=" WHERE $Alias.$coulmn $operator '$value'";
    return $this;
  }
  public function andWhere($coulmn,$operator,$value){
    $this->sql .=" AND $coulmn $operator '$value'";
    return $this;
  }
    public function orWhere($coulmn,$operator,$value){
    $this->sql .=" OR $coulmn $operator '$value'";
    return $this;
  }
  public function excute(){
    // echo "<br/>".$this->sql."<br/>";
    if(!mysqli_query($this->conn,$this->sql)){
      die("Failed to excute the query" . mysqli_error($this->conn));
    };
  }
  public function getRow(){
    $query = mysqli_query($this->conn,$this->sql);
    return mysqli_fetch_assoc($query);
  }
  public function fetchAll(){
    // echo "<pre>$this->sql</pre>";
    $query = mysqli_query($this->conn,$this->sql);
    return mysqli_fetch_all($query,MYSQLI_ASSOC);
  }
  public function getSql()
  {
      return $this->sql;
  }

}
?>
