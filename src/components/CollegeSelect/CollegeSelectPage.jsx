import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import imgLOGO from "../../assets/imagelogo.jpeg";
import { COLLEGES, saveSelectedCollege } from "../config/collegeConfig";

export default function CollegeSelectPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);

  const handleContinue = () => {
    if (!selected) return;
    // لو في token → سجل خروج وامسح الداتا القديمة عشان الـ DEFAULTS الجديدة تظهر
    if (localStorage.getItem("userToken")) {
      localStorage.removeItem("userToken");
      localStorage.removeItem("collegeDepartments");
    }
    saveSelectedCollege(selected);
    navigate("/login");
  };

  return (
    <div className="bg-black text-white font-['Space_Grotesk'] min-h-screen overflow-x-hidden">

      {/* ── Background decorations (نفس الـ Home) ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-indigo-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-900/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-64 h-64 bg-cyan-900/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 grid grid-cols-12 opacity-5 pointer-events-none">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="border-r border-cyan-500" />
          ))}
        </div>
        <div className="absolute inset-0 grid grid-rows-12 opacity-5 pointer-events-none">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="border-b border-cyan-500" />
          ))}
        </div>
      </div>

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 bg-gray-900/70 backdrop-blur-lg border-b border-cyan-500/30 z-50">
        <div className="container mx-auto px-6 py-3 flex items-center">
          <div className="relative mr-2">
            <div className="absolute inset-0 bg-cyan-400/30 rounded-md blur-sm" />
            <div className="w-10 h-10 rounded-md border border-indigo-400/30 flex items-center justify-center relative">
              <div className="absolute inset-[3px] bg-gray-900 rounded-[4px] flex items-center justify-center overflow-hidden">
                <img src={imgLOGO} className="h-8 rounded-sm" alt="logo" />
              </div>
            </div>
          </div>
          <span className="text-xl font-medium bg-gradient-to-r from-indigo-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Next Advisory
          </span>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 pt-20">

        {/* Title */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-900/40 border border-indigo-500/30 text-indigo-300 text-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-cyan-400 mr-2 animate-pulse" />
            Select Your Faculty
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Choose Your College
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-md mx-auto">
            Select the faculty you belong to. The system will customize your
            experience accordingly.
          </p>
        </div>

        {/* College Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl mb-10">
          {COLLEGES.map((college) => {
            const isSelected = selected === college.id;
            return (
              <button
                key={college.id}
                onClick={() => setSelected(college.id)}
                onMouseEnter={() => setHovered(college.id)}
                onMouseLeave={() => setHovered(null)}
                className={`relative group text-left rounded-xl border p-6 transition-all duration-300 cursor-pointer
                  ${isSelected
                    ? "border-cyan-400 bg-indigo-900/40 shadow-lg shadow-cyan-500/20"
                    : "border-gray-700 bg-gray-900/50 hover:border-indigo-500/50 hover:bg-indigo-900/20"
                  }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-cyan-400 flex items-center justify-center">
                    <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}

                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-all duration-300
                  ${isSelected ? "bg-cyan-400/20 border border-cyan-400/40" : "bg-indigo-900/30 border border-indigo-500/20 group-hover:bg-indigo-900/50"}`}>
                  <svg className={`w-6 h-6 transition-colors duration-300 ${isSelected ? "text-cyan-400" : "text-indigo-400"}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422A12 12 0 0112 21a12 12 0 01-6.16-3.422L12 14z" />
                  </svg>
                </div>

                <h3 className={`font-semibold text-lg transition-colors duration-300
                  ${isSelected ? "text-cyan-300" : "text-white group-hover:text-indigo-300"}`}>
                  {college.name}
                </h3>
              </button>
            );
          })}
        </div>

        {/* Continue Button */}
        <div className="relative group">
          <div className={`absolute -inset-0.5 rounded-lg blur transition-all duration-500
            ${selected
              ? "bg-gradient-to-r from-indigo-600/80 to-cyan-600/80 opacity-100"
              : "bg-gray-700/30 opacity-50"
            }`}
          />
          <button
            onClick={handleContinue}
            disabled={!selected}
            className={`relative px-10 py-3 rounded-lg font-medium text-base transition-all duration-300 z-10
              ${selected
                ? "bg-gradient-to-r from-indigo-900/90 to-purple-900/90 text-white cursor-pointer hover:from-indigo-800/90 hover:to-purple-800/90"
                : "bg-gray-900/80 text-gray-500 cursor-not-allowed"
              }`}
          >
            <span className={selected ? "bg-gradient-to-r from-cyan-300 to-indigo-300 bg-clip-text text-transparent" : ""}>
              Continue →
            </span>
          </button>
        </div>

      </main>
    </div>
  );
}
