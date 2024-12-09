const reloadButton = document.getElementById('reload-button');
const spinner = `
<div class="spinner-border text-danger" role="status">
    <span class="visually-hidden"></span>
</div>`;
let fileTree = {}
const breadCrumb = document.getElementById('breadcrumb-ol');
const fileTreeList = document.getElementById('filetree-list');

document.addEventListener('DOMContentLoaded', function() {
    fileTreeList.innerHTML = `<li class="list-group-item">${spinner}</li>`;
    fetchData();
});

reloadButton.addEventListener('click', () => {
    console.log("Button pressed");
    breadCrumb.innerHTML = `
    <li class="breadcrumb-item active" aria-current="folder" folder-path="">Domů</li>`;
    fileTreeList.innerHTML = `<li class="list-group-item">${spinner}</li>`;
    fetchData();
})

function fetchData() {
    fetch('/file_structure')
        .then(response => response.json())
        .then(fileStructure => {
            fileTree = fileStructure;
            console.log(fileTree);
            createFileTree(fileTree);
        })
        .catch(error => {
            console.error('Error fetching file structure:', error);
            fileTreeElement.innerHTML = '<p>Error loading data. Try again</p>'
        });
}

function createFileTree(structure, pathStr="") {
    fileTreeList.innerHTML = '';
    path = pathStr.split('/');
    console.log(path);
    path.pop();
    for (const e of path) {
        structure = structure[e+"/"];
    }
    for (const key in structure) {
        const newListItem = document.createElement('li');
        newListItem.classList.add('list-group-item');
        if (structure[key] === null) {
            const link = document.createElement('a');
            link.href = "#";
            link.classList.add('file-link');
            link.setAttribute('data-file-path', pathStr + key);
            link.textContent = key;
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
            newListItem.appendChild(link);
            if (key.includes('.') && key.split('.')[1] === 'html') {
                newListItem.innerHTML = `
                <button class="html-button">Show page</button>`
                + newListItem.innerHTML;
            }
        } else {
            newListItem.innerHTML = key.slice(0, -1);
            newListItem.setAttribute('folder-path', pathStr + key); 
            newListItem.classList.add('folder');
            newListItem.addEventListener('click', function() {
                const crumb = document.createElement('li');
                crumb.classList.add('active', 'breadcrumb-item');
                crumb.setAttribute('aria-current', "folder");
                crumb.setAttribute('folder-path', pathStr + key);
                crumb.innerHTML = newListItem.innerHTML;
                const prevEl = breadCrumb.lastElementChild;
                console.log(prevEl);
                const link = document.createElement('a');
                link.textContent = prevEl.textContent;
                link.href = "#";
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const li = this.parentElement;
                    let nextParentSibling = li.nextElementSibling;
                    while(nextParentSibling) {
                        const toRemove = nextParentSibling;
                        nextParentSibling = nextParentSibling.nextElementSibling;
                        toRemove.remove();
                    };
                    prevEl.classList.add('active');
                    prevEl.innerHTML = link.innerHTML
                    createFileTree(fileTree, prevEl.getAttribute('folder-path'));
                });
                prevEl.innerHTML = '';
                prevEl.appendChild(link);
                prevEl.classList.remove('active');
                createFileTree(fileTree, this.getAttribute('folder-path'));
                breadCrumb.appendChild(crumb);
            });
        }
        fileTreeList.appendChild(newListItem);
    }
}
