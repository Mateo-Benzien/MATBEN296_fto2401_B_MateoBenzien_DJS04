import { books, authors, genres, BOOKS_PER_PAGE } from './data.js';

// Initial setup
let page = 1;
let matches = books;

/**
 * BookManager class to manage book operations
 */
class BookManager {
    constructor(books) {
        this.books = books;
    }

    /**
     * Filter books based on the provided filters.
     * @param {Object} filters - The search filters.
     * @returns {Array} - The filtered books.
     */
    filterBooks(filters) {
        return this.books.filter(book => {
            const genreMatch = filters.genre === 'any' || book.genres.includes(filters.genre);
            const titleMatch = !filters.title.trim() || book.title.toLowerCase().includes(filters.title.toLowerCase());
            const authorMatch = filters.author === 'any' || book.author === filters.author;
            return genreMatch && titleMatch && authorMatch;
        });
    }
}

/**
 * UIManager class to manage UI operations
 */
class UIManager {
    /**
     * Create a DOM element for a book preview.
     * @param {Object} book - The book object.
     * @returns {HTMLElement} - The book preview button element.
     */
    static createBookPreview({ author, id, image, title }) {
        const element = document.createElement('button');
        element.classList = 'preview';
        element.setAttribute('data-preview', id);

        element.innerHTML = `
            <img class="preview__image" src="${image}" />
            <div class="preview__info">
                <h3 class="preview__title">${title}</h3>
                <div class="preview__author">${authors[author]}</div>
            </div>
        `;

        return element;
    }

    /**
     * Render book previews.
     * @param {Array} booksToRender - The books to render.
     */
    static renderBookPreviews(booksToRender) {
        const fragment = document.createDocumentFragment();
        for (const book of booksToRender) {
            fragment.appendChild(UIManager.createBookPreview(book));
        }
        const listItems = document.querySelector('[data-list-items]');
        listItems.innerHTML = '';
        listItems.appendChild(fragment);
    }

    /**
     * Create a DOM element for a select option.
     * @param {string} value - The value of the option.
     * @param {string} text - The display text of the option.
     * @returns {HTMLElement} - The option element.
     */
    static createOption(value, text) {
        const element = document.createElement('option');
        element.value = value;
        element.innerText = text;
        return element;
    }

    /**
     * Render the genre and author filter options.
     */
    static renderFilterOptions() {
        const genreHtml = document.createDocumentFragment();
        const authorsHtml = document.createDocumentFragment();

        genreHtml.appendChild(UIManager.createOption('any', 'All Genres'));
        authorsHtml.appendChild(UIManager.createOption('any', 'All Authors'));

        for (const [id, name] of Object.entries(genres)) {
            genreHtml.appendChild(UIManager.createOption(id, name));
        }

        for (const [id, name] of Object.entries(authors)) {
            authorsHtml.appendChild(UIManager.createOption(id, name));
        }

        document.querySelector('[data-search-genres]').appendChild(genreHtml);
        document.querySelector('[data-search-authors]').appendChild(authorsHtml);
    }

    /**
     * Set the theme based on the user's preference.
     */
    static setTheme() {
        const darkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.querySelector('[data-settings-theme]').value = darkMode ? 'night' : 'day';
        document.documentElement.style.setProperty('--color-dark', darkMode ? '255, 255, 255' : '10, 10, 20');
        document.documentElement.style.setProperty('--color-light', darkMode ? '10, 10, 20' : '255, 255, 255');
    }

    /**
     * Update the "Show more" button text and state.
     * @param {number} remainingBooks - The number of remaining books.
     */
    static updateShowMoreButton(remainingBooks) {
        const showMoreButton = document.querySelector('[data-list-button]');
        showMoreButton.innerText = `Show more (${remainingBooks})`;
        showMoreButton.disabled = remainingBooks <= 0;
    }

