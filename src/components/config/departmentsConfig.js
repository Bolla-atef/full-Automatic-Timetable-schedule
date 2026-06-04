// ============================================================
//  departmentsConfig.js
// ============================================================

const STORAGE_KEY = "collegeDepartments";
const VERSION_KEY = "collegeDepartmentsVersion";

// ↓ ارفع الرقم ده بواحد كل ما تعدل في الـ DEFAULTS
const CURRENT_VERSION = 2;

// startYear: السنة اللي بيبدأ منها التخصص في العرض
// مثال: General=1 year بيبدأ من 1، IS بيبدأ من 2 لو فيه General قبله
const DEFAULTS = {
  ComputerScience: [
    { id: "cs", name: "CS", years: 4, startYear: 1 },
    { id: "is", name: "IS", years: 3, startYear: 2 },
  ],
  engineering: [
    { id: "general", name: "General", years: 1, startYear: 1 },
    { id: "Mechatronics", name: "Mechatronics", years: 4, startYear: 2 },
    { id: "Construction and building", name: "Construction and building", years: 4, startYear: 2 },
  ],
  Media_and_Communication_Arts: [
    { id: "Radio and Television", name: "Radio and Television", years: 4, startYear: 1 },
    { id: "Public Relations and Advertising", name: "Public Relations and Advertising", years: 4, startYear: 1 },
    { id: "Press and Media", name: "Press and Media", years: 4, startYear: 1 },
  ],
  Business_Administration: [
    { id: "Accounting", name: "Accounting", years: 4, startYear: 1 },
    { id: "Marketing", name: "Marketing", years: 4, startYear: 1 },
    { id: "Finance", name: "Finance", years: 4, startYear: 1 },
  ],
  Politics_and_Economics: [
    { id: "Politics", name: "Politics", years: 4, startYear: 1 },
    { id: "Economics", name: "Economics", years: 4, startYear: 1 },
  ],
  Languages_and_Translation: [
    { id: "English", name: "English", years: 4, startYear: 1 },
    { id: "French", name: "French", years: 4, startYear: 1 },
    { id: "Spanish", name: "Spanish", years: 4, startYear: 1 },
    { id: "German", name: "German", years: 4, startYear: 1 },
  ],
  social_service: [
    { id: "General", name: "General", years: 4, startYear: 1 },
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

export const addDepartment = (collegeId, name, years, startYear = 1) => {
  const all = loadAll();
  if (!all[collegeId]) all[collegeId] = [];
  const id = name.toLowerCase().replace(/\s+/g, "_") + "_" + Date.now();
  all[collegeId].push({ id, name, years: parseInt(years) || 4, startYear: parseInt(startYear) || 1 });
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
    const startYear = dept.startYear || 1;  // لو مفيش startYear يبدأ من 1
    for (let y = 0; y < dept.years; y++) {
      labels[counter] = `${dept.name} - Year ${startYear + y}`;
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
 * buildReverseYearMap
 * بيعمل map عكسي: "cs-1" → 1, "is-2" → 6, إلخ
 * بيستخدمه الـ Excel Upload عشان يحول اسم التخصص+السنة لـ sequential year number
 */
export const buildReverseYearMap = (collegeId) => {
  const deps = getDepartments(collegeId);
  const reverse = {};
  let counter = 1;
  deps.forEach((dept) => {
    const startYear = dept.startYear || 1;
    const deptKey = dept.name.toLowerCase().trim();
    for (let y = 0; y < dept.years; y++) {
      const displayYear = startYear + y;
      // "cs-1", "CS-1", "cs-2" كلهم بيشتغلوا
      reverse[`${deptKey}-${displayYear}`] = counter;
      counter++;
    }
  });
  return reverse;
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
