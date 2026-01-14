const pageState = {
  term: "الترم الأول",
  method: "رقم الجلوس",
  grade: "الصف الثالث الإعدادي",
};

const dataset = [
  {
    grade: "الصف الثالث الإعدادي",
    term: "الترم الأول",
    method: "رقم الجلوس",
    key: "12345",
    subjects: [
      { name: "لغة عربية", max: 50, min: 25, score: 45 },
      { name: "رياضيات", max: 60, min: 30, score: 52 },
      { name: "علوم", max: 40, min: 20, score: 34 },
      { name: "دراسات", max: 40, min: 20, score: 38 },
    ],
  },
  {
    grade: "الصف الأول الثانوي",
    term: "الترم الثاني",
    method: "الرقم القومي",
    key: "29801151234567",
    subjects: [
      { name: "فيزياء", max: 60, min: 30, score: 54 },
      { name: "كيمياء", max: 60, min: 30, score: 50 },
      { name: "أحياء", max: 40, min: 20, score: 36 },
      { name: "لغة أجنبية", max: 40, min: 20, score: 32 },
    ],
  },
  {
    grade: "الصف الثاني الثانوي",
    term: "الترم الأول",
    method: "رقم الجلوس",
    key: "77777",
    subjects: [
      { name: "جبر", max: 40, min: 20, score: 31 },
      { name: "هندسة", max: 40, min: 20, score: 33 },
      { name: "تاريخ", max: 50, min: 25, score: 42 },
    ],
  },
  {
    grade: "الصف الثالث الثانوي",
    term: "الترم الثاني",
    method: "رقم الجلوس",
    key: "99999",
    subjects: [
      { name: "تفاضل", max: 60, min: 30, score: 48 },
      { name: "فيزياء متقدمة", max: 60, min: 30, score: 51 },
      { name: "كيمياء عضوية", max: 60, min: 30, score: 47 },
      { name: "لغة عربية", max: 50, min: 25, score: 45 },
      { name: "لغة أجنبية", max: 40, min: 20, score: 33 },
    ],
  },
];

const fallbackApis = [
  (query) => dataset.find((item) => item.key === query.key && item.grade === query.grade),
  (query) =>
    dataset.find((item) => item.key === query.key && item.term === query.term),
  (query) => dataset.find((item) => item.key === query.key),
];

const formatSummary = (subjects) => {
  const total = subjects.reduce((sum, subject) => sum + subject.score, 0);
  const max = subjects.reduce((sum, subject) => sum + subject.max, 0);
  const percent = ((total / max) * 100).toFixed(1);
  return { total, percent, max };
};

const updateDropdown = (container, value) => {
  const button = container.querySelector("button");
  button.textContent = value;
};

const closeAllFilters = () => {
  document.querySelectorAll(".filter").forEach((filter) => {
    filter.classList.remove("open");
  });
};

const setupFilters = () => {
  document.querySelectorAll(".filter").forEach((filter) => {
    const toggle = filter.querySelector("button");
    toggle.addEventListener("click", () => {
      const isOpen = filter.classList.contains("open");
      closeAllFilters();
      if (!isOpen) {
        filter.classList.add("open");
      }
    });

    filter.querySelectorAll(".filter-options button").forEach((option) => {
      option.addEventListener("click", () => {
        const value = option.dataset.value;
        filter.classList.remove("open");
        updateDropdown(filter, value);
        if (filter.dataset.filter === "term") {
          pageState.term = value;
        }
        if (filter.dataset.filter === "method") {
          pageState.method = value;
        }
        if (filter.dataset.filter === "grade") {
          pageState.grade = value;
        }
      });
    });
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".filter")) {
      closeAllFilters();
    }
  });
};

const renderTable = (subjects) => {
  const body = document.querySelector(".table-body");
  body.innerHTML = "";

  subjects.forEach((subject, index) => {
    const row = document.createElement("div");
    row.className = "table-row";
    row.innerHTML = `
      <div>${subject.name}</div>
      <div>${subject.max}</div>
      <div>${subject.min}</div>
      <div>${subject.score}</div>
    `;
    body.appendChild(row);
    if (index < subjects.length - 1) {
      const divider = document.createElement("div");
      divider.className = "table-divider";
      body.appendChild(divider);
    }
  });
};

const renderSummary = (subjects) => {
  const summary = formatSummary(subjects);
  document.querySelector(".summary-total").textContent = `الدرجة الكلية: ${summary.total}`;
  document.querySelector(".summary-percent").textContent = `النسبة المئوية: ${summary.percent}%`;
};

const showError = () => {
  document.querySelector(".results").classList.add("hidden");
  document.querySelector(".error-box").classList.remove("hidden");
  document.querySelector(".share-result").setAttribute("disabled", "true");
};

const showResults = (subjects) => {
  document.querySelector(".results").classList.remove("hidden");
  document.querySelector(".error-box").classList.add("hidden");
  document.querySelector(".share-result").removeAttribute("disabled");
  renderTable(subjects);
  renderSummary(subjects);
};

const handleSearch = () => {
  const input = document.querySelector("#queryInput");
  const key = input.value.trim();
  if (!key) {
    showError();
    return;
  }

  const query = {
    key,
    term: pageState.term,
    method: pageState.method,
    grade: pageState.grade,
  };

  let result = null;
  for (const api of fallbackApis) {
    result = api(query);
    if (result) break;
  }

  if (!result) {
    showError();
    return;
  }

  showResults(result.subjects);
};

const setupShare = (buttonId) => {
  const button = document.querySelector(buttonId);
  if (!button) return;
  button.addEventListener("click", async () => {
    if (navigator.share) {
      await navigator.share({
        title: document.title,
        text: "استعلام عن نتيجة - مراحل التعليم الأساسي",
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      button.textContent = "تم النسخ";
      setTimeout(() => {
        button.textContent = "مشاركة";
      }, 1500);
    }
  });
};

const setupBackToTop = () => {
  const button = document.querySelector(".back-top");
  if (!button) return;
  button.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
};

const setupScrollToStages = () => {
  const trigger = document.querySelector("#scrollToStages");
  const target = document.querySelector("#stages");
  if (!trigger || !target) return;
  trigger.addEventListener("click", () => {
    target.scrollIntoView({ behavior: "smooth" });
  });
};

const setupCopy = () => {
  const button = document.querySelector(".copy-button");
  if (!button) return;
  button.addEventListener("click", async () => {
    const total = document.querySelector(".summary-total").textContent;
    const percent = document.querySelector(".summary-percent").textContent;
    await navigator.clipboard.writeText(`${total} - ${percent}`);
    button.querySelector("span").textContent = "تم النسخ";
    setTimeout(() => {
      button.querySelector("span").textContent = "نسخ نص المجموع الكلي";
    }, 1500);
  });
};

const setupInquiryPage = () => {
  const page = document.querySelector(".inquiry-page");
  if (!page) return;
  pageState.grade = page.dataset.grade;
  setupFilters();
  setupShare(".share-result");
  setupBackToTop();
  setupCopy();
  document.querySelector("#searchButton").addEventListener("click", handleSearch);
};

setupShare("#shareHero");
setupScrollToStages();
setupInquiryPage();
