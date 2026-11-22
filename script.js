
// ==========================================
// MIT STUDY TASK MANAGER
// COMPLETE JAVASCRIPT
// ==========================================


// ==========================================
// 1. DATA STORAGE
// ==========================================

let tasks = JSON.parse(localStorage.getItem("studyTasks")) || [];

let subjects = JSON.parse(localStorage.getItem("studySubjects")) || [
    "Data Structures",
    "Mathematics",
    "Java Programming",
    "Database",
    "Web Development"
];

function saveTasks() {
    localStorage.setItem("studyTasks", JSON.stringify(tasks));
}

function saveSubjects() {
    localStorage.setItem("studySubjects", JSON.stringify(subjects));
}


// ==========================================
// 2. LOGIN AND LOGOUT
// ==========================================

function loginStudent(event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    if (username === "aniket" && password === "aniket123") {
        localStorage.setItem("loggedIn", "true");
        window.location.href = "dashboard.html";
    } else {
        document.getElementById("loginError").textContent =
            "Invalid username or password!";
    }
}

function logoutStudent() {
    localStorage.removeItem("loggedIn");
    window.location.href = "index.html";
}


// ==========================================
// 3. ASSIGNMENTS
// ==========================================

function addAssignment() {
    const name = prompt("Enter assignment name:");
    if (!name || !name.trim()) return;

    const subject = prompt("Enter subject:");
    if (!subject || !subject.trim()) return;

    const deadline = prompt("Enter deadline (YYYY-MM-DD):");

    if (!deadline || !/^\d{4}-\d{2}-\d{2}$/.test(deadline)) {
        alert("Please enter date in YYYY-MM-DD format.");
        return;
    }

    const validDate = new Date(deadline + "T00:00:00");

    if (isNaN(validDate.getTime()) ||
        validDate.toISOString().slice(0, 10) !== deadline) {
        alert("Please enter a valid date.");
        return;
    }

    tasks.push({
        id: Date.now(),
        name: name.trim(),
        subject: subject.trim(),
        deadline: deadline,
        completed: false
    });

    saveTasks();
    renderAssignments();
}

function toggleAssignment(id) {
    tasks = tasks.map(task =>
        task.id === id
            ? { ...task, completed: !task.completed }
            : task
    );

    saveTasks();
    renderAssignments();
}

function deleteAssignment(id) {
    if (!confirm("Are you sure you want to delete this assignment?")) {
        return;
    }

    tasks = tasks.filter(task => task.id !== id);

    saveTasks();
    renderAssignments();
}

function editAssignment(id) {
    const task = tasks.find(task => task.id === id);

    if (!task) return;

    const name = prompt("Edit assignment name:", task.name);
    if (!name || !name.trim()) return;

    const subject = prompt("Edit subject:", task.subject);
    if (!subject || !subject.trim()) return;

    const deadline = prompt("Edit deadline (YYYY-MM-DD):", task.deadline);

    if (!deadline || !/^\d{4}-\d{2}-\d{2}$/.test(deadline)) {
        alert("Enter date in YYYY-MM-DD format.");
        return;
    }

    const validDate = new Date(deadline + "T00:00:00");

    if (isNaN(validDate.getTime()) ||
        validDate.toISOString().slice(0, 10) !== deadline) {
        alert("Please enter a valid date.");
        return;
    }

    task.name = name.trim();
    task.subject = subject.trim();
    task.deadline = deadline;

    saveTasks();
    renderAssignments();
}


// ==========================================
// 4. DISPLAY ASSIGNMENTS
// ==========================================

