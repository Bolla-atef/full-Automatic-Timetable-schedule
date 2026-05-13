// ============================================================
//  departmentsConfig.js
// ============================================================

const STORAGE_KEY = "collegeDepartments";
const VERSION_KEY = "collegeDepartmentsVersion";

// ↓ ارفع الرقم ده بواحد كل ما تعدل في الـ DEFAULTS
const CURRENT_VERSION = 1;

const DEFAULTS = {
  ComputerScience: [
    { id: "cs", name: "CS", years: 4 },
    { id: "is", name: "IS", years: 4 },
  ],
  engineering: [
    { id: "general", name: "general", years: 1 },
    { id: "Mechatronics", name: "Mechatronics", years: 4 },
    { id: "Construction and building", name: "Construction and building", years: 4 },
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
    const storedVersion = parseInt(localStorage.getItem(VERSION_KEY) || "0");

    // لو الـ version اتغير → امسح القديم وحط الـ DEFAULTS الجديدة
    if (storedVersion !== CURRENT_VERSION) {
      saveAll({ ...DEFAULTS });
      localStorage.setItem(VERSION_KEY, String(CURRENT_VERSION));
      return { ...DEFAULTS };
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveAll({ ...DEFAULTS });
      localStorage.setItem(VERSION_KEY, String(CURRENT_VERSION));
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

export const buildYearLabels = (collegeId) => {
  const deps = getDepartments(collegeId);
  const labels = {};
  let counter = 1;
  deps.forEach((dept) => {
    for (let y = 1; y <= dept.years; y++) {
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

/**
 * بتعمل sync بين الـ DEFAULTS والـ localStorage
 * بتحافظ على التخصصات اللي المستخدم ضافها يدوياً
 * وبتضيف أي تخصص جديد في الـ DEFAULTS
 * استخدمها بدل localStorage.removeItem('collegeDepartments')
 */
export const syncWithDefaults = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const stored = raw ? JSON.parse(raw) : {};
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
  } catch {
    saveAll({ ...DEFAULTS });
  }
};
