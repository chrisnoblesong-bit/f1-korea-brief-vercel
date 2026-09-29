export default async function handler(req, res) {
  try {
    // 요청에서 시즌 가져오기
    // 예: /api/schedule?season=2026
    const season = req.query.season || "current";

    // Jolpica F1 API
    const apiUrl =
      `https://api.jolpi.ca/ergast/f1/${season}.json`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`F1 API 오류: ${response.status}`);
    }

    const data = await response.json();

    const races =
      data?.MRData?.RaceTable?.Races || [];

    // 우리 사이트에서 사용하기 편한 형태로 변환
    const schedule = races.map((race) => ({
      round: race.round,
      raceName: race.raceName,

      circuit: {
        name: race.Circuit?.circuitName || "",
        location: race.Circuit?.Location?.locality || "",
        country: race.Circuit?.Location?.country || "",
      },

      date: race.date || "",
      time: race.time || "",

      sessions: {
        practice1: race.FirstPractice
          ? {
              date: race.FirstPractice.date || "",
              time: race.FirstPractice.time || "",
            }
          : null,

        practice2: race.SecondPractice
          ? {
              date: race.SecondPractice.date || "",
              time: race.SecondPractice.time || "",
            }
          : null,

        practice3: race.ThirdPractice
          ? {
              date: race.ThirdPractice.date || "",
              time: race.ThirdPractice.time || "",
            }
          : null,

        sprint: race.Sprint
          ? {
              date: race.Sprint.date || "",
              time: race.Sprint.time || "",
            }
          : null,

        qualifying: race.Qualifying
          ? {
              date: race.Qualifying.date || "",
              time: race.Qualifying.time || "",
            }
          : null,

        race: {
          date: race.date || "",
          time: race.time || "",
        },
      },
    }));

    res.status(200).json({
      success: true,
      season: season,
      count: schedule.length,
      races: schedule,
    });

  } catch (error) {
    console.error("Schedule API Error:", error);

    res.status(500).json({
      success: false,
      error: "F1 일정 데이터를 가져오지 못했습니다.",
      message: error.message,
    });
  }
}// ==========================================
// F1 일정 기능
// ==========================================

async function loadF1Schedule(season = "2026") {
  const scheduleContainer = document.getElementById("f1-schedule");

  if (!scheduleContainer) {
    console.error("f1-schedule 요소를 찾을 수 없습니다.");
    return;
  }

  // 로딩 표시
  scheduleContainer.innerHTML = `
    <div class="schedule-loading">
      <div class="loading-spinner"></div>
      <p>F1 일정을 불러오는 중...</p>
    </div>
  `;

  try {
    const response = await fetch(`/api/schedule?season=${season}`);

    if (!response.ok) {
      throw new Error(`서버 오류: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success || !data.races) {
      throw new Error("일정 데이터가 없습니다.");
    }

    displayF1Schedule(data.races);

  } catch (error) {
    console.error("F1 일정 불러오기 실패:", error);

    scheduleContainer.innerHTML = `
      <div class="schedule-error">
        <h3>⚠️ 일정을 불러오지 못했습니다.</h3>
        <p>${error.message}</p>
        <button onclick="loadF1Schedule('${season}')">
          다시 시도
        </button>
      </div>
    `;
  }
}


// ==========================================
// 일정 화면 표시
// ==========================================

function displayF1Schedule(races) {
  const container = document.getElementById("f1-schedule");

  if (!container) return;

  container.innerHTML = "";

  if (races.length === 0) {
    container.innerHTML = `
      <div class="schedule-empty">
        <p>등록된 F1 일정이 없습니다.</p>
      </div>
    `;
    return;
  }

  const now = new Date();

  races.forEach((race) => {
    const raceDate = new Date(
      `${race.date}T${race.time || "00:00:00"}`
    );

    const isPast = raceDate < now;

    const card = document.createElement("div");

    card.className = `race-card ${isPast ? "past-race" : "upcoming-race"}`;

    card.innerHTML = `
      <div class="race-header">

        <div class="race-round">
          ROUND ${race.round}
        </div>

        <div class="race-status">
          ${isPast ? "완료" : "예정"}
        </div>

      </div>


      <div class="race-main">

        <div class="race-info">

          <h2>${race.raceName}</h2>

          <p class="race-location">
            📍 ${race.circuit.country}
            ${race.circuit.location
              ? ` · ${race.circuit.location}`
              : ""}
          </p>

          <p class="circuit-name">
            🏁 ${race.circuit.name}
          </p>

        </div>


        <div class="race-date">

          <div class="date-day">
            ${formatRaceDate(race.date)}
          </div>

          <div class="date-time">
            ${race.time
              ? formatTime(race.time)
              : "시간 미정"}
          </div>

        </div>

      </div>


      <button
        class="schedule-detail-button"
        onclick="toggleRaceDetails(this)"
      >
        세션 일정 보기 ▼
      </button>


      <div class="race-details">

        ${createSession(
          "연습주행 1",
          race.sessions?.practice1
        )}

        ${createSession(
          "연습주행 2",
          race.sessions?.practice2
        )}

        ${createSession(
          "연습주행 3",
          race.sessions?.practice3
        )}

        ${createSession(
          "스프린트",
          race.sessions?.sprint
        )}

        ${createSession(
          "예선",
          race.sessions?.qualifying
        )}

        ${createSession(
          "결승",
          race.sessions?.race
        )}

      </div>
    `;

    container.appendChild(card);
  });
}


// ==========================================
// 세션 하나 만들기
// ==========================================

function createSession(name, session) {

  if (!session || !session.date) {
    return "";
  }

  return `
    <div class="session-row">

      <div class="session-name">
        ${name}
      </div>

      <div class="session-date">
        ${formatRaceDate(session.date)}
      </div>

      <div class="session-time">
        ${session.time
          ? formatTime(session.time)
          : "시간 미정"}
      </div>

    </div>
  `;
}


// ==========================================
// 날짜 표시
// ==========================================

function formatRaceDate(dateString) {

  if (!dateString) {
    return "날짜 미정";
  }

  const date = new Date(`${dateString}T00:00:00`);

  return date.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short"
  });
}


// ==========================================
// 시간 표시
// ==========================================

function formatTime(timeString) {

  if (!timeString) {
    return "시간 미정";
  }

  const [hour, minute] = timeString.split(":");

  return `${hour}:${minute}`;
}


// ==========================================
// 세션 상세 펼치기 / 접기
// ==========================================

function toggleRaceDetails(button) {

  const card = button.closest(".race-card");

  const details = card.querySelector(".race-details");

  if (!details) return;

  const isOpen = details.classList.contains("open");

  if (isOpen) {

    details.classList.remove("open");

    button.innerHTML = "세션 일정 보기 ▼";

  } else {

    details.classList.add("open");

    button.innerHTML = "세션 일정 숨기기 ▲";

  }
}


// ==========================================
// 시즌 변경
// ==========================================

function changeF1Season(season) {

  const title = document.getElementById("schedule-season-title");

  if (title) {
    title.textContent = `${season} F1 일정`;
  }

  loadF1Schedule(season);
}


// ==========================================
// 페이지 로딩
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

  // 일정 영역이 존재할 경우에만 실행
  const scheduleContainer =
    document.getElementById("f1-schedule");

  if (scheduleContainer) {
    loadF1Schedule("2026");
  }

});