function renderAssignments() {
    const list = document.getElementById("assignmentList");

    if (!list) return;

    list.innerHTML = "";

    const searchInput = document.getElementById("assignmentSearch");
    const searchText = searchInput
        ? searchInput.value.toLowerCase().trim()
        : "";

    const filteredTasks = tasks.filter(task =>
        task.name.toLowerCase().includes(searchText) ||
        task.subject.toLowerCase().includes(searchText)
    );

    if (filteredTasks.length === 0) {
        list.textContent = tasks.length === 0
            ? "No assignments yet. Click + New Assignment."
            : "No matching assignments found.";
    }

    filteredTasks.forEach(task => {
        const item = document.createElement("div");

        item.className = "task";
        item.style.cssText =
            "padding:14px;margin-top:12px;border:1px solid #293653;border-radius:12px;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap";

        const info = document.createElement("div");

        const heading = document.createElement("strong");
        heading.textContent = task.name + (task.completed ? " ✓" : "");

        const details = document.createElement("p");
        details.textContent =
            task.subject + " | Due: " + task.deadline;

        info.append(heading, details);

        const actions = document.createElement("div");

        const completeButton = document.createElement("button");
        completeButton.textContent = task.completed ? "Undo" : "Complete";
        completeButton.onclick = () => toggleAssignment(task.id);

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.onclick = () => editAssignment(task.id);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.onclick = () => deleteAssignment(task.id);

        actions.append(completeButton, editButton, deleteButton);

        item.append(info, actions);
        list.appendChild(item);
    });

    updateStatistics();
    renderCalendar();
}


// ==========================================
// 5. DASHBOARD STATISTICS
// ==========================================

function updateStatistics() {
    const total = tasks.length;

    const completed = tasks.filter(
        task => task.completed
    ).length;

    const pending = total - completed;

    const percentage = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    const values = document.querySelectorAll(".stat-card h2");

    if (values.length >= 3) {
        values[0].textContent = total;
        values[1].textContent = pending;
        values[2].textContent = completed;
    }

    const analyticsTotal = document.getElementById("analyticsTotal");
    const analyticsCompleted = document.getElementById("analyticsCompleted");
    const analyticsPending = document.getElementById("analyticsPending");
    const analyticsPercentage = document.getElementById("analyticsPercentage");
    const analyticsBar = document.getElementById("analyticsBar");

    if (analyticsTotal) analyticsTotal.textContent = total;
    if (analyticsCompleted) analyticsCompleted.textContent = completed;
    if (analyticsPending) analyticsPending.textContent = pending;
    if (analyticsPercentage) analyticsPercentage.textContent = percentage + "%";
    if (analyticsBar) analyticsBar.style.width = percentage + "%";
}


// ==========================================
// 6. CALENDAR
// ==========================================

function renderCalendar() {
    const calendar = document.getElementById("calendarList");

    if (!calendar) return;

    calendar.innerHTML = "";

    const upcoming = [...tasks].sort((a, b) =>
        a.deadline.localeCompare(b.deadline)
    );

    if (upcoming.length === 0) {
        calendar.textContent = "No upcoming deadlines.";
        return;
    }

    upcoming.forEach(task => {
        const row = document.createElement("p");

        row.textContent =
            "📌 " + task.deadline + " — " +
            task.name + " (" + task.subject + ")" +
            (task.completed ? " ✓ Completed" : "");

        calendar.appendChild(row);
    });
}


// ==========================================
// 7. SUBJECT MANAGEMENT
// ==========================================

function addSubject() {
    const name = prompt("Enter subject name:");

    if (!name || !name.trim()) return;

    const exists = subjects.some(
        subject => subject.toLowerCase() === name.trim().toLowerCase()
    );

    if (exists) {
        alert("This subject already exists.");
        return;
    }

    subjects.push(name.trim());

    saveSubjects();
    renderSubjects();
}

function deleteSubject(index) {
    if (!confirm("Delete this subject?")) return;

    subjects.splice(index, 1);

    saveSubjects();
    renderSubjects();
}

function renderSubjects() {
    const list = document.getElementById("subjectsList");

    if (!list) return;

    list.innerHTML = "";

    if (subjects.length === 0) {
        list.textContent = "No subjects added yet.";
        return;
    }

    subjects.forEach((subject, index) => {
        const item = document.createElement("p");

        item.textContent = "📘 " + subject + " ";

        const button = document.createElement("button");
        button.textContent = "Delete";
        button.onclick = () => deleteSubject(index);

        item.appendChild(button);
        list.appendChild(item);
    });
}


