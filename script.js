function getCounts() {
  const logs = JSON.parse(localStorage.getItem("logs")) || [];
  const counts = {};

  logs.forEach(log => {
    counts[log.date] = (counts[log.date] || 0) + 1;
  });

  return counts;
}
function generateDates(days = 365) {
  const dates = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(new Date(d)); 
  }

  return dates;
}
function getLevel(count) {
  if (count >= 8) return "level-4";
  if (count >= 5) return "level-3";
  if (count >= 3) return "level-2";
  if (count >= 1) return "level-1";
  return "";
}
function renderHeatmap() {
  const container = document.getElementById("heatmap");
  container.innerHTML = "";

  const counts = getCounts();
  const dates = generateDates(365);

  dates.forEach(dateObj => {
    const dateStr = dateObj.toISOString().slice(0, 10);

    const div = document.createElement("div");
    div.className = "day";

    const count = counts[dateStr] || 0;
    const level = getLevel(count);

    if (level) div.classList.add(level);

    div.title = `${dateStr} : ${count} aktivitas`;

    container.appendChild(div);
  });
}
document.addEventListener("DOMContentLoaded", () => {
  renderHeatmap();
  renderMonths();
});

addLog();
renderHeatmap();

function addMessage() {
  const input = document.getElementById("userInput");
  const history = document.getElementById("history");

  if (input.value.trim() === "") return;

  const msg = document.createElement("div");
  msg.className = "message";
  msg.textContent = input.value;

  history.appendChild(msg);

  input.value = "";
  history.scrollTop = history.scrollHeight;

  addLog();        
  renderHeatmap(); 
}

document.getElementById("userInput").addEventListener("keypress", function(e) {
  if (e.key === "Enter") {
    addMessage();
  }
});


function addLog() {
  const logs = JSON.parse(localStorage.getItem("logs")) || [];

  const today = new Date().toISOString().slice(0, 10);

  logs.push({
    date: today,
    text: "activity"
  });

  localStorage.setItem("logs", JSON.stringify(logs));
}

function renderMonths() {
  const container = document.getElementById("months");
  container.innerHTML = "";

  const dates = generateDates(365);

  let lastMonth = -1;
  let weekIndex = 0;

  dates.forEach((date, i) => {
    const day = date.getDay(); 
    const month = date.getMonth();

    if (day === 0 && i !== 0) {
      weekIndex++;
    }

    if (date.getDate() === 1) {
      const span = document.createElement("span");
      span.textContent = date.toLocaleString("default", { month: "short" });
      span.className = "month-label";

      span.style.gridColumnStart = weekIndex + 1;

      container.appendChild(span);
      lastMonth = month;
    }
  });
}
//day-clock
function updateClock() {
  const now = new Date();
  let hour = now.getHours();
  let minute = now.getMinutes();
  let second = now.getSeconds();

  hour = String(hour).padStart(2,"0")
  minute = String(minute).padStart(2, "0")
  second = String(second).padStart(2,"0")

  document.getElementById("clock").textContent = `${hour}:${minute}:${second}`
}
updateClock();
setInterval(updateClock, 1000)

function updateDay() {
  const now = new Date()
  const days =  [
    "Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jum'at", "Sabtu"
  ]
  const dayName = days[now.getDay()]
  document.getElementById("day").textContent = dayName
}
setInterval(updateDay, 1000)
updateDay();

//menu
const DailyTask = document.getElementById('dailytask');
DailyTask.addEventListener('click', () => {
  if (dailyform.classList.contains('active')) {
    dailyform.classList.remove('active');
  } else {
    dailyform.classList.add('active');
  }
})
//hiddn
const hiddenElements = document.querySelectorAll('.hidden');

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {

        if(entry.isIntersecting){
            entry.target.classList.add('show');
        } else {
            entry.target.classList.remove('show');
        }

    });
});

hiddenElements.forEach((el) => observer.observe(el));