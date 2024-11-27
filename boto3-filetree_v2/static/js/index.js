const fileTreeElement = document.getElementById('file-tree');
const reloadButton = document.getElementById('reload-button');
const spinner = `
<div class="spinner-border text-danger" role="status">
    <span class="visually-hidden"></span>
</div>`;

document.addEventListener('DOMContentLoaded', function() {
    fileTreeElement.innerHTML = spinner;
    fetchData();
});

reloadButton.addEventListener('click', () => {
    console.log("Button pressed");
    fileTreeElement.innerHTML = spinner;
    fetchData();
})

function fetchData() {
    fetch('/file_structure')
        .then(response => response.json())
        .then(fileStructure => {
            fileTreeElement.innerHTML = '';       
            createFileTree(fileStructure, fileTreeElement);
        })
        .catch(error => {
            console.error('Error fetching file structure:', error);
            fileTreeElement.innerHTML = '<p>Error loading data. Try again</p>'
        });
}

function createFileTree(structure, parentElement, path="") {
    for (const key in structure) {
        const li = document.createElement('li');
        if (structure[key] === null) {
            li.innerHTML = `
            <a href="#" class="file-link" data-file-path="${path}${key}">${key}</a>`;
            if (key.includes('.') && key.split('.')[1] === 'html') {
                li.innerHTML += `
                <button class="html-button">Show page</button>`;
            }
        } else {
            const span = document.createElement('span');
            span.textContent = key;
            span.setAttribute('data-folder-path', path + key);
            span.classList.add('folder');
            span.addEventListener('click', function() {
                const contentsElement = this.nextElementSibling;
                if (contentsElement.style.display === 'none') {
                    contentsElement.style.display = 'block';
                } else {
                    contentsElement.style.display = 'none';
                }
            });
            li.appendChild(span);
            const ul = document.createElement('ul');
            ul.classList.add('folder-contents');
            ul.style.display = 'none';
            createFileTree(structure[key], ul, span.getAttribute('data-folder-path'));
            li.appendChild(ul);
        }
        parentElement.appendChild(li);
    }

    document.querySelectorAll('.file-link').forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            document.body.classList.add('spinner-cursor');
            fetch("/download?key=" + this.getAttribute('data-file-path'))
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Server error: ${response.status} ${response.statusText}`);
                    }
                    return response.blob();
                })
                .then(blob => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    a.download = this.getAttribute('data-file-path').split('/').pop();
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                })
                .catch(error => {
                    console.error('Error downloading file:', error);
                    alert('Error downloading file. Try again');
                })
                .finally(() => {
                    document.body.classList.remove('spinner-cursor');
                });
        });
    })

    document.querySelectorAll('.html-button').forEach(link => {
        link.addEventListener('click', function(event) {
        });
    })
}
