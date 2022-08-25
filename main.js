const bookshelf = [];
const RENDER_EVENT = "render-bookshelf";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOKSHELF_APPS";

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("inputBook");
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

function updateCheckbox() {
  const isCompleted = document.getElementById("inputBookIsComplete");
  const spanText = document.getElementById("span");
  isCompleted.checked
    ? (spanText.innerText = "Selesai dibaca")
    : (spanText.innerText = "Belum selesai dibaca");
}

function addBook() {
  const title = document.getElementById("inputBookTitle").value;
  const author = document.getElementById("inputBookAuthor").value;
  const year = document.getElementById("inputBookYear").value;
  const isCompleted = document.getElementById("inputBookIsComplete").checked;

  const generatedID = generateId();
  const bookObject = generateBook(
    generatedID,
    title,
    author,
    year,
    isCompleted
  );
  bookshelf.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  document.getElementById("inputBook").reset();
}

function generateId() {
  return +new Date();
}

function generateBook(id, title, author, year, isCompleted) {
  return {
    id,
    title,
    author,
    year,
    isCompleted,
  };
}

function makeBook(bookObject) {
  const textTitle = document.createElement("h2");
  textTitle.innerText = bookObject.title;

  const textAuthor = document.createElement("p");
  textAuthor.innerText = "Penulis : " + bookObject.author;

  const textYear = document.createElement("p");
  textYear.innerText = "Tahun : " + bookObject.year;

  const container = document.createElement("div");
  container.classList.add("book_item", "shadow");
  container.append(textTitle, textAuthor, textYear);

  container.setAttribute("id", `book-${bookObject.id}`);

  if (bookObject.isCompleted) {
    const undoButton = document.createElement("button");
    undoButton.classList.add("green");
    undoButton.innerText = "Belum selesai dibaca";

    undoButton.addEventListener("click", function () {
      undoBookFromCompleted(bookObject.id);
    });

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("red");
    deleteButton.innerText = "Hapus";

    deleteButton.addEventListener("click", function () {
      removeBook(bookObject.id);
    });

    container.append(undoButton, deleteButton);
  } else {
    const checkButton = document.createElement("button");
    checkButton.classList.add("green");
    checkButton.innerText = "Selesai dibaca";

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("red");
    deleteButton.innerText = "Hapus";

    checkButton.addEventListener("click", function () {
      addBookToCompleted(bookObject.id);
    });

    deleteButton.addEventListener("click", function () {
      removeBook(bookObject.id);
    });

    container.append(checkButton, deleteButton);
  }

  return container;
}
// function makeBook(bookObject) {
//   const textTitle = document.createElement("h2");
//   textTitle.innerText = bookObject.title;

//   const textAuthor = document.createElement("p");
//   textAuthor.innerText = "Penulis : " + bookObject.author;

//   const textYear = document.createElement("p");
//   textYear.innerText = "Tahun : " + bookObject.year;

//   const textContainer = document.createElement("div");
//   textContainer.classList.add("action");
//   textContainer.append(textTitle, textAuthor, textYear);

//   const container = document.createElement("div");
//   container.classList.add("book_item", "shadow");
//   container.append(textContainer);
//   container.setAttribute("id", `book-${bookObject.id}`);

//   if (bookObject.isCompleted) {
//     const undoButton = document.createElement("button");
//     undoButton.classList.add("green");
//     undoButton.innerText = "Belum selesai dibaca";

//     undoButton.addEventListener("click", function () {
//       undoBookFromCompleted(bookObject.id);
//     });

//     const deleteButton = document.createElement("button");
//     deleteButton.classList.add("red");
//     deleteButton.innerText = "Hapus";

//     deleteButton.addEventListener("click", function () {
//       removeBook(bookObject.id);
//     });

//     container.append(undoButton, deleteButton);
//   } else {
//     const checkButton = document.createElement("button");
//     checkButton.classList.add("green");
//     checkButton.innerText = "Selesai dibaca";

//     const deleteButton = document.createElement("button");
//     deleteButton.classList.add("red");
//     deleteButton.innerText = "Hapus";

//     checkButton.addEventListener("click", function () {
//       addBookToCompleted(bookObject.id);
//     });

//     deleteButton.addEventListener("click", function () {
//       removeBook(bookObject.id);
//     });

//     container.append(checkButton, deleteButton);
//   }

//   return container;
// }

function addBookToCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBook(bookId) {
  for (const bookItem of bookshelf) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedBook = document.getElementById("incompleteBookshelfList");
  uncompletedBook.innerHTML = "";

  const completedBook = document.getElementById("completeBookshelfList");
  completedBook.innerHTML = "";

  for (const bookshelfItem of bookshelf) {
    const bookshelfElement = makeBook(bookshelfItem);
    if (!bookshelfItem.isCompleted) uncompletedBook.append(bookshelfElement);
    else completedBook.append(bookshelfElement);
  }
});

function removeBook(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  bookshelf.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  alert("buku telah dihapus");
}

function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBookIndex(bookId) {
  for (const index in bookshelf) {
    if (bookshelf[index].id === bookId) {
      return index;
    }
  }

  return -1;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(bookshelf);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}
function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      bookshelf.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

document
  .getElementById("searchBook")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const bookTitle = document
      .getElementById("searchBookTitle")
      .value.toLowerCase();

    const bookList = document.querySelectorAll(
      ".book_shelf > .book_list > .book_item > h2"
    );
    for (book of bookList) {
      if (book.innerText.toLowerCase().includes(bookTitle)) {
        book.parentElement.style.display = "block";
      } else {
        book.parentElement.style.display = "none";
      }
    }
  });
