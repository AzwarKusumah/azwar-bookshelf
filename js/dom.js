const bookList = [];
const STORAGE_KEY = "BOOK_LIST";
const SAVED_EVENTS = "saved-books-events";
const RENDER_EVENTS = "render-events";

const INPUT_TITLE = document.getElementById("title");
const INPUT_AUTHOR = document.getElementById("author");
const INPUT_YEAR = document.getElementById("yearBook");
const INPUT_COMPLETE = document.getElementById("isCompleted");

function isStorageExist() {
  if (typeof Storage === "undefined") {
    alert("Storage is not available");
    return false;
  }
  return true;
}

function saveData() {
  if (isStorageExist()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookList));
    document.dispatchEvent(new Event(SAVED_EVENTS));
  }
}

function loadData() {
  const bookLoad = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (bookLoad !== null) bookLoad.forEach((book) => bookList.push(book));
  document.dispatchEvent(new Event(RENDER_EVENTS));
}

function generateId() {
  return "DCDING" + Date.now();
}

function addBook() {
  const id = generateId();
  const title = INPUT_TITLE.value;
  const author = INPUT_AUTHOR.value;
  const year = INPUT_YEAR.value;
  const isCompleted = INPUT_COMPLETE.checked;

  const book = { id, title, author, year, isCompleted };
  bookList.push(book);
  document.dispatchEvent(new Event(RENDER_EVENTS));
  saveData();
}

function findData(bookId) {
  for (const book of bookList) {
    if (book.id === bookId) return book;
  }
  return null;
}

function setBookCompleted(bookId) {
  const bookTarget = findData(bookId);
  if (bookTarget === null) return;
  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENTS));
  saveData();
}

function setBookUncompleted(bookId) {
  const bookTarget = findData(bookId);
  if (bookTarget === null) return;
  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENTS));
  saveData();
}

function editBookModal(book) {
  const editModal = document.getElementById("editBookModal");
  const editTitleInput = document.getElementById("editTitle");
  const editAuthorInput = document.getElementById("editAuthor");
  const editYearInput = document.getElementById("editYear");
  const editCompleteInput = document.getElementById("editComplete");

  editTitleInput.value = book.title;
  editAuthorInput.value = book.author;
  editYearInput.value = book.year;
  editCompleteInput.checked = book.isCompleted;

  editModal.removeAttribute("hidden");

  editModal.dataset.bookId = book.id;

  document
    .getElementById("saveEditModal")
    .addEventListener("click", function () {
      const bookId = document.getElementById("editBookModal").dataset.bookId;
      const book = findData(bookId);
      if (book) {
        book.title = document.getElementById("editTitle").value;
        book.author = document.getElementById("editAuthor").value;
        book.year = document.getElementById("editYear").value;
        book.isCompleted = document.getElementById("editComplete").checked;
        saveData();
        document.getElementById("editBookModal").setAttribute("hidden", "");
        document.dispatchEvent(new Event(RENDER_EVENTS));
      }
    });

  document
    .getElementById("cancelEditModal")
    .addEventListener("click", function () {
      document.getElementById("editBookModal").setAttribute("hidden", "");
    });
}

function removeBook(bookId) {
  const bookTarget = bookList.indexOf(findData(bookId));
  if (bookTarget === -1) return;
  bookList.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENTS));
  saveData();
}

function deleteBookModal(book) {
  const deleteBookModal = document.getElementById("deleteBookModal");
  deleteBookModal.removeAttribute("hidden");

  deleteBookModal.querySelector("#deleteModal").onclick = function () {
    removeBook(book.id);
    deleteBookModal.setAttribute("hidden", "");
  };

  document.getElementById("cancelModal").addEventListener("click", function () {
    document.getElementById("deleteBookModal").setAttribute("hidden", "");
  });
}

function makeBookList(book) {
  const bookItem = document.createElement("article");
  bookItem.setAttribute("id", `${book.id}`);
  bookItem.classList.add("book-item");

  const contentBookItem = document.createElement("div");
  contentBookItem.classList.add("content-book-item");
  contentBookItem.innerHTML = `
        <span class="book-title">${book.title}</span>
        <div class="book-detail">
            <section>
                <i class='bx bxs-pencil' ></i>
                <span>${book.author}</span>
            </section>
            <section>
                <i class='bx bxs-calendar' ></i>
                <span>${book.year}</span>
            </section>
        </div>
    `;

  const actionBookItem = document.createElement("div");
  actionBookItem.classList.add("action-item");

  const actionButton = document.createElement("button");
  actionButton.classList.add("btn", "icon");
  actionButton.innerHTML = book.isCompleted
    ? `<i class='bx bxs-check-square' style='color:#b63f45' ></i>`
    : `<i class='bx bx-check-square' ></i>`;
  actionButton.addEventListener("click", function () {
    book.isCompleted ? setBookUncompleted(book.id) : setBookCompleted(book.id);
  });

  const editButton = document.createElement("button");
  editButton.classList.add("btn", "icon");
  editButton.innerHTML = `<i class='bx bx-edit' ></i>`;
  editButton.addEventListener("click", function () {
    editBookModal(book);
  });

  const deleteButton = document.createElement("button");
  deleteButton.classList.add("btn", "icon");
  deleteButton.innerHTML = `<i class='bx bx-trash' ></i>`;
  deleteButton.addEventListener("click", function () {
    deleteBookModal(book);
  });

  actionBookItem.appendChild(actionButton);
  actionBookItem.appendChild(editButton);
  actionBookItem.appendChild(deleteButton);
  bookItem.appendChild(contentBookItem);
  bookItem.appendChild(actionBookItem);

  return bookItem;
}

function searchBook() {
  const buttonSearch = document.querySelector("#buttonSearch");
  buttonSearch.addEventListener("click", function (q) {
    const queryBook = document.querySelector("#searchBox").value;
    const bookItemSearch = document.querySelectorAll(".book-item");

    bookItemSearch.forEach((book) => {
      const bookTitle = book.querySelector(".book-title").innerText;
      if (bookTitle.toLowerCase().includes(queryBook.toLowerCase())) {
        book.removeAttribute("hidden");
      } else {
        book.setAttribute("hidden", "");
      }
    });
    q.preventDefault();
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("formAddBook");
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });

  if (isStorageExist()) loadData();
  searchBook();
});

document.addEventListener(RENDER_EVENTS, () => {
  const listBookUncomplete = document.getElementById("listBookUncomplete");
  const listBookComplete = document.getElementById("listBookComplete");

  listBookUncomplete.innerHTML = "";
  listBookComplete.innerHTML = "";

  for (const book of bookList) {
    const listbookItem = makeBookList(book);
    if (book.isCompleted) {
      listBookComplete.appendChild(listbookItem);
    } else {
      listBookUncomplete.appendChild(listbookItem);
    }
  }
});
