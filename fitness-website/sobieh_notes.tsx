
// import React, { useState, useEffect } from "react";

// const EditProfileForm = () => {
//   const [formData, setFormData] = useState({
//     name: "",
//     phone: "",
//     address: "",
//     gender: "",
//     dob: "",
//     country: ""
//   });

//   const [message, setMessage] = useState("");

//   //  استرجاع البيانات الحالية من السيرفر عند أول تحميل دي بردك هتستخدمها اول ما يفتح ال profile
//   useEffect(() => {
//     fetch("http://localhost:8000/user/getProfileInfo", {
//       credentials: "include", //مهم يا جوووووووووووووووووووووووووووووووووو 
//     })
//       .then((res) => res.json())
//       .then((data) => {
//         if (data.status === "success") {
//           setFormData(data.user);
//         }
//       });
//   }, []);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     const response = await fetch("http://localhost:8000/user/updateProfile", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       credentials: "include", //مهم يا جوووووووووووووووووووووووووووووووووو 
//       body: JSON.stringify(formData),
//     });

//     const result = await response.json();

//     if (result.status === "success") {
//       setMessage("Profile updated successfully ✅");
//     } else {
//       setMessage("❌ Error: " + result.message);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="form">
//       <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" />
//       <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" />
//       <input name="address" value={formData.address} onChange={handleChange} placeholder="Address" />
//       <select name="gender" value={formData.gender} onChange={handleChange}>
//         <option value="">Select Gender</option>
//         <option value="male">Male</option>
//         <option value="female">Female</option>
//       </select>
//       <input name="dob" type="date" value={formData.dob} onChange={handleChange} placeholder="Date of Birth" />
//       <input name="country" value={formData.country} onChange={handleChange} placeholder="Country" />
//       <button type="submit">Update</button>
//       {message && <p>{message}</p>}
//     </form>
//   );
// };

// export default EditProfileForm;



// // دا مثال  يا باشمهندسين علي المفروض يحصل في أي صفحه هتبعت داتا لل backend
// // هنا بنمثل صفحه ال user وهو عاوز يعمل update 
// // هتلاقم useeffect 
// // بتطلب من الباك البيانات أصلا الموجوده بتاعت ال user
// // عشان تبدأ تظهرهاله ك initial value عشان يبدا يغير فيهم من الفورم
// // وبعد ميدوس submit هندخل علي function handel 
// // اللي بتتكلم مع الباك دايركت يا شباب 
// // فدا مثال لاي كوود مفروض يعدل بيانات 
// // كله هيبقا نفس الفكرة لوفهمتم اللي بيحصل هنا هتفهمو كل اللي جي 

// // *حط الكود علي vs عشان تفهمه كويس*🖤