// ============================================================
// WHY CALENDAR - JAVASCRIPT
// ============================================================

// ============================================================
// STATE & DATA
// ============================================================

// Calendar state
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();
let selectedDate = new Date();

// Today reference
const today = new Date();
const todayYear = today.getFullYear();
const todayMonth = today.getMonth();
const todayDay = today.getDate();

// Month names in Chinese
const monthNames = [
  '一月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '十一月', '十二月'
];

// Weekday names in Chinese
const weekdayNames = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

// ============================================================
// DOM ELEMENTS
// ============================================================

const elements = {
  // Calendar
  calendarCard: document.querySelector('.calendar-card'),
  daysGrid: document.getElementById('daysGrid'),
  currentMonth: document.getElementById('currentMonth'),
  currentYear: document.getElementById('currentYear'),
  prevMonth: document.getElementById('prevMonth'),
  nextMonth: document.getElementById('nextMonth'),
  prevYear: document.getElementById('prevYear'),
  nextYear: document.getElementById('nextYear'),
  todayBtn: document.getElementById('todayBtn'),

  // Date & Time
  dateDay: document.getElementById('dateDay'),
  dateWeekday: document.getElementById('dateWeekday'),
  dateFull: document.getElementById('dateFull'),
  timeHours: document.getElementById('timeHours'),
  timeMinutes: document.getElementById('timeMinutes'),
  timeSeconds: document.getElementById('timeSeconds'),
  digitalTime: document.getElementById('digitalTime'),

  // Pickers
  monthPicker: document.getElementById('monthPicker'),
  monthPickerTrigger: document.getElementById('monthPickerTrigger'),
  monthPickerYear: document.getElementById('monthPickerYear'),
  monthPickerPrev: document.getElementById('monthPickerPrev'),
  monthPickerNext: document.getElementById('monthPickerNext'),
  monthGrid: document.getElementById('monthGrid'),
  yearPicker: document.getElementById('yearPicker'),
  yearPickerTrigger: document.getElementById('yearPickerTrigger'),
  yearPickerRange: document.getElementById('yearPickerRange'),
  yearPickerPrev: document.getElementById('yearPickerPrev'),
  yearPickerNext: document.getElementById('yearPickerNext'),
  yearGrid: document.getElementById('yearGrid'),
  fullscreenToggle: document.getElementById('fullscreenToggle')
};

// ============================================================
// CALENDAR FUNCTIONS
// ============================================================

// Get number of days in a month
function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

// Get first day of month (0 = Sunday, 1 = Monday, etc.)
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

// Check if two dates are the same day
function isSameDay(date1, date2) {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

// Check if a date is today
function isToday(year, month, day) {
  return todayYear === year &&
         todayMonth === month &&
         todayDay === day;
}

// Render calendar
function renderCalendar() {
  const card = elements.calendarCard;
  const currentHeight = card ? card.offsetHeight : 0;

  // Clear grid
  elements.daysGrid.innerHTML = '';

  // Update header
  elements.currentMonth.textContent = `${currentYear}年 ${monthNames[currentMonth]}`;
  elements.currentYear.textContent = currentYear;

  // Get calendar data
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.className = 'day-cell empty';
    elements.daysGrid.appendChild(emptyCell);
  }

  // Add day cells
  for (let day = 1; day <= daysInMonth; day++) {
    const dayCell = document.createElement('div');
    dayCell.className = 'day-cell';
    dayCell.textContent = day;

    // Highlight today's date
    if (isToday(currentYear, currentMonth, day)) {
      dayCell.classList.add('today');
    }

    // Highlight selected date
    if (isSameDay(new Date(currentYear, currentMonth, day), selectedDate)) {
      dayCell.classList.add('selected');
    }

    // Add click handler
    dayCell.addEventListener('click', () => {
      selectDate(currentYear, currentMonth, day);
    });

    elements.daysGrid.appendChild(dayCell);
  }

  // Animate height change
  if (card) {
    const newHeight = card.offsetHeight;
    if (currentHeight !== newHeight) {
      card.style.height = currentHeight + 'px';
      card.style.overflow = 'hidden';
      card.offsetHeight; // Force reflow
      card.style.height = newHeight + 'px';
      card.addEventListener('transitionend', function onTransitionEnd() {
        card.style.height = '';
        card.style.overflow = '';
        card.removeEventListener('transitionend', onTransitionEnd);
      }, { once: true });
    }
  }

  // Update today button visibility
  updateTodayButton();
}

// Select a date
function selectDate(year, month, day) {
  selectedDate = new Date(year, month, day);
  renderCalendar();
  updateDateDisplay();
  updateTodayButton();
}

// Go to today
function goToToday() {
  currentYear = todayYear;
  currentMonth = todayMonth;
  selectedDate = new Date(todayYear, todayMonth, todayDay);
  renderCalendar();
  updateDateDisplay();
  updateTodayButton();
}

// Update today button state
function updateTodayButton() {
  const isCurrentMonth = (currentYear === todayYear && currentMonth === todayMonth);
  elements.todayBtn.classList.toggle('hidden', isCurrentMonth);
}

// Navigation functions
function goToPrevMonth() {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar();
}

function goToNextMonth() {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar();
}

function goToPrevYear() {
  currentYear--;
  renderCalendar();
}

function goToNextYear() {
  currentYear++;
  renderCalendar();
}

// ============================================================
// DATE & TIME FUNCTIONS
// ============================================================

