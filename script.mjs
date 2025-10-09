import { getData, addData, clearData } from "./storage.mjs";
import { getUserIds } from "./common.mjs";

// DOM elements
let userDropdown;
let agendaDisplay;
let addTopicForm;
let topicNameInput;
let startDateInput;
let mainContent;

// Currently selected user
let currentUser = "";

// Set date picker to today's date
function setDefaultDate() {
  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0];
  startDateInput.value = formattedDate;
}

// Handle user selection change
function handleUserChange(event) {
  currentUser = event.target.value;

  if (!currentUser) {
    // Hide main content without CSS
    mainContent.setAttribute("hidden", "");
    agendaDisplay.innerHTML =
      "<p>Please select a user to view their agenda.</p>";
    return;
  }

  mainContent.removeAttribute("hidden"); // show when user selected
  displayAgenda(currentUser);
}
function displayAgenda(userId) {
  const userData = getData(userId);

  if (!userData || userData.length === 0) {
    agendaDisplay.innerHTML =
      "<p>No agenda items yet. Add a topic to get started!</p>";
    return;
  }

  let allRevisions = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to midnight

  userData.forEach((item) => {
    const revisions = calculateRevisionDates(item.startDate);

    revisions.forEach((date) => {
      const revisionDate = new Date(date);
      revisionDate.setHours(0, 0, 0, 0);

      // Show only today's or future dates
      if (revisionDate >= today) {
        allRevisions.push({
          topicName: item.topicName,
          date: revisionDate,
        });
      }
    });
  });

  // Sort dates in order
  allRevisions.sort((a, b) => a.date - b.date);

  // Show message if all revisions are in the past
  if (allRevisions.length === 0) {
    agendaDisplay.innerHTML =
      "<p>All revisions for this user are in the past.</p>";
    return;
  }

  // Render list
  agendaDisplay.innerHTML = `
    <ul>
      ${allRevisions
        .map(
          (rev) =>
            `<li>${rev.topicName}, ${formatDateWithSuffix(rev.date)}</li>`
        )
        .join("")}
    </ul>
  `;
}

// Calculate spaced-repetition dates
export function calculateRevisionDates(startDateStr) {
  const startDate = new Date(startDateStr);

  const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const addMonths = (date, months) => {
    const result = new Date(date);
    const dayOfMonth = result.getDate();
    result.setMonth(result.getMonth() + months);

    if (result.getDate() !== dayOfMonth) {
      result.setDate(0); // Go to last day of previous month
    }
    return result;
  };

  const addYears = (date, years) => {
    const result = new Date(date);
    result.setFullYear(result.getFullYear() + years);
    return result;
  };

  return [
    addDays(startDate, 7), // +1 week
    addMonths(startDate, 1), // +1 month
    addMonths(startDate, 3), // +3 months
    addMonths(startDate, 6), // +6 months
    addYears(startDate, 1), // +1 year
  ];
}

// Format date with ordinal suffix
export function formatDateWithSuffix(dateInput) {
  const date = new Date(dateInput);
  const day = date.getDate();
  const year = date.getFullYear();
  const month = date.toLocaleString("en-GB", {
    month: "long",
    timeZone: "UTC",
  });

  // Day suffix
  let suffix = "th";
  if (day % 10 === 1 && day !== 11) suffix = "st";
  else if (day % 10 === 2 && day !== 12) suffix = "nd";
  else if (day % 10 === 3 && day !== 13) suffix = "rd";

  return `${day}${suffix} ${month} ${year}`;
}

// Populate user dropdown
function populateUserDropdown() {
  const userIds = getUserIds();

  userDropdown.innerHTML = '<option value="">No user selected</option>';

  userIds.forEach((userId) => {
    const option = document.createElement("option");
    option.value = userId;
    option.textContent = `User ${userId}`;
    userDropdown.appendChild(option);
  });
}

// Initialize everything once DOM is loaded
if (typeof window !== "undefined") {
  window.onload = function () {
    // Get DOM elements
    userDropdown = document.getElementById("user-dropdown");
    agendaDisplay = document.getElementById("agenda-display");
    addTopicForm = document.getElementById("add-topic-form");
    topicNameInput = document.getElementById("topic-name");
    startDateInput = document.getElementById("start-date");
    mainContent = document.getElementById("main-content");
    mainContent.setAttribute("hidden", "");

    // Populate dropdown & set default date
    populateUserDropdown();
    setDefaultDate();

    // Event listeners
    userDropdown.addEventListener("change", handleUserChange);

    addTopicForm.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!currentUser) {
        alert("Please select a user before adding topics.");
        return;
      }

      const topicName = topicNameInput.value.trim();
      const startDate = startDateInput.value;

      if (!topicName || !startDate) {
        alert("Please fill in all fields.");
        return;
      }

      const newTopic = { topicName, startDate };
      addData(currentUser, newTopic);

      // Clear form and reset date
      topicNameInput.value = "";
      setDefaultDate();

      // Refresh agenda
      displayAgenda(currentUser);
    });
    // Clear agenda button functionality
    const clearButton = document.getElementById("clear-agenda");
    clearButton.addEventListener("click", () => {
      if (!currentUser) {
        alert("Please select a user first!");
        return;
      }

      const confirmClear = confirm(
        "Are you sure you want to delete all topics for this user?"
      );

      if (!confirmClear) return;

      clearData(currentUser); // <-- removes user's stored data
      displayAgenda(currentUser); // refresh agenda display
      alert("Agenda cleared!");
    });
  };
}
