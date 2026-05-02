import { useState, useEffect } from "react";
import axios from "axios";

const GetProfessors = () => {
  const [professors, setProfessors] = useState([]);
  const [filteredProfessors, setFilteredProfessors] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfessors = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/Proffessors`);
        setProfessors(response.data);
        setFilteredProfessors(response.data);
      } catch (err) {
        setError("❌ لا يوجد بيانات");
      }
      setLoading(false);
    };

    fetchProfessors();
  }, []);

  useEffect(() => {
    const filtered = professors.filter((prof) =>
      prof.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredProfessors(filtered);
  }, [search, professors]);

  return (
    <div className="p-6 max-w-2xl mx-auto bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">📚 قائمة الأساتذة</h2>
      <input
        type="text"
        placeHolder="🔍 ابحث عن أستاذ بالاسم..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />
      {loading && <p>⏳ جاري التحميل...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <ul className="space-y-2">
          {filteredProfessors.length > 0 ? (
            filteredProfessors.map((professor) => (
              <li key={professor.id} className="p-2 border rounded bg-white">
                <p className="font-semibold">👨‍🏫 {professor.name}</p>
                <p>
                  📆 الأيام المتاحة: {Object.keys(professor)
                    .filter(
                      (day) =>
                        professor[day] === true &&
                        day !== "id" &&
                        day !== "name" &&
                        day !== "numberAssignedCourses"
                    )
                    .join(", ") || "غير متاح"}
                </p>
                <p>📚 عدد المواد المسندة: {professor.numberAssignedCourses}</p>
              </li>
            ))
          ) : (
            <p className="text-center text-gray-500">❌ لم يتم العثور على نتائج</p>
          )}
        </ul>
      )}
    </div>
  );
};

export default GetProfessors;