// Update date display
function updateDateDisplay() {
  const date = selectedDate;
  elements.dateDay.textContent = date.getDate();
  elements.dateWeekday.textContent = weekdayNames[date.getDay()];
  elements.dateFull.textContent = `${date.getFullYear()}年 ${monthNames[date.getMonth()]} ${date.getDate()}日`;

}

// Update time display
function updateTimeDisplay() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  elements.timeHours.textContent = hours;
  elements.timeMinutes.textContent = minutes;
  elements.timeSeconds.textContent = seconds;

  // Update digital time format
  const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
  const hour12 = now.getHours() % 12 || 12;
  elements.digitalTime.textContent = `${hour12}:${minutes}:${seconds} ${ampm}`;

  // Update date display every minute to sync with real time
  const currentDate = new Date();
  if (currentDate.getMinutes() === 0 && currentDate.getSeconds() === 0) {
    updateDateDisplay();
  }
}

// ============================================================
// PICKER FUNCTIONS
// ============================================================

// Month Picker
let monthPickerYear = currentYear;

function openMonthPicker() {
  monthPickerYear = currentYear;
  elements.monthPicker.classList.add('active');
  requestAnimationFrame(() => {
    renderMonthPicker();
  });
}

function closeMonthPicker() {
  elements.monthPicker.classList.remove('active');
}

function renderMonthPicker() {
  elements.monthPickerYear.textContent = monthPickerYear + '年';
  elements.monthGrid.innerHTML = '';

  monthNames.forEach((name, index) => {
    const item = document.createElement('div');
    item.className = 'month-item';
    if (index === currentMonth && monthPickerYear === currentYear) {
      item.classList.add('selected');
    }
    item.textContent = name;
    item.addEventListener('click', () => {
      currentYear = monthPickerYear;
      currentMonth = index;
      closeMonthPicker();
      renderCalendar();
      updateDateDisplay();
    });
    elements.monthGrid.appendChild(item);
  });
}

function changeMonthPickerYear(delta) {
  monthPickerYear += delta;
  renderMonthPicker();
}

// Year Picker
const YEAR_RANGE = 10;
let yearPickerStart = Math.floor(currentYear / YEAR_RANGE) * YEAR_RANGE;

function openYearPicker() {
  yearPickerStart = Math.floor(currentYear / YEAR_RANGE) * YEAR_RANGE;
  elements.yearPicker.classList.add('active');
  requestAnimationFrame(() => {
    renderYearPicker();
  });
}

function closeYearPicker() {
  elements.yearPicker.classList.remove('active');
}

function renderYearPicker() {
  const yearPickerEnd = yearPickerStart + YEAR_RANGE - 1;
  elements.yearPickerRange.textContent = `${yearPickerStart} - ${yearPickerEnd}`;
  elements.yearGrid.innerHTML = '';

  for (let year = yearPickerStart; year <= yearPickerEnd; year++) {
    const item = document.createElement('div');
    item.className = 'year-item';
    if (year === currentYear) {
      item.classList.add('selected');
    }
    item.textContent = year;
    item.addEventListener('click', () => {
      currentYear = year;
      closeYearPicker();
      renderCalendar();
      updateDateDisplay();
    });
    elements.yearGrid.appendChild(item);
  }
}

function changeYearPickerRange(delta) {
  yearPickerStart += delta * YEAR_RANGE;
  renderYearPicker();
}

// ============================================================
// FULLSCREEN FUNCTIONS
// ============================================================
function syncFullscreenUI() {
  const isFullscreen = !!document.fullscreenElement;
  document.body.classList.toggle('is-fullscreen', isFullscreen);
  if (elements.fullscreenToggle) {
    elements.fullscreenToggle.textContent = isFullscreen ? '退出全屏' : '进入全屏';
    elements.fullscreenToggle.setAttribute('aria-label', isFullscreen ? '退出全屏' : '进入全屏');
  }
}

async function toggleFullscreen() {
  if (!elements.fullscreenToggle) return;
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  } catch (_) {
    // Keep silent to avoid interrupting calendar usage.
  } finally {
    syncFullscreenUI();
  }
}

// ============================================================
// EVENT LISTENERS
// ============================================================

// Calendar navigation
elements.prevMonth.addEventListener('click', goToPrevMonth);
elements.nextMonth.addEventListener('click', goToNextMonth);
elements.prevYear.addEventListener('click', goToPrevYear);
elements.nextYear.addEventListener('click', goToNextYear);
elements.todayBtn.addEventListener('click', goToToday);

// Month Picker
elements.monthPickerTrigger.addEventListener('click', openMonthPicker);
elements.monthPickerPrev.addEventListener('click', () => changeMonthPickerYear(-1));
elements.monthPickerNext.addEventListener('click', () => changeMonthPickerYear(1));
elements.monthPicker.querySelector('.picker-overlay').addEventListener('click', closeMonthPicker);

// Year Picker
elements.yearPickerTrigger.addEventListener('click', openYearPicker);
elements.yearPickerPrev.addEventListener('click', () => changeYearPickerRange(-1));
elements.yearPickerNext.addEventListener('click', () => changeYearPickerRange(1));
elements.yearPicker.querySelector('.picker-overlay').addEventListener('click', closeYearPicker);

// Fullscreen
if (elements.fullscreenToggle) {
  elements.fullscreenToggle.addEventListener('click', toggleFullscreen);
}
document.addEventListener('fullscreenchange', syncFullscreenUI);

// ============================================================
// INITIALIZATION
// ============================================================

// Initialize calendar
renderCalendar();
updateDateDisplay();
updateTimeDisplay();
syncFullscreenUI();

// Update time every second
setInterval(updateTimeDisplay, 1000);
