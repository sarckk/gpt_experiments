chrome.bookmarks.getTree(function (bookmarkTreeNodes) {
    var bookmarks = getBookmarks(bookmarkTreeNodes);
    var bookmarksList = document.getElementById('bookmarks');

    for (var i = 0; i < bookmarks.length; i++) {
        var bookmark = bookmarks[i];
        var li = document.createElement('li');
        var a = document.createElement('a');
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

        button.addEventListener('click', function () {
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
        });
    }
});

function getBookmarks(bookmarkTreeNodes) {
    var bookmarks = [];

    for (var i = 0; i < bookmarkTreeNodes.length; i++) {
        var node = bookmarkTreeNodes[i];

        if (node.children) {
            bookmarks = bookmarks.concat(getBookmarks(node.children));
        } else if (node.url) {
            bookmarks.push(node);
        }
    }

    return bookmarks;
}

function showError(spinner, error) {
    spinner.classList.remove('spinner');
    spinner.classList.add('error');
    spinner.textContent = error.message;
    console.error(error);
}