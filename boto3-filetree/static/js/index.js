document.addEventListener('DOMContentLoaded', function() {
    const fileTreeElement = document.getElementById('file-tree');

    fetch('/file_structure')
        .then(response => response.json())
        .then(fileStructure => {
            function createFileTree(structure, parentElement) {
                for (const key in structure) {
                    const li = document.createElement('li');
                    if (structure[key] === null) {
                        li.innerHTML = `
                        <a href="/file/${key}">${key}</a>
                        `;
                    } else {
                        const span = document.createElement('span');
                        span.textContent = key;
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
                        createFileTree(structure[key], ul);
                        li.appendChild(ul);
                    }
                    parentElement.appendChild(li);
                }
            }

            createFileTree(fileStructure, fileTreeElement);
        })
        .catch(error => console.error('Error fetching file structure:', error));
});