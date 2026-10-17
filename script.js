const userContainer = document.getElementById("userContainer");
const searchInput = document.getElementById("searchInput");
const loading = document.getElementById("loading");
const error = document.getElementById("error");
const pagination = document.getElementById("pagination");

let currentPage = 1;
let totalUsers = 0;
let users_per_page = 8;
let currentSearchQuery = "";

const BASE_URL = "https://fakestoreapi.noksha.dev/api/users";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getUsers = async (page = 1) => {
  try {
    if (loading) loading.style.display = "block";
    if (error) error.innerText = "";

    await delay(500);

    const response = await fetch(BASE_URL);
    if (!response.ok) {
      throw new Error("API error");
    }

    const jsonResponse = await response.json();

    
    let usersList = jsonResponse.data || [];

    
    if (currentSearchQuery !== "") {
      usersList = usersList.filter((user) => {
        const name = (user.name || "").toLowerCase();
        const username = (user.username || "").toLowerCase();
        const email = (user.email || "").toLowerCase();
        const query = currentSearchQuery.toLowerCase();

        return (
          name.includes(query) ||
          username.includes(query) ||
          email.includes(query)
        );
      });
    }

    totalUsers = usersList.length;
    currentPage = page;

    // Client-side pagination slicing
    const startIndex = (page - 1) * users_per_page;
    const paginatedUsers = usersList.slice(
      startIndex,
      startIndex + users_per_page,
    );

    displayUsers(paginatedUsers);
    createPagination();
  } catch (err) {
    console.error(err);
    if (error) error.innerText = "Failed to fetch users";
  } finally {
    if (loading) loading.style.display = "none";
  }
};

// Initial Load
getUsers();

function createPagination() {
  pagination.innerHTML = "";
  const totalPage = Math.ceil(totalUsers / users_per_page);

  if (totalPage <= 1) return;

  // Previous Button
  const previousButton = document.createElement("button");
  previousButton.innerText = "<=";
  previousButton.disabled = currentPage === 1;

  previousButton.addEventListener("click", function () {
    if (currentPage > 1) {
      getUsers(currentPage - 1);
    }
  });

  pagination.appendChild(previousButton);

  // Numbered Page Buttons
  for (let page = 1; page <= totalPage; page++) {
    const button = document.createElement("button");
    button.textContent = page;

    if (page === currentPage) {
      button.style.fontWeight = "bold";
      button.style.backgroundColor = "#007bff";
      button.style.color = "#ffffff";
      button.style.borderColor = "#007bff";
    }

    button.addEventListener("click", function () {
      getUsers(page);
    });

    pagination.appendChild(button);
  }

  // Next Button
  const nextButton = document.createElement("button");
  nextButton.innerText = "=>";
  nextButton.disabled = currentPage === totalPage;

  nextButton.addEventListener("click", function () {
    if (currentPage < totalPage) {
      getUsers(currentPage + 1);
    }
  });

  pagination.appendChild(nextButton);
}

const displayUsers = (data) => {
  userContainer.innerHTML = "";

  if (!data || data.length === 0) {
    userContainer.innerHTML = `<h2 style="grid-column: 1/-1; text-align: center; color: #777;">No user found</h2>`;
    return;
  }

  data.forEach((element) => {
    const card = document.createElement("div");
    card.classList.add("user-card");

    // Screenshot ke fields ke mutabiq: name, username, email, role, phone[cite: 1]
    const fullName = element.name || "User";
    const userName = element.username ? `@${element.username}` : "";
    const role = element.role || "Member";
    const email = element.email || "N/A";
    const city =
      element.address && element.address.city ? element.address.city : "N/A";

    card.innerHTML = `
        <span class="role">${role}</span>
        <h2>${fullName}</h2>
        <p class="username" style="color: #666; font-size: 0.9rem; margin-bottom: 10px;">${userName}</p>
        <div class="contact_info">
            <div class="email">📧 ${email}</div>
            <div class="location">📍 ${city}</div>
        </div>
    `;
    userContainer.appendChild(card);
  });
};

// Search Input Event with Debounce
let searchTimeout;
searchInput.addEventListener("input", function () {
  clearTimeout(searchTimeout);

  searchTimeout = setTimeout(() => {
    currentSearchQuery = searchInput.value.trim();
    currentPage = 1;
    getUsers(1);
  }, 300);
});
