import { useState, useEffect, Fragment, useMemo, useRef } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import {
  Input,
  Option,
  Select,
  Button,
  Dialog,
  IconButton,
  Typography,
  DialogBody,
  DialogHeader,
  DialogFooter,
} from "@material-tailwind/react";
import {
  XMarkIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Slidebar from "../Slidebar/Slidebar";
import LoadingAnimation from "../Loading/Loading";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import imgLOGO from "../../assets/imagelogo.jpeg";
import {
  getDepartments,
  addDepartment,
  deleteDepartment,
  getYearLabel,
  buildReverseYearMap,
} from "../config/departmentsConfig";

const GetCourses = () => {

  // ── College & Departments ─────────────────────────────────
  const collegeId = localStorage.getItem("selectedCollege") || "ComputerScience";
  const [departments, setDepartments] = useState(() => getDepartments(collegeId));
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [newDeptName, setNewDeptName] = useState("");
  const [newDeptYears, setNewDeptYears] = useState("4");
  const [newDeptStartYear, setNewDeptStartYear] = useState("1");

  // Dynamic getYearLabel using selected college
  const yearLabel = (year) => getYearLabel(year, collegeId);

  // تحديث التخصصات لو الكلية اتغيرت
  useEffect(() => {
    setDepartments(getDepartments(collegeId));
  }, [collegeId]);
  // States
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [fixedValues, setFixedValues] = useState({});
  const [editCourses, setEditCourses] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedYear, setSelectedYear] = useState(null);
  const [editNameModalOpen, setEditNameModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [newName, setNewName] = useState("");
  const [editGrops, setEditGrops] = useState("");
  const [editGropLap, setEditGropLap] = useState("");
  const [editEnrollment, setEditEnrollment] = useState("");
  const [yearsList, setYearsList] = useState([]);

  // ── Shared Group Code (Link Courses) ─────────────────────────
  const [linkCourseId, setLinkCourseId] = useState(null);   // الـ ID بتاع المادة اللي هتتربط بيها

  // ── Excel Upload ──────────────────────────────────────────────
  const excelInputRef = useRef(null);
  const [excelModalOpen, setExcelModalOpen] = useState(false);
  const [excelYear, setExcelYear] = useState("");
  const [excelGrops, setExcelGrops] = useState("1");
  const [excelGropLap, setExcelGropLap] = useState("1");
  const [excelEnrollment, setExcelEnrollment] = useState("100");
  const [excelUploading, setExcelUploading] = useState(false);
  const [excelSemester, setExcelSemester] = useState("1");
  const [deleteAllModalOpen, setDeleteAllModalOpen] = useState(false);
const [staffDialogOpen, setStaffDialogOpen] = useState(false);
const [staffType, setStaffType] = useState(""); // "professors" or "teachingAssistants"
const [staffList, setStaffList] = useState([]);
const [selectedCourseName, setSelectedCourseName] = useState("");
const [coursesDetails, setCoursesDetails] = useState({});

  const queryClient = useQueryClient();

  const [course, setCourse] = useState({
    name: "",
    grops: "",
    grop_lap: "",
    year: "",
    enrollment: "",
  });

  // Each course has independent values — no year-level locking
  const isYearOccupied = false;

  // Fetch courses data
  const {
    data: courses = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const token = localStorage.getItem("userToken");
      if (!token) throw new Error("Token not found");

      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/Courses`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return data;
    },
  });

  // Update years list and fixed values when courses change
  useEffect(() => {
    if (courses.length > 0) {
      // Extract unique years from courses
      const existingYears = [...new Set(courses.map((c) => c.year))].sort(
        (a, b) => a - b
      );

      // Calculate next available year
      const nextYear =
        existingYears.length > 0 ? Math.max(...existingYears) + 1 : 1;

      // Update years list (existing years + next available year)
      setYearsList([...existingYears, nextYear]);

      // Update fixed values
      const values = {};
      courses.forEach((course) => {
        if (!values[course.year]) {
          values[course.year] = {
            enrollment: course.enrollment,
            grops: course.grops,
            grop_lap: course.grop_lap,
          };
        }
      });
      setFixedValues(values);
    } else {
      // If no courses, set initial year
      setYearsList([1]);
      setFixedValues({});
    }
  }, [courses]);

  useEffect(() => {
  const fetchCourseDetails = async () => {
    const token = localStorage.getItem("userToken");
    const headers = { Authorization: `Bearer ${token}` };
    const detailsMap = {};

    await Promise.all(
      courses.map(async (course) => {
        try {
          const { data } = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/Courses/${course.id}`,
            { headers }
          );
          detailsMap[course.id] = {
            professors: data.professors || [],
            teachingAssistants: data.teachingAssistants || [],
          };
        } catch (e) {
          detailsMap[course.id] = {
            professors: [],
            teachingAssistants: [],
          };
        }
      })
    );

    setCoursesDetails(detailsMap);
  };

  if (courses.length > 0) {
    fetchCourseDetails();
  }
}, [courses]);

