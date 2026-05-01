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
    const d = new Date();
    d.setDate(today.getDate() - i);

    dates.push(d.toISOString().slice(0, 10));
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

  dates.forEach(date => {
    const div = document.createElement("div");
    div.className = "day";

    const count = counts[date] || 0;
    const level = getLevel(count);

    if (level) div.classList.add(level);

    div.title = `${date} : ${count} aktivitas`;

    container.appendChild(div);
  });
}
document.addEventListener("DOMContentLoaded", () => {
  renderHeatmap();
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
