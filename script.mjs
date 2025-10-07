import { getData, addData } from "./storage.mjs";
import { getUserIds } from "./common.mjs";

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

function handleUserChange(event) {
  currentUser = event.target.value;

  if (!currentUser) {
    agendaDisplay.innerHTML =
      "<p>Please select a user to view their agenda.</p>";
    mainContent.style.display = "none"; // hide when no user selected
    return;
  }

  mainContent.style.display = "block"; // show when user selected
  displayAgenda(currentUser);
}

function displayAgenda(userId) {
  const userData = getData(userId);

  if (!userData || userData.length === 0) {
    agendaDisplay.innerHTML =
      "<p>No agenda items yet. Add a topic to get started!</p>";
    return;
  }

  // Example: render topics
  agendaDisplay.innerHTML = `
    <ul>
      ${userData.map((item) => `<li>${item.topicName} – ${item.startDate}</li>`).join("")}
    </ul>
  `;
}

// Populate user dropdown with user IDs
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

window.onload = function () {
  // get DOM elements
  userDropdown = document.getElementById("user-dropdown");
  agendaDisplay = document.getElementById("agenda-display");
  addTopicForm = document.getElementById("add-topic-form");
  topicNameInput = document.getElementById("topic-name");
  startDateInput = document.getElementById("start-date");
  mainContent = document.getElementById("main-content");

  populateUserDropdown();
  setDefaultDate();

  userDropdown.addEventListener("change", handleUserChange);
};
