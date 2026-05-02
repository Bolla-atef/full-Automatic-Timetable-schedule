// ============================================================
//  collegeConfig.js
//  لإضافة كلية جديدة: أضف object جديد في الـ array بالأسفل فقط
//  حط صور اللوجو في: public/colleges/<college-id>/
// ============================================================

export const COLLEGES = [
 
  {
    id: "ComputerScience",
    name: "Faculty of ComputerScience",
    logoLeft:  "/colleges/ComputerScience/logo-left.jpg",
    logoRight: "/colleges/ComputerScience/logo-right.jpg",
    signature: "Prof.Dr / Shreef Elatabey",
  },

  {
    id: "engineering",
    name: "Faculty of Engineering",
    logoLeft:  "/colleges/engineering/logo-left.jpg",
    logoRight: "/colleges/engineering/logo-right.jpg",
    signature: "Prof.Dr / Dean of Faculty of Engineering",
  },
  {
    id: "Media_and_Communication_Arts",
    name: "Faculty of Media and Communication Arts",
    logoLeft:  "/colleges/Media/logo-left.jpg",
    logoRight: "/colleges/Media/logo-right.jpg",
    signature: "Prof.Dr / Dean of Faculty of Media and Communication Arts",
  },

  {
    id: "Business_Administration",
    name: "Faculty of Business Administration",
    logoLeft:  "/colleges/Business/logo-left.jpg",
    logoRight: "/colleges/Business/logo-right.jpg",
    signature: "Prof.Dr / Dean of Faculty of Business Administration",
  },
  {
    id: "Politics_and_Economics",
    name: "Faculty of Politics and Economics",
    logoLeft:  "/colleges/Economy/logo-left.jpg",
    logoRight: "/colleges/Economy/logo-right.jpg",
    signature: "Prof.Dr / Dean of Faculty of Politics and Economics",
  },

   {
    id: "Languages_and_Translation",
    name: "Faculty of Languages ​​and Translation",
    logoLeft:  "/colleges/Languages/logo-left.jpg",
    logoRight: "/colleges/Languages/logo-right.jpg",
    signature: "Prof.Dr / Dean of Faculty of Languages and Translation",
  },

{
    id: "social_service",
    name: "Faculty of socialService",
    logoLeft:  "/colleges/socialService/logo-left.jpg",
    logoRight: "/colleges/socialService/logo-right.jpg",
    signature: "Prof.Dr / Dean of Faculty of Social Service",
  },

];

// ── Helpers ──────────────────────────────────────────────────

/** اجيب بيانات الكلية المختارة من localStorage */
export const getSelectedCollege = () => {
  const id = localStorage.getItem("selectedCollege");
  return COLLEGES.find((c) => c.id === id) || COLLEGES[0];
};

/** احفظ اختيار الكلية */
export const saveSelectedCollege = (collegeId) => {
  localStorage.setItem("selectedCollege", collegeId);
};