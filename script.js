const loginScreen = document.getElementById("loginScreen");
const appScreen = document.getElementById("appScreen");

const loginForm = document.getElementById("loginForm");
const passwordInput = document.getElementById("password");

const calendarContainer = document.getElementById("calendarContainer");

const presetSelect = document.getElementById("presetSelect");

const clearBtn = document.getElementById("clearBtn");

const logoutBtn = document.getElementById("logoutBtn");

const historyBtn = document.getElementById("historyBtn");

const dayMenu = document.getElementById("dayMenu");

const filtersContainer = document.getElementById("filters");

/* ================================================= */
/* FILTROS */
/* ================================================= */

let activeFilters = {
  work: true,
  off: true,
  "sold-off": true,
  "paid-off": true,
  "scheme-fixed": true,
  "scheme-return": true,
  relationship: true,
  fertile: true,
  period: true,
  "special-date": true,
  travel: true,
};

/* ================================================= */
/* USERS */
/* ================================================= */

const users = [
  {
    username: "Felipe",
    password: sha256("123456"),
  },

  {
    username: "Isabele",
    password: sha256("123456"),
  },
];

/* ================================================= */
/* CONFIG */
/* ================================================= */

const year = 2026;

const months = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const weekDays = ["D", "S", "T", "Q", "Q", "S", "S"];

/* ================================================= */
/* PRESETS */
/* ================================================= */

const presetData = {
  work: [
    {
      label: "🔴 Trabalho",
      class: "work",
      color: "work-color",
    },

    {
      label: "🟢 Folga",
      class: "off",
      color: "off-color",
    },

    {
      label: "🟣 Folga Vendida",
      class: "sold-off",
      color: "sold-off-color",
    },

    {
      label: "🔵 Folga Paga",
      class: "paid-off",
      color: "paid-off-color",
    },

    {
      label: "🟠 Fixo",
      class: "scheme-fixed",
      color: "scheme-fixed-color",
    },

    {
      label: "🟡 Bate-Volta",
      class: "scheme-return",
      color: "scheme-return-color",
    },
  ],

  relationship: [
    {
      label: "❤️ Encontro",
      class: "relationship",
      color: "relationship-color",
    },

    {
      label: "🌸 Período Fértil",
      class: "fertile",
      color: "fertile-color",
    },

    {
      label: "🩸 Menstruação",
      class: "period",
      color: "period-color",
    },

    {
      label: "💍 Data Especial",
      class: "special-date",
      color: "special-date-color",
    },

    {
      label: "✈️ Viagem",
      class: "travel",
      color: "travel-color",
    },
  ],

  custom: [],
};

/* ================================================= */
/* STORAGE */
/* ================================================= */

let currentPreset = "work";

function getStorageKey() {
  return `calendarData-${currentPreset}`;
}

function getSavedData() {
  return JSON.parse(localStorage.getItem(getStorageKey())) || {};
}

let savedData = getSavedData();

/* ================================================= */
/* LOGIN */
/* ================================================= */

checkLogin();

loginForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();

  const password = sha256(passwordInput.value.trim());

  const validUser = users.find(
    (user) => user.username === username && user.password === password,
  );

  if (validUser) {
    localStorage.setItem("sessionToken", btoa(validUser.username + Date.now()));

    localStorage.setItem("loggedUser", validUser.username);

    const loginHistory = JSON.parse(localStorage.getItem("loginHistory")) || [];

    loginHistory.push({
      user: validUser.username,

      date: new Date().toLocaleDateString(),

      time: new Date().toLocaleTimeString(),
    });

    localStorage.setItem("loginHistory", JSON.stringify(loginHistory));

    showApp();
  } else {
    alert("Usuário ou senha incorretos");
  }
});

/* ================================================= */
/* CHECK LOGIN */
/* ================================================= */

function checkLogin() {
  const logged = localStorage.getItem("sessionToken");

  if (logged) {
    showApp();
  } else {
    showLogin();
  }
}

/* ================================================= */
/* SHOW LOGIN */
/* ================================================= */

function showLogin() {
  loginScreen.classList.remove("hidden");

  appScreen.classList.add("hidden");
}

/* ================================================= */
/* SHOW APP */
/* ================================================= */

function showApp() {
  loginScreen.classList.add("hidden");

  appScreen.classList.remove("hidden");

  savedData = getSavedData();

  generateCalendar();

  renderLegend();

  renderFilters();

  updateFilters();

  const loggedUser = localStorage.getItem("loggedUser");

  if (loggedUser === "Felipe") {
    historyBtn.classList.remove("hidden");
  } else {
    historyBtn.classList.add("hidden");
  }
}

/* ================================================= */
/* LOGOUT */
/* ================================================= */

logoutBtn.addEventListener("click", function () {
  localStorage.removeItem("sessionToken");

  localStorage.removeItem("loggedUser");

  showLogin();
});

/* ================================================= */
/* HISTORICO */
/* ================================================= */