    /**
     * Display the book details in the overlay.
     * @param {Object} book - The book object.
     */
    static displayBookDetails(book) {
        document.querySelector('[data-list-active]').open = true;
        document.querySelector('[data-list-blur]').src = book.image;
        document.querySelector('[data-list-image]').src = book.image;
        document.querySelector('[data-list-title]').innerText = book.title;
        document.querySelector('[data-list-subtitle]').innerText = `${authors[book.author]} (${new Date(book.published).getFullYear()})`;
        document.querySelector('[data-list-description]').innerText = book.description;
    }
}

// Initialize BookManager
const bookManager = new BookManager(books);

/**
 * Initialize the application.
 */
function init() {
    UIManager.renderBookPreviews(matches.slice(0, BOOKS_PER_PAGE));
    UIManager.renderFilterOptions();
    UIManager.setTheme();
    UIManager.updateShowMoreButton(matches.length - BOOKS_PER_PAGE);

    // Add event listeners
    addEventListeners();
}

/**
 * Add event listeners for user interactions.
 */
function addEventListeners() {
    document.querySelector('[data-search-cancel]').addEventListener('click', () => {
        document.querySelector('[data-search-overlay]').open = false;
    });

    document.querySelector('[data-settings-cancel]').addEventListener('click', () => {
        document.querySelector('[data-settings-overlay]').open = false;
    });

    document.querySelector('[data-header-search]').addEventListener('click', () => {
        document.querySelector('[data-search-overlay]').open = true;
        document.querySelector('[data-search-title]').focus();
    });

    document.querySelector('[data-header-settings]').addEventListener('click', () => {
        document.querySelector('[data-settings-overlay]').open = true;
    });

    document.querySelector('[data-list-close]').addEventListener('click', () => {
        document.querySelector('[data-list-active]').open = false;
    });

    document.querySelector('[data-settings-form]').addEventListener('submit', handleSettingsFormSubmit);
    document.querySelector('[data-search-form]').addEventListener('submit', handleSearchFormSubmit);
    document.querySelector('[data-list-button]').addEventListener('click', handleShowMoreClick);
    document.querySelector('[data-list-items]').addEventListener('click', handleBookPreviewClick);
}

/**
 * Handle the settings form submission.
 * @param {Event} event - The form submit event.
 */
function handleSettingsFormSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const { theme } = Object.fromEntries(formData);

    document.documentElement.style.setProperty('--color-dark', theme === 'night' ? '255, 255, 255' : '10, 10, 20');
    document.documentElement.style.setProperty('--color-light', theme === 'night' ? '10, 10, 20' : '255, 255, 255');

    document.querySelector('[data-settings-overlay]').open = false;
}

/**
 * Handle the search form submission.
 * @param {Event} event - The form submit event.
 */
function handleSearchFormSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const filters = Object.fromEntries(formData);
    const result = bookManager.filterBooks(filters);

    page = 1;
    matches = result;

    if (result.length < 1) {
        document.querySelector('[data-list-message]').classList.add('list__message_show');
    } else {
        document.querySelector('[data-list-message]').classList.remove('list__message_show');
    }

    UIManager.renderBookPreviews(result.slice(0, BOOKS_PER_PAGE));
    UIManager.updateShowMoreButton(matches.length - BOOKS_PER_PAGE);

    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.querySelector('[data-search-overlay]').open = false;
}

/**
 * Handle the "Show more" button click.
 */
function handleShowMoreClick() {
    UIManager.renderBookPreviews(matches.slice(page * BOOKS_PER_PAGE, (page + 1) * BOOKS_PER_PAGE));
    page += 1;
    UIManager.updateShowMoreButton(matches.length - (page * BOOKS_PER_PAGE));
}

/**
 * Handle the book preview click.
 * @param {Event} event - The click event.
 */
function handleBookPreviewClick(event) {
    const pathArray = Array.from(event.path || event.composedPath());
    let active = null;

    for (const node of pathArray) {
        if (active) break;

        if (node?.dataset?.preview) {
            active = books.find(book => book.id === node.dataset.preview);
        }
    }

    if (active) {
        UIManager.displayBookDetails(active);
    }
}

// Initialize the application
init();
