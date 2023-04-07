chrome.bookmarks.getTree((bookmarkTreeNodes) => {
    const bookmarks = getBookmarks(bookmarkTreeNodes);
    const bookmarksList = document.getElementById('bookmarks');

    for (let i = 0; i < bookmarks.length; i++) {
        const bookmark = bookmarks[i];
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = bookmark.url;
        a.textContent = bookmark.title;
        li.appendChild(a);
        bookmarksList.appendChild(li);

        const spinner = document.createElement('span');
        spinner.className = 'spinner';

        const button = document.createElement('button');
        button.className = 'index-button';
        button.textContent = 'Index this document';
        li.appendChild(button);

        createButtonEventListener(li, spinner, bookmark);

    }
});

function createButtonEventListener(li, spinner, bookmark) {
    const error = document.createElement('span');
    error.className = 'error';

    const button = li.querySelector('.index-button');

    button.addEventListener('click', () => {
        spinner.classList.add('spinner');
        spinner.textContent = '';
        li.appendChild(spinner);

        fetch(bookmark.url)
            .then(response => response.text())
            .then(text => {
                const data = {
                    "text": text
                };
                const options = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer <API_KEY>'
                    },
                    body: JSON.stringify(data)
                };
                fetch('https://api.openai.com/v1/engines/davinci-codex/embeddings', options)
                    .then(response => response.json())
                    .then(data => {
                        const embeddings = data.embeddings;
                        const options = {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'api-key': '<API_KEY>'
                            },
                            body: JSON.stringify(embeddings)
                        };
                        fetch('https://api.pinecone.io/v1/vector-indexes/<INDEX_NAME>/vectors', options)
                            .then(response => response.json())
                            .then(data => console.log(data))
                            .catch(error => showError(spinner, error));
                    })
                    .catch(error => showError(spinner, error));
            })
            .catch(error => showError(spinner, error));

        function showError(spinner, error) {
            spinner.classList.remove('spinner');
            spinner.classList.add('error');
            spinner.textContent = error.message;
            console.error(error);
        }
    });
}

function getBookmarks(bookmarkTreeNodes) {
    let bookmarks = [];

    for (let i = 0; i < bookmarkTreeNodes.length; i++) {
        let node = bookmarkTreeNodes[i];

        if (node.children) {
            bookmarks = bookmarks.concat(getBookmarks(node.children));
        } else if (node.url) {
            bookmarks.push(node);
        }
    }

    return bookmarks;
}