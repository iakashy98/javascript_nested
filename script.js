let items = loadFromLocalStorage() || [];
let draggedItemID = null;

document.addEventListener('DOMContentLoaded', function() {
    renderItems();
});

function handleDragStart(e) {
    draggedItemID = e.target.getAttribute('data-id');
}

function handleDrop(e) {
    const targetBox = e.target.closest(".nested-box");
    const targetID = targetBox ? targetBox.getAttribute('data-id') : null;

    if (!draggedItemID || draggedItemID === targetID) return;

    const draggedItem = items.find(item => item.id == draggedItemID);
    if (targetID) {
        draggedItem.parentID = parseInt(targetID);
    } else {
        draggedItem.parentID = null; // It becomes a root item
    }

    saveToLocalStorage();
    renderItems();
}

function createParent() {
    const text = document.getElementById('inputText').value;
    if (!text) return;
    items.push({ id: Date.now(), text: text, parentID: null });
    document.getElementById('inputText').value = '';
    saveToLocalStorage();
    renderItems();
}

function addChild(parentID) {
    const text = document.getElementById(`childInput-${parentID}`).value;
    if (!text) return;
    items.push({ id: Date.now(), text: text, parentID: parentID });
    saveToLocalStorage();
    renderItems();
}

function saveToLocalStorage() {
    localStorage.setItem('items', JSON.stringify(items));
}

function loadFromLocalStorage() {
    return JSON.parse(localStorage.getItem('items'));
}

function renderItems() {
    const boxArea = document.querySelector('.box-area');
    boxArea.innerHTML = '';
    const topLevelItems = items.filter(item => item.parentID === null);
    topLevelItems.forEach(item => {
        boxArea.appendChild(renderItem(item));
    });
}

function renderItem(item) {
    const div = document.createElement('div');
    div.classList.add('nested-box', 'rounded', 'p-3', 'mb-3');
    div.setAttribute('data-id', item.id);
    div.draggable = true;
    div.addEventListener('dragstart', handleDragStart);
    div.addEventListener('dragover', e => e.preventDefault());
    div.addEventListener('drop', handleDrop);

    div.innerHTML = `
        ${item.text}
        <button onclick="showChildInput(${item.id})" class="btn btn-custom-primary mb-3">Add Child</button>
        <div style="display: none;" id="childBox-${item.id}" class="mt-3">
            <input type="text" id="childInput-${item.id}" placeholder="Enter child text" class="form-control mb-2">
            <button onclick="addChild(${item.id})" class="btn btn-custom-primary mb-2">Add</button>
        </div>
    `;

    const childItems = items.filter(i => i.parentID === item.id);
    childItems.forEach(child => {
        div.appendChild(renderItem(child));
    });

    return div;
}

function showChildInput(id) {
    document.getElementById(`childBox-${id}`).style.display = 'block';
    document.querySelector(`[onclick="showChildInput(${id})"]`).style.display = 'none';
}

function resetData() {
    localStorage.removeItem('items');
    items = [];
    renderItems();
}