const getCourseById = async (id) => {
  const token = localStorage.getItem("userToken");
  const { data } = await axios.get(
    `${import.meta.env.VITE_API_URL}/api/Courses/${id}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return data;
};

  // Helper functions
  const resetForm = () => {
    setCourse({
      name: "",
      grops: "",
      grop_lap: "",
      year: "",
      enrollment: "",
    });
    setIsEdit(false);
    setEditCourses(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (["grops", "grop_lap", "year", "enrollment"].includes(name)) {
      if (!/^\d*$/.test(value)) return;
    }
    setCourse((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpen = () => {
    if (!open) {
      if (isEdit) {
        setCourse({
          ...editCourses,
          year: editCourses.year.toString(),
          grops: editCourses.grops.toString(),
          grop_lap: editCourses.grop_lap.toString(),
          enrollment: editCourses.enrollment.toString(),
        });
      } else {
        setCourse((prev) => ({
          ...prev,
          year: prev.year || "",
        }));
      }
    }
    setOpen(!open);
  };

  // Mutations
  const mutation = useMutation({
    mutationFn: async (payload) => {
      const token = localStorage.getItem("userToken");
      const url = isEdit
        ? `${import.meta.env.VITE_API_URL}/api/Courses/${editCourses.id}`
        : `${import.meta.env.VITE_API_URL}/api/Courses`;

      const method = isEdit ? axios.put : axios.post;

      const { data } = await method(url, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["courses"]);
      toast.success(isEdit ? "Update Successfully" : "Add Courses Successfully");
      resetForm();
      handleOpen();
    },
    onError: (error) => {
      toast.error(
        `❌ حدث خطأ: ${error.response?.data?.message || "يرجى المحاولة لاحقًا"}`
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const token = localStorage.getItem("userToken");
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/Courses/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["courses"]);
      toast.success("Delete Successfully");
    },
    onError: (error) => {
      toast.error(`❌Deletion failed: ${error.response?.data?.message}`);
    },
  });

  const updateNameMutation = useMutation({
    mutationFn: async ({ id, newName, grops, grop_lap, enrollment, sharedGroupCode }) => {
      const token = localStorage.getItem("userToken");
      if (!token) throw new Error("No authentication token found");

      const cachedCourses = queryClient.getQueryData(["courses"]) || [];
      const currentCourse = cachedCourses.find((c) => c.id === id);
      if (!currentCourse) throw new Error("المادة غير موجودة");

      const payload = {
        name: newName,
        year: currentCourse.year,
        grops: parseInt(grops) || currentCourse.grops,
        grop_lap: parseInt(grop_lap) || currentCourse.grop_lap,
        enrollment: parseInt(enrollment) || currentCourse.enrollment,
        sharedGroupCode: linkCourseId ? sharedGroupCode : null,

      };

      const { data } = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/Courses/${id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // لو اختار مادة يربطها بيها → حدّث المادة التانية كمان بنفس الـ SharedGroupCode
      if (sharedGroupCode) {
        const linkedCourse = cachedCourses.find((c) => c.id === parseInt(linkCourseId));
        if (linkedCourse) {
          await axios.put(
            `${import.meta.env.VITE_API_URL}/api/Courses/${linkedCourse.id}`,
            { ...linkedCourse, sharedGroupCode },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["courses"]);
      toast.success("Course updated successfully");
      setEditNameModalOpen(false);
      setNewName("");
      setEditGrops("");
      setEditGropLap("");
      setEditEnrollment("");
      setEditingCourse(null);
      setLinkCourseId(null);
    },
    onError: (error) => {
      toast.error(`❌Update failed: ${error.message}`);
    },
  });
  const handleProceedEdit = () => {
    if (!selectedYear) return;

    const yearCourses = courses.filter(
      (c) => c.year === parseInt(selectedYear)
    );
    if (yearCourses.length === 0) return;

    const sampleCourse = yearCourses[0];
    setIsEdit(true);
    setEditCourses(sampleCourse);
    setCourse({
      name: "", // نترك اسم المادة فارغ لأنه سيتم تطبيقه على كل المواد
      grops: sampleCourse.grops.toString(),
      grop_lap: sampleCourse.grop_lap.toString(),
      year: selectedYear.toString(),
      enrollment: sampleCourse.enrollment.toString(),
    });
    setOpen(true);
    setShowEditModal(false);
  };
  // Handlers
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("userToken");
      const payload = {
        grops: parseInt(course.grops, 10),
        grop_lap: parseInt(course.grop_lap, 10),
        enrollment: parseInt(course.enrollment, 10),
        year: parseInt(course.year, 10),
      };

      if (isEdit) {
        // 1. الحصول على جميع المواد في السنة المختارة
        const originalYear = editCourses.year;
        const coursesToUpdate = courses.filter((c) => c.year === originalYear);

        // 2. تحديث كل مادة في السنة بنفس الإعدادات
        await Promise.all(
          coursesToUpdate.map(async (c) => {
            await axios.put(
              `${import.meta.env.VITE_API_URL}/api/Courses/${c.id}`,
              {
                ...c,
                ...payload,
                name: c.name, // نحافظ على الاسم الأصلي لكل مادة
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          })
        );

        // 3. تحديث القيم الثابتة للسنة
        setFixedValues((prev) => ({
          ...prev,
          [payload.year]: {
            grops: payload.grops,
            grop_lap: payload.grop_lap,
            enrollment: payload.enrollment,
          },
        }));

        toast.success("successfully updated for all courses.");
      } else {
        // كود الإضافة العادي
        if (!fixedValues[course.year]) {
          setFixedValues((prev) => ({
            ...prev,
            [course.year]: {
              grops: payload.grops,
              grop_lap: payload.grop_lap,
              enrollment: payload.enrollment,
            },
          }));
        }

        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/Courses`,
          { ...payload, name: course.name.trim() },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Successfully added courses");
      }

      await queryClient.invalidateQueries(["courses"]);
      resetForm();
      handleOpen();
    } catch (error) {
      toast.error(
        `❌ An error ${error.response?.data?.message || "Please try again later"}`
      );
    }
  };