// ==========================================
// 8. SIDEBAR NAVIGATION
// ==========================================

function setupNavigation() {
    document.querySelectorAll(".sidebar nav a").forEach(link => {

        link.addEventListener("click", function(event) {
            const target = this.getAttribute("href");

            if (!target || !target.startsWith("#")) return;

            event.preventDefault();

            document.querySelectorAll(".sidebar nav a").forEach(a => {
                a.classList.remove("active");
            });

            this.classList.add("active");

            const section = document.querySelector(target);

            if (section) {
                section.scrollIntoView({
                    behavior: "smooth"
                });
            }
        });

    });
}


// ==========================================
// 9. FOCUS TIMER
// ==========================================

let timerSeconds =
    (Number(localStorage.getItem("studyDuration")) || 25) * 60;

let timerInterval = null;

function updateTimerDisplay() {
    const timer = document.querySelector(".timer h1");

    if (!timer) return;

    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;

    timer.textContent =
        String(minutes).padStart(2, "0") + ":" +
        String(seconds).padStart(2, "0");
}

function startTimer() {
    if (timerInterval) return;

    if (timerSeconds <= 0) {
        resetTimer();
    }

    timerInterval = setInterval(() => {

        if (timerSeconds > 0) {
            timerSeconds--;
            updateTimerDisplay();
        } else {
            clearInterval(timerInterval);
            timerInterval = null;
            alert("Focus session completed! Great work.");
        }

    }, 1000);
}

function resetTimer() {
    clearInterval(timerInterval);

    timerInterval = null;

    timerSeconds =
        (Number(localStorage.getItem("studyDuration")) || 25) * 60;

    updateTimerDisplay();
}

function setupTimerButtons() {
    const startButton = document.getElementById("startTimer");
    const resetButton = document.getElementById("resetTimer");

    if (startButton) {
        startButton.onclick = startTimer;
    }

    if (resetButton) {
        resetButton.onclick = resetTimer;
    }
}


// ==========================================
// 10. SETTINGS
// ==========================================

function saveSettings() {
    const nameInput = document.getElementById("studentNameInput");
    const durationInput = document.getElementById("studyDuration");

    if (!nameInput || !durationInput) return;

    const name = nameInput.value.trim();
    const duration = durationInput.value;

    if (!name) {
        alert("Please enter your name.");
        return;
    }

    localStorage.setItem("studentName", name);
    localStorage.setItem("studyDuration", duration);

    updateStudentName();
    resetTimer();

    const message = document.getElementById("settingsMessage");

    if (message) {
        message.textContent = "Settings saved successfully!";
    }
}

function updateStudentName() {
    const name = localStorage.getItem("studentName") || "Aniket";

    const display = document.getElementById("studentNameDisplay");
    const welcome = document.getElementById("welcomeName");
    const logo = document.getElementById("profileLogo");
    const input = document.getElementById("studentNameInput");

    if (display) display.textContent = name;
    if (welcome) welcome.textContent = name;
    if (logo) logo.textContent = name.charAt(0).toUpperCase();
    if (input) input.value = name;
}

function loadSettings() {
    updateStudentName();

    const durationInput = document.getElementById("studyDuration");

    if (durationInput) {
        durationInput.value =
            localStorage.getItem("studyDuration") || "25";
    }
}


// ==========================================
// 11. BUTTONS AND SEARCH
// ==========================================

function setupAssignmentButtons() {
    document.querySelectorAll(".new-assignment").forEach(button => {
        button.onclick = addAssignment;
    });
}

function setupSearch() {
    const searchInput = document.getElementById("assignmentSearch");

    if (searchInput) {
        searchInput.addEventListener("input", renderAssignments);
    }
}


// ==========================================
// 12. WEBSITE STARTUP
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    renderAssignments();
    renderSubjects();
    renderCalendar();

    updateStatistics();
    loadSettings();

    setupNavigation();
    setupTimerButtons();
    setupAssignmentButtons();
    setupSearch();

    updateTimerDisplay();

});
