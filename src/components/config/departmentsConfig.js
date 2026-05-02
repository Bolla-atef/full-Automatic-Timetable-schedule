// ============================================================
//  departmentsConfig.js
//  بيخزن التخصصات لكل كلية في localStorage
// ============================================================

const STORAGE_KEY = "collegeDepartments";

const DEFAULTS = {
  ComputerScience: [
    { id: "cs", name: "CS", years: 3  },
    { id: "is", name: "IS", years: 3 },
  ],
  engineering: [
    { id: "general", name: "General", years: 1 },
    { id: "Mechatronics", name: "Mechatronics", years: 4, skipToYear: 2 },
    { id: "Construction and building", name: "Construction and building", years: 4, skipToYear: 2 },
  ],
  Media_and_Communication_Arts: [
    { id: "Radio and Television", name: "Radio and Television", years: 4 },
    { id: "Public Relations and Advertising", name: "Public Relations and Advertising", years: 4 },
    { id: "Press and Media", name: "Press and Media", years: 4 },
  ],
  Business_Administration: [
    { id: "Accounting", name: "Accounting", years: 4 },
    { id: "Marketing", name: "Marketing", years: 4 },
    { id: "Finance", name: "Finance", years: 4 },
  ],
  Politics_and_Economics: [
    { id: "Politics", name: "Politics", years: 4 },
    { id: "Economics", name: "Economics", years: 4 },
  ],
  Languages_and_Translation: [
    { id: "English", name: "English", years: 4 },
    { id: "French", name: "French", years: 4 },
    { id: "Spanish", name: "Spanish", years: 4 },
    { id: "German", name: "German", years: 4 },
  ],
  social_service: [
    { id: "General", name: "General", years: 4 },
  ],
};

/** احفظ */
const saveAll = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

/** اجيب كل التخصصات المخزونة */
const loadAll = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveAll({ ...DEFAULTS });
      return { ...DEFAULTS };
    }
    const stored = JSON.parse(raw);
    const merged = { ...stored };
    Object.keys(DEFAULTS).forEach((collegeId) => {
      if (!merged[collegeId]) {
        merged[collegeId] = [...DEFAULTS[collegeId]];
      } else {
        const existingIds = merged[collegeId].map((d) => d.id);
        DEFAULTS[collegeId].forEach((defaultDept) => {
          if (!existingIds.includes(defaultDept.id)) {
            merged[collegeId].push({ ...defaultDept });
          }
        });
      }
    });
    saveAll(merged);
    return merged;
  } catch {
    return { ...DEFAULTS };
  }
};

// ── Public API ────────────────────────────────────────────────

export const getDepartments = (collegeId) => {
  const all = loadAll();
  return all[collegeId] || [];
};

export const addDepartment = (collegeId, name, years) => {
  const all = loadAll();
  if (!all[collegeId]) all[collegeId] = [];
  const id = name.toLowerCase().replace(/\s+/g, "_") + "_" + Date.now();
  all[collegeId].push({ id, name, years: parseInt(years) || 4 });
  saveAll(all);
  return all[collegeId];
};

export const deleteDepartment = (collegeId, deptId) => {
  const all = loadAll();
  if (!all[collegeId]) return [];
  all[collegeId] = all[collegeId].filter((d) => d.id !== deptId);
  saveAll(all);
  return all[collegeId];
};

/**
 * بيحول التخصصات لـ year labels مع دعم skipToYear
 * مثال engineering:
 *   general(1 سنة)          → { 1: "general - Year 1" }
 *   Mechatronics(4 سنين، skipToYear:2) → { 2: "Mechatronics - Year 2", 3: "Year 3", 4: "Year 4", 5: "Year 5" }
 */
export const buildYearLabels = (collegeId) => {
  const deps = getDepartments(collegeId);
  const labels = {};
  let counter = 1;
  deps.forEach((dept) => {
    const startYear = dept.skipToYear || counter;
    for (let y = startYear; y < startYear + dept.years; y++) {
      labels[counter] = `${dept.name} - Year ${y}`;
      counter++;
    }
  });
  return labels;
};

export const getYearLabel = (year, collegeId) => {
  const labels = buildYearLabels(collegeId);
  return labels[parseInt(year)] || `Year ${year}`;
};