const handleViewStaff = async (courseId, type) => {
  try {
    const data = await getCourseById(courseId);
    setStaffList(data[type]);
    setStaffType(type);
    setSelectedCourseName(data.name);
    setStaffDialogOpen(true);
  } catch (err) {
    toast.error("Failed to load Course data");
  }
};

  const handleEditConfirmation = (year) => {
    setSelectedYear(year);
    setShowEditModal(true);
  };

  const handleAddNewYear = () => {
    const nextYear = yearsList[yearsList.length - 1];
    setCourse({
      year: String(nextYear),
      grops: "3",
      grop_lap: "1",
      enrollment: "100",
      name: "",
    });
    setOpen(true);
  };

  // ── Excel Upload Handler ──────────────────────────────────────
  const handleExcelUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExcelUploading(true);
    const token = localStorage.getItem("userToken");

    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

      const reverseMap = buildReverseYearMap(collegeId);

      const entries = rows
        .map((r) => ({
          deptYear: r[0] ? String(r[0]).trim().toLowerCase() : "",
          name: r[1] ? String(r[1]).trim() : "",
          semester: r[2] !== undefined && r[2] !== null ? String(r[2]).trim() : "",
        }))
        .filter((r) => r.name && /^[a-z_]+-\d+$/.test(r.deptYear))
        .filter((r) => r.semester === excelSemester);

      if (entries.length === 0) {
        toast.error("مفيش بيانات صحيحة في الملف — تأكد من الفورمات وأرقام الـ Semester");
        setExcelUploading(false);
        e.target.value = "";
        return;
      }

      const unknownKeys = [...new Set(entries.map((en) => en.deptYear))].filter(
        (k) => !reverseMap[k]
      );
      if (unknownKeys.length > 0) {
        toast.error(`تخصصات مش معروفة: ${unknownKeys.join(", ")}`);
        setExcelUploading(false);
        e.target.value = "";
        return;
      }

      let added = 0;
      let failed = 0;

      for (const entry of entries) {
        const seqYear = reverseMap[entry.deptYear];
        try {
          await axios.post(
            `${import.meta.env.VITE_API_URL}/api/Courses`,
            {
              name: entry.name,
              year: seqYear,
              grops: parseInt(excelGrops) || 1,
              grop_lap: parseInt(excelGropLap) || 1,
              enrollment: parseInt(excelEnrollment) || 100,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          added++;
        } catch {
          failed++;
        }
      }

      await queryClient.invalidateQueries(["courses"]);
      toast.success(`✅ Added ${added} Course ${failed > 0 ? ` (${failed} Faild)` : ""}`);
      setExcelModalOpen(false);
      e.target.value = "";
    } catch (err) {
      toast.error("❌ File reading failed");
    } finally {
      setExcelUploading(false);
    }
  };

  // ── Delete All Courses Handler ────────────────────────────────
  const handleDeleteAllCourses = async () => {
    setDeleteAllModalOpen(false);
    const token = localStorage.getItem("userToken");
    const currentCourses = queryClient.getQueryData(["courses"]) || [];
    let deleted = 0;
    for (const course of currentCourses) {
      try {
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/api/Courses/${course.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        deleted++;
      } catch {
        // كمل حتى لو مادة واحدة فشلت
      }
    }
    await queryClient.invalidateQueries(["courses"]);
    toast.success(`🗑️ Removed ${deleted} Course `);
  };

  // ── Department Handlers ───────────────────────────────────
  const handleAddDepartment = () => {
    if (!newDeptName.trim()) return;
    const updated = addDepartment(collegeId, newDeptName.trim(), newDeptYears, newDeptStartYear);
    setDepartments(updated);
    setNewDeptName("");
    setNewDeptYears("4");
    setNewDeptStartYear("1");
    toast.success(`Department "${newDeptName}" added`);
  };

  const handleDeleteDepartment = (deptId, deptName) => {
    const updated = deleteDepartment(collegeId, deptId);
    setDepartments(updated);
    toast.success(`Department "${deptName}" removed`);
  };

  // Filter courses based on search
  const filteredCourses = useMemo(() => {
    return courses.filter((c) =>
      c.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [courses, search]);

  // Group courses by year
  const coursesByYear = useMemo(() => {
    return filteredCourses.reduce((acc, course) => {
      const year = course.year;
      if (!acc[year]) {
        acc[year] = {
          courses: [],
          fixed: fixedValues[year] || {},
        };
      }
      acc[year].courses.push(course);
      return acc;
    }, {});
  }, [filteredCourses, fixedValues]);

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={true}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      {/* ── Manage Departments Modal ── */}
      {deptModalOpen && (
        <div className="fixed z-50 inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-700">
              <h2 className="text-white font-bold text-lg">Manage Departments</h2>
              <button onClick={() => setDeptModalOpen(false)} className="text-gray-400 hover:text-white">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Current Departments */}
            <div className="p-5">
              <p className="text-gray-400 text-sm mb-3">Current Departments</p>
              {departments.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No departments yet</p>
              ) : (
                <div className="space-y-2 mb-5 max-h-48 overflow-y-auto">
                  {departments.map((dept) => (
                    <div key={dept.id} className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-2">
                      <div>
                        <span className="text-white font-medium">{dept.name}</span>
                        <span className="text-gray-400 text-sm ml-2">({dept.years} years</span>
                        {(dept.startYear || 1) > 1 && (
                          <span className="text-cyan-400 text-sm">, starts Y{dept.startYear}</span>
                        )}
                        <span className="text-gray-400 text-sm">)</span>
                      </div>
                      <button
                        onClick={() => handleDeleteDepartment(dept.id, dept.name)}
                        className="text-red-400 hover:text-red-300 ml-2"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Department */}
              <div className="border-t border-gray-700 pt-4">
                <p className="text-gray-400 text-sm mb-3">Add New Department</p>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Department name (e.g. CS)"
                    value={newDeptName}
                    onChange={(e) => setNewDeptName(e.target.value)}
                    className="flex-1 bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                  />
                  <input
                    type="number"
                    placeholder="Years"
                    min="1"
                    max="10"
                    value={newDeptYears}
                    onChange={(e) => setNewDeptYears(e.target.value)}
                    className="w-20 bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                  />
                  <input
                    type="number"
                    placeholder="Start Y"
                    min="1"
                    max="10"
                    title= "The year in which the specialization begins (for example, 2 if there is a General year before it)"
                    value={newDeptStartYear}
                    onChange={(e) => setNewDeptStartYear(e.target.value)}
                    className="w-20 bg-gray-800 border border-gray-600 text-cyan-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <p className="text-gray-500 text-xs mb-3">
                  Start Y: The year the show starts — leave it as 1 if there is no General before it
                </p>
                <button
                  onClick={handleAddDepartment}
                  disabled={!newDeptName.trim()}
                  className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium transition-colors"
                >
                  Add Department
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Year Confirmation Modal */}
      {showEditModal && (
        <div className="fixed z-50 inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <div className="flex items-start mb-4">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-200">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Edit Year Settings
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Are you sure you want to edit settings for Year {selectedYear}
                  ?
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleProceedEdit}
                className="px-4 py-2 text-sm font-medium text-white bg-yellow-500 rounded-md hover:bg-yellow-600"
              >
                Confirm Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} handler={() => setDeleteModalOpen(false)}>
        <DialogHeader>
          Delete Course
          <IconButton
            variant="text"
            onClick={() => setDeleteModalOpen(false)}
            className="!absolute right-3 top-3"
          >
            <XMarkIcon className="h-5 w-5" />
          </IconButton>
        </DialogHeader>
        <DialogBody>
          <div className="flex flex-col items-center gap-4">
            <ExclamationTriangleIcon className="h-16 w-16 text-red-600" />
            <Typography variant="h5" color="red">
              Are you sure?
            </Typography>
            <Typography>
              This action cannot be undone. All data will be permanently
              removed.
            </Typography>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            color="red"
            onClick={() => {
              deleteMutation.mutate(selectedCourseId);
              setDeleteModalOpen(false);
            }}
            className="mr-2"
          >
            Delete
          </Button>
          <Button onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
        </DialogFooter>
      </Dialog>

      {/* Edit Course Modal */}
      <Dialog open={editNameModalOpen} handler={setEditNameModalOpen}>
        <DialogHeader>
          Edit Course
          <IconButton
            variant="text"
            onClick={() => {
              setEditNameModalOpen(false);
              setNewName("");
              setEditGrops("");
              setEditGropLap("");
              setEditEnrollment("");
              setEditingCourse(null);
            }}
            className="!absolute right-3 top-3"
          >
            <XMarkIcon className="h-5 w-5" />
          </IconButton>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <div>
            <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
              Course Name
            </Typography>
            <Input
              label="Course name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>
          <div>
            <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
              Number of Groups
            </Typography>
            <Input
              label="Groups (ex: 2)"
              value={editGrops}
              onChange={(e) => {
                if (/^\d*$/.test(e.target.value)) setEditGrops(e.target.value);
              }}
            />
          </div>
          <div>
            <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
              Number of Lab Sections
            </Typography>
            <Input
              label="Lab sections (ex: 5)"
              value={editGropLap}
              onChange={(e) => {
                if (/^\d*$/.test(e.target.value)) setEditGropLap(e.target.value);
              }}
            />
          </div>
          <div>
            <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
              Enrollment
            </Typography>
            <Input
              label="Enrollment (ex: 100)"
              value={editEnrollment}
              onChange={(e) => {
                if (/^\d*$/.test(e.target.value)) setEditEnrollment(e.target.value);
              }}
            />
          </div>

          {/* ── Link to Shared Course ── */}
          <div>
            <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
              Link to Shared Course <span className="text-gray-400 font-normal">(optional)</span>
            </Typography>
            <select
              value={linkCourseId ?? ""}
              onChange={(e) => setLinkCourseId(e.target.value || null)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-blue-500"
            >
              <option value="">-- Empty --</option>
              {courses
                .filter((c) => c.id !== editingCourse?.id)
                .sort((a, b) => a.year - b.year || a.name.localeCompare(b.name))
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {yearLabel(c.year)} — {c.name}
                    {c.sharedGroupCode ? ` 🔗` : ""}
                  </option>
                ))}
            </select>
            {linkCourseId && (
              <p className="text-xs text-blue-600 mt-1">
              </p>
            )}
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            onClick={() => {
              if (editingCourse && newName.trim()) {
                // احسب الـ SharedGroupCode
                let sharedGroupCode = null;
                if (linkCourseId) {
                  const targetCourse = courses.find((c) => c.id === parseInt(linkCourseId));
                  // لو المادة المختارة عندها كود → استخدمه، لو لأ → اعمل كود جديد
                  sharedGroupCode = targetCourse?.sharedGroupCode || 
                    `SGC_${Math.min(editingCourse.id, parseInt(linkCourseId))}_${Math.max(editingCourse.id, parseInt(linkCourseId))}`;
                }

                updateNameMutation.mutate({
                  id: editingCourse.id,
                  newName: newName.trim(),
                  grops: editGrops,
                  grop_lap: editGropLap,
                  enrollment: editEnrollment,
                  sharedGroupCode,
                });
              }
            }}
            disabled={updateNameMutation.isPending}
            className="mr-2 active"
          >
            {updateNameMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Add/Edit Course Modal */}
      <Dialog size="sm" open={open} handler={handleOpen} className="p-4">
        <DialogHeader className="relative m-0 block bg-blue-800 text-white p-4 rounded-t-xl">
          <Typography variant="h4" color="blue-gray">
            {isEdit ? "Edit Course" : "Add New Course"}
          </Typography>
          <IconButton
            size="sm"
            variant="text"
            className="!absolute right-3.5 top-3.5"
            onClick={() => {
              resetForm();
              handleOpen();
            }}
          >
            <XMarkIcon className="h-4 w-4 stroke-2" />
          </IconButton>
        </DialogHeader>
        <DialogBody className="space-y-4 pb-6">
          {!isEdit && (
            <div>
              <Typography
                variant="small"
                color="blue-gray"
                className="mb-2 text-left font-medium"
              >
                Course Name
              </Typography>
              <Input
                color="gray"
                size="lg"
                required
                placeholder="Math1..."
                name="name"
                value={course.name}
                onChange={handleChange}
                className="placeholder:opacity-100 focus:!border-t-gray-900"
                containerProps={{ className: "!min-w-full" }}
                labelProps={{ className: "hidden" }}
              />
            </div>
          )}

          <div>
            <Typography
              variant="small"
              color="blue-gray"
              className="mb-2 text-left font-medium"
            >
              Number of groups (normal)
            </Typography>
            <Input
              color="gray"
              size="lg"
              required
              name="grops"
              value={
                isEdit
                  ? course.grops
                  : isYearOccupied
                  ? fixedValues[course.year]?.grops
                  : course.grops
              }
              onChange={handleChange}
              placeholder="EX: 4"
              disabled={isYearOccupied}
              className="placeholder:opacity-100 focus:!border-t-gray-900"
              labelProps={{ className: "hidden" }}
            />
          </div>

          <div>
            <Typography
              variant="small"
              color="blue-gray"
              className="mb-2 text-left font-medium"
            >
              Number of lab sections
            </Typography>
            <Input
              color="gray"
              size="lg"
              name="grop_lap"
              required
              value={
                isEdit
                  ? course.grop_lap
                  : isYearOccupied
                  ? fixedValues[course.year]?.grop_lap
                  : course.grop_lap
              }
              onChange={handleChange}
              placeholder="EX: 3"
              disabled={isYearOccupied}
              className="placeholder:opacity-100 focus:!border-t-gray-900"
              labelProps={{ className: "hidden" }}
            />
          </div>

          <div>
            <Typography
              variant="small"
              color="blue-gray"
              className="mb-2 text-left font-medium"
            >
              Enrollment
            </Typography>
            <Input
              color="gray"
              size="lg"
              required
              name="enrollment"
              value={
                isEdit
                  ? course.enrollment
                  : isYearOccupied
                  ? fixedValues[course.year]?.enrollment
                  : course.enrollment
              }
              onChange={handleChange}
              placeholder="EX: 100"
              disabled={isYearOccupied}
              containerProps={{ className: "!min-w-full" }}
              className="placeholder:opacity-100 focus:!border-t-gray-900"
              labelProps={{ className: "hidden" }}
            />
          </div>

          <div>
            <Typography
              variant="small"
              color="blue-gray"
              className="mb-2 text-left font-medium"
            >
              Year
            </Typography>
            <Select
              value={course.year}
              onChange={(selectedYear) => {
                setCourse((prev) => ({
                  ...prev,
                  year: selectedYear,
                }));
              }}
              disabled={isEdit}
              className="text-left"
            >
              {yearsList.map((year) => {
                const hasData = !!fixedValues[year];
                return (
                  <Option
                    key={year}
                    value={String(year)}
                  >
                    {hasData ? yearLabel(year) : `New ${yearLabel(year)}`}
                  </Option>
                );
              })}
            </Select>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            className="ml-auto active"
            onClick={handleSubmit}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Saving..." : "Submit"}
          </Button>
        </DialogFooter>
      </Dialog>


      <Dialog open={staffDialogOpen} handler={() => setStaffDialogOpen(false)}>
  <DialogHeader>
    {staffType === "professors" ? "Professors" : "Teaching Assistants"} for {selectedCourseName}
  </DialogHeader>
  <DialogBody>
    {staffList.length > 0 ? (
      <ul className="list-disc pl-6">
        {staffList.map((person) => (
          <li key={person.id} className="text-base font-medium">
            {person.name}
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-gray-600">No data available.</p>
    )}
  </DialogBody>
  <DialogFooter>
    <Button onClick={() => setStaffDialogOpen(false)}>Close</Button>
  </DialogFooter>
</Dialog>


      {/* ── Excel Upload Modal ── */}
      {excelModalOpen && (
        <div className="fixed z-50 inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-700">
              <h2 className="text-white font-bold text-lg">Import Courses from Excel</h2>
              <button onClick={() => setExcelModalOpen(false)} className="text-gray-400 hover:text-white">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-gray-300 text-sm font-medium mb-1"> Excel sheet format: </p>
                <p className="text-cyan-400 text-xs font-mono">column A → cs-1 / is-2 / cs-3</p>
                <p className="text-cyan-400 text-xs font-mono">column B → Course name </p>
                <p className="text-gray-500 text-xs mt-1"> The name must match the name of the system </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Groups (default)</label>
                  <input type="number" min="1" value={excelGrops}
                    onChange={(e) => setExcelGrops(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-2 py-1 text-sm" />
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Sections (default)</label>
                  <input type="number" min="0" value={excelGropLap}
                    onChange={(e) => setExcelGropLap(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-2 py-1 text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="text-gray-400 text-xs mb-1 block">Enrollment (default)</label>
                  <input type="number" min="1" value={excelEnrollment}
                    onChange={(e) => setExcelEnrollment(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-2 py-1 text-sm" />
                </div>
              </div>
              <input
                ref={excelInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleExcelUpload}
                className="hidden"
              />
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Semester</label>
                <select
                  value={excelSemester}
                  onChange={(e) => setExcelSemester(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-2 py-1 text-sm"
                >
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                </select>
              </div>
              <button
                onClick={() => excelInputRef.current?.click()}
                disabled={excelUploading}
                className="w-full py-2 rounded-lg bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium transition-colors"
              >
                {excelUploading ? "جاري الرفع..." : "📂 اختار ملف Excel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete All Confirmation Modal ── */}
      {deleteAllModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-80 shadow-xl">
            <h3 className="text-white font-semibold text-base mb-2">Delete all courses ⚠️</h3>
            <p className="text-gray-400 text-sm mb-5">
             It will permanently erase all existing data. Are you sure?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteAllCourses}
                className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors"
              >
               Yes , Delete all
              </button>
              <button
                onClick={() => setDeleteAllModalOpen(false)}
                className="flex-1 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      

      {/* Main Content */}
      <div className="background-main-pages">
        <Slidebar />
        <div className="max-w-screen-xl mx-auto rounded-md bg-slate-800 px-4 sm:px-6">
          <div className="w-full md:w-auto flex justify-between items-center order-1">
            <a className="flex items-center py-4 text-lg md:text-2xl font-semibold text-white">
              <img
                className="rounded-md w-8 h-8 mr-2"
                src={imgLOGO}
                alt="logo"
              />
              NEXT Advisory
            </a>

            <div className="flex gap-2">
              <Button
                onClick={() => setDeptModalOpen(true)}
                variant="outlined"
                className="border-cyan-500 text-cyan-400 hover:bg-cyan-900/20 flex items-center gap-1"
              >
                <PlusIcon className="h-4 w-4" />
                Manage Departments
              </Button>

              <Button
                onClick={() => setExcelModalOpen(true)}
                variant="outlined"
                className="border-green-500 text-green-400 hover:bg-green-900/20 flex items-center gap-1"
              >
                📊 Import Excel
              </Button>

              <Button
                onClick={() => setDeleteAllModalOpen(true)}
                variant="outlined"
                className="border-red-500 text-red-400 hover:bg-red-900/20 flex items-center gap-1"
              >
                🗑️ Delete all Courses
              </Button>

              <Button
                onClick={() => {
                  resetForm();
                  handleOpen();
                }}
                variant="gradient"
                className="color-main"
              >
                Add Courses
              </Button>
            </div>
          </div>

          <div className="text-center">
            <input
              type="text"
              placeholder="🔍 Search Courses Name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mt-5 w-3/5 p-2 border rounded mb-4"
            />
          </div>

          <div className="flex flex-col">
            <div className="-m-1.5 overflow-x-auto">
              <div className="p-1.5 min-w-full inline-block align-middle">
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-start text-xs font-medium text-white uppercase">
                          Name
                        </th>
                        <th className="px-6 py-3 text-start text-xs font-medium text-white uppercase">
                          Groups
                        </th>
                        <th className="px-6 py-3 text-start text-xs font-medium text-white uppercase">
                          Lab Sections
                        </th>
                        <th className="px-6 py-3 text-start text-xs font-medium text-white uppercase">
                          Enrollment
                        </th>
                        <th className="px-6 py-3 text-start text-xs font-medium text-white uppercase">
                          Year
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase">
                          Teams
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-700">
                      {isLoading ? (
                        <tr>
                          <td
                            colSpan="7"
                            className="text-center py-4 text-white"
                          >
                            <LoadingAnimation />
                          </td>
                        </tr>
                      ) : isError ? (
                        <tr>
                          <td
                            colSpan="7"
                            className="text-center py-4 text-red-500"
                          >
                            {error.message}
                          </td>
                        </tr>
                      ) : filteredCourses.length === 0 ? (
                        <tr>
                          <td
                            colSpan="7"
                            className="text-center py-4 text-white"
                          >
                            No courses available
                          </td>
                        </tr>
                      ) : (
                        <>
                          {/* Display existing years */}
                          {Object.entries(coursesByYear)
                            .sort(([a], [b]) => a - b)
                            .map(([year, data]) => (
                              <Fragment key={year}>
                                <tr className="bg-gray-700">
                                  <td colSpan="7" className="p-2 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                      <Button
                                        onClick={() => {
                                          setCourse({
                                            year: String(year),
                                            ...data.fixed,
                                            name: "",
                                          });
                                          handleOpen();
                                        }}
                                        className="text-white active font-bold"
                                      >
                                        {data.fixed
                                          ? `${yearLabel(year)} +`
                                          : "Add new year"}
                                      </Button>

                                      <Button
                                        variant="outlined"
                                        color="blue"
                                        onClick={() =>
                                          handleEditConfirmation(year)
                                        }
                                        className="text-white hover:bg-blue-800 border-white"
                                      >
                                        Edit Year
                                      </Button>
                                    </div>
                                  </td>
                                </tr>

                                {data.courses.map((course) => (
                                  <tr
                                    key={course.id}
                                    className="hover:bg-black"
                                  >
                                    <td className="px-6 tex py-4 whitespace-nowrap text-sm text-white">
                                      <div className="flex items-center gap-2">
                                        {course.name}
                                        {course.sharedGroupCode && (
                                          <span
                                            title={`Linked: ${course.sharedGroupCode}`}
                                            className="text-xs bg-blue-700 text-blue-200 px-1.5 py-0.5 rounded"
                                          >
                                            🔗
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                      {course.grops}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                      {course.grop_lap}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                      {course.enrollment}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                      {yearLabel(course.year)}
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                                      <div className="flex gap-4 justify-end">
                                        <button
  onClick={() => handleViewStaff(course.id, "professors")}
  className={`px-2 py-1 rounded text-white font-semibold ${
    coursesDetails[course.id]?.professors?.length > 0
      ? "bg-green-500"
      : "bg-red-600"
  }`}
>
  Professors
</button>

<button
  onClick={() => handleViewStaff(course.id, "teachingAssistants")}
  className={`px-2 py-1 rounded text-white font-semibold ${
    coursesDetails[course.id]?.teachingAssistants?.length > 0
      ? "bg-green-500"
      : "bg-red-600"
  }`}
>
  TAs
</button>


                                      </div>
                                    </td>


                                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                                      <div className="flex gap-4 justify-end">
                                        <button
                                          onClick={() => {
                                            setEditingCourse(course);
                                            setNewName(course.name);
                                            setEditGrops(course.grops.toString());
                                            setEditGropLap(course.grop_lap.toString());
                                            setEditEnrollment(course.enrollment.toString());
                                            if (course.sharedGroupCode) {
                                              const linked = courses.find(
                                                c => c.id !== course.id && c.sharedGroupCode === course.sharedGroupCode
                                              );
                                              setLinkCourseId(linked ? String(linked.id) : null);
                                            } else {
                                              setLinkCourseId(null);
                                            }
                                            setEditNameModalOpen(true);
                                          }}
                                          className="text-blue-500 hover:text-blue-800 font-semibold px-2 py-1 rounded"
                                        >
                                          Edit
                                        </button>
                                        <span className="text-gray-400">|</span>
                                        <button
                                          onClick={() => {
                                            setSelectedCourseId(course.id);
                                            setDeleteModalOpen(true);
                                          }}
                                          className="text-red-600 hover:text-red-700 font-semibold px-2 py-1 rounded"
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </Fragment>
                            ))}
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GetCourses;