historyBtn.addEventListener("click", function () {
  const loggedUser = localStorage.getItem("loggedUser");

  if (loggedUser !== "Felipe") {
    alert("Acesso negado");

    return;
  }

  const history = JSON.parse(localStorage.getItem("loginHistory")) || [];

  let text = "HISTÓRICO DE LOGIN\n\n";

  history.forEach((item) => {
    text += `${item.user} - ${item.date} ${item.time}\n`;
  });

  alert(text);
});

/* ================================================= */
/* LEGENDA */
/* ================================================= */

function renderLegend() {
  const legendContainer = document.getElementById("legendContainer");

  legendContainer.innerHTML = "";

  let items = [];

  if (currentPreset === "custom") {
    items = [...presetData.work, ...presetData.relationship];
  } else {
    items = presetData[currentPreset];
  }

  items.forEach((item) => {
    const legendItem = document.createElement("div");

    legendItem.classList.add("legend-item");

    legendItem.innerHTML = `
  <span class="legend-color ${item.color}"></span>
  ${item.label}
`;

    legendContainer.appendChild(legendItem);
  });
}

/* ================================================= */
/* FILTROS */
/* ================================================= */

function renderFilters() {
  activeFilters = {};

  filtersContainer.innerHTML = "";

  let items = [];

  if (currentPreset === "work") {
    items = presetData.work;
  } else if (currentPreset === "relationship") {
    items = presetData.relationship;
  } else {
    items = [...presetData.work, ...presetData.relationship];
  }

  items.forEach((item) => {
    activeFilters[item.class] = true;

    const wrapper = document.createElement("label");

    wrapper.classList.add("filter-item");

    wrapper.innerHTML = `
  <input
    type="checkbox"
    checked
    data-filter="${item.class}"
  >

  ${item.label}
`;

    const checkbox = wrapper.querySelector("input");

    checkbox.addEventListener("change", function () {
      activeFilters[item.class] = checkbox.checked;

      updateFilters();
    });

    filtersContainer.appendChild(wrapper);
  });
}

/* ================================================= */
/* UPDATE FILTERS */
/* ================================================= */

function updateFilters() {
  const allDays = document.querySelectorAll(".day");

  allDays.forEach((day) => {
    let visible = false;

    Object.keys(activeFilters).forEach((filter) => {
      if (day.classList.contains(filter) && activeFilters[filter]) {
        visible = true;
      }
    });

    if (visible) {
      day.style.opacity = "1";
    } else {
      day.style.opacity = "0.15";
    }
  });
}
/* ================================================= */
/* CALENDARIO */
/* ================================================= */

function generateCalendar() {
  calendarContainer.innerHTML = "";

  for (let month = 0; month < 12; month++) {
    const monthDiv = document.createElement("div");

    monthDiv.classList.add("month");

    const title = document.createElement("h2");

    title.textContent = months[month];

    const daysGrid = document.createElement("div");

    daysGrid.classList.add("days-grid");

    weekDays.forEach((day) => {
      const dayName = document.createElement("div");

      dayName.classList.add("day-name");

      dayName.textContent = day;

      daysGrid.appendChild(dayName);
    });

    const firstDay = new Date(year, month, 1).getDay();

    const totalDays = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement("div");

      empty.classList.add("day", "empty");

      daysGrid.appendChild(empty);
    }

    for (let day = 1; day <= totalDays; day++) {
      const dayDiv = document.createElement("div");

      dayDiv.classList.add("day");

      const key = `${year}-${month}-${day}`;

      const dateSpan = document.createElement("span");

      dateSpan.classList.add("date");

      dateSpan.textContent = day;

      dayDiv.appendChild(dateSpan);

      if (
        day === 9 &&
        (currentPreset === "relationship" || currentPreset === "custom")
      ) {
        const heart = document.createElement("span");

        heart.classList.add("heart");

        heart.textContent = "❤️";

        dayDiv.appendChild(heart);
      }

      applyAutomaticScale(dayDiv, year, month, day);

      if (savedData[key]) {
        dayDiv.classList.add(savedData[key]);
      }

      dayDiv.addEventListener("click", function (e) {
        openDayMenu(e, dayDiv, key);
      });

      daysGrid.appendChild(dayDiv);
    }

    monthDiv.appendChild(title);

    monthDiv.appendChild(daysGrid);

    calendarContainer.appendChild(monthDiv);
  }

  updateFilters();
}

/* ================================================= */
/* MENU */
/* ================================================= */

function openDayMenu(event, dayDiv, key) {
  dayMenu.innerHTML = "";

  dayMenu.classList.remove("hidden");

  const menuWidth = 260;

  const menuHeight = 420;

  let posX = event.pageX;

  let posY = event.pageY;

  if (posX + menuWidth > window.innerWidth) {
    posX = window.innerWidth - menuWidth - 20;
  }

  if (posY + menuHeight > window.innerHeight) {
    posY = window.innerHeight - menuHeight - 20;
  }

  dayMenu.style.left = `${posX}px`;

  dayMenu.style.top = `${posY}px`;

  let items = [];

  if (currentPreset === "custom") {
    items = [...presetData.work, ...presetData.relationship];
  } else {
    items = presetData[currentPreset];
  }

  items.forEach((item) => {
    const button = document.createElement("button");

    button.innerHTML = item.label;

    button.addEventListener("click", function () {
      applyMark(dayDiv, key, item.class);

      dayMenu.classList.add("hidden");
    });

    dayMenu.appendChild(button);
  });

  const removeBtn = document.createElement("button");

  removeBtn.innerHTML = "❌ Remover";

  removeBtn.addEventListener("click", function () {
    removeMark(dayDiv, key);

    dayMenu.classList.add("hidden");
  });

  dayMenu.appendChild(removeBtn);
}

/* ================================================= */
/* APPLY */
/* ================================================= */

function applyMark(dayDiv, key, markClass) {
  const classes = [
    "work",
    "off",
    "relationship",
    "fertile",
    "period",
    "sold-off",
    "paid-off",
    "scheme-fixed",
    "scheme-return",
    "special-date",
    "travel",
  ];

  classes.forEach((c) => {
    dayDiv.classList.remove(c);
  });

  dayDiv.classList.add(markClass);

  savedData[key] = markClass;

  localStorage.setItem(getStorageKey(), JSON.stringify(savedData));

  updateFilters();
}

/* ================================================= */
/* REMOVE */
/* ================================================= */

function removeMark(dayDiv, key) {
  const classes = [
    "work",
    "off",
    "relationship",
    "fertile",
    "period",
    "sold-off",
    "paid-off",
    "scheme-fixed",
    "scheme-return",
    "special-date",
    "travel",
  ];

  classes.forEach((c) => {
    dayDiv.classList.remove(c);
  });

  delete savedData[key];

  applyAutomaticScale(
    dayDiv,
    year,
    Number(key.split("-")[1]),
    Number(key.split("-")[2]),
  );

  localStorage.setItem(getStorageKey(), JSON.stringify(savedData));

  updateFilters();
}

/* ================================================= */
/* ESCALA */
/* ================================================= */

function applyAutomaticScale(dayDiv, year, month, day) {
  if (currentPreset === "relationship") return;

  const currentDate = new Date(year, month, day);

  const dayWeek = currentDate.getDay();

  const weekNumber = getWeekNumber(currentDate);

  const fullWeek = weekNumber % 2 === 0;

  const dateKey = `${day}/${month + 1}`;

  const fixedDates = [
    "3/5",
    "29/5",
    "27/6",
    "25/7",
    "22/8",
    "19/9",
    "17/10",
    "14/11",
    "12/12",
  ];

  const returnDates = [
    "16/5",
    "14/6",
    "12/7",
    "9/8",
    "6/9",
    "4/10",
    "30/10",
    "27/11",
    "25/12",
  ];

  if (fixedDates.includes(dateKey)) {
    dayDiv.classList.add("scheme-fixed");

    return;
  }

  if (returnDates.includes(dateKey)) {
    dayDiv.classList.add("scheme-return");

    return;
  }

  if (fullWeek) {
    if (
      dayWeek === 1 ||
      dayWeek === 3 ||
      dayWeek === 5 ||
      dayWeek === 6 ||
      dayWeek === 0
    ) {
      dayDiv.classList.add("work");
    } else {
      dayDiv.classList.add("off");
    }
  } else {
    if (dayWeek === 2 || dayWeek === 4) {
      dayDiv.classList.add("work");
    } else {
      dayDiv.classList.add("off");
    }
  }
}

/* ================================================= */
/* WEEK NUMBER */
/* ================================================= */

function getWeekNumber(date) {
  const startDate = new Date(2026, 4, 25);

  const current = new Date(date);

  current.setHours(0, 0, 0, 0);

  startDate.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((current - startDate) / (1000 * 60 * 60 * 24));

  return Math.floor(diffDays / 7);
}

/* ================================================= */
/* LIMPAR */
/* ================================================= */

clearBtn.addEventListener("click", function () {
  const confirmClear = confirm("Deseja apagar as marcações deste preset?");

  if (!confirmClear) return;

  localStorage.removeItem(getStorageKey());

  savedData = {};

  generateCalendar();

  updateFilters();
});

/* ================================================= */
/* TROCAR PRESET */
/* ================================================= */

presetSelect.addEventListener("change", function () {
  currentPreset = presetSelect.value;

  savedData = getSavedData();

  generateCalendar();

  renderLegend();

  renderFilters();

  updateFilters();
});

/* ================================================= */
/* FECHAR MENU */
/* ================================================= */

document.addEventListener("click", function (e) {
  if (!dayMenu.contains(e.target) && !e.target.classList.contains("day")) {
    dayMenu.classList.add("hidden");
  }
});
