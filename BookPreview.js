class BookPreview extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                .book-preview {
                    border: 1px solid #ccc;
                    padding: 16px;
                    margin: 16px;
                    border-radius: 8px;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                }
                .book-title {
                    font-size: 1.5em;
                    margin: 0;
                }
                .book-author {
                    font-size: 1.2em;
                    color: #555;
                }
                .book-description {
                    margin-top: 8px;
                }
            </style>
            <div class="book-preview">
                <div class="book-title"></div>
                <div class="book-author"></div>
                <div class="book-description"></div>
            </div>
        `;
    }

    connectedCallback() {
        this.fetchBookData();
    }

    async fetchBookData() {
        const bookId = this.getAttribute('book-id');
        const response = await fetch(`/api/books/${bookId}`);
        const data = await response.json();
        this.render(data);
    }

    render(data) {
        this.shadowRoot.querySelector('.book-title').textContent = data.title;
        this.shadowRoot.querySelector('.book-author').textContent = `by ${data.author}`;
        this.shadowRoot.querySelector('.book-description').textContent = data.description;
    }
}

customElements.define('book-preview', BookPreview);
