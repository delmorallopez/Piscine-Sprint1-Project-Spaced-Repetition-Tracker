import { getData, addData } from "./storage.mjs";
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
    mainContent.style.display = "none"; // hide when no user selected
    agendaDisplay.innerHTML =
      "<p>Please select a user to view their agenda.</p>";
    return;
  }

  mainContent.style.display = "block"; // show when user selected
  displayAgenda(currentUser);
}

// Display agenda for a user in chronological order
function displayAgenda(userId) {
  const userData = getData(userId);

  if (!userData || userData.length === 0) {
    agendaDisplay.innerHTML =
      "<p>No agenda items yet. Add a topic to get started!</p>";
    return;
  }

  // Sort topics by startDate (earliest first)
  const sortedData = userData.slice().sort((a, b) => {
    // Convert date strings to Date objects for comparison
    const dateA = new Date(a.startDate);
    const dateB = new Date(b.startDate);
    return dateA - dateB; // ascending order
  });

  // Render sorted agenda
  agendaDisplay.innerHTML = `
    <ul>
      ${sortedData
        .map(
          (item) =>
            `<li>${item.topicName} – ${item.startDate}</li>`
        )
        .join("")}
    </ul>
  `;
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
window.onload = function () {
  // Get DOM elements
  userDropdown = document.getElementById("user-dropdown");
  agendaDisplay = document.getElementById("agenda-display");
  addTopicForm = document.getElementById("add-topic-form");
  topicNameInput = document.getElementById("topic-name");
  startDateInput = document.getElementById("start-date");
  mainContent = document.getElementById("main-content");

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
};
