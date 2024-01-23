let listArray = []
let counter = 0
const createForm = document.forms.createForm
const List = document.querySelector('.list')
let filterSelect = document.querySelector('.filter')
let editIndex = -1;
const favoriteStar = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="m480-120-58-52q-101-91-167-157T150-447.5Q111-500 95.5-544T80-634q0-94 63-157t157-63q52 0 99 22t81 62q34-40 81-62t99-22q94 0 157 63t63 157q0 46-15.5 90T810-447.5Q771-395 705-329T538-172l-58 52Zm0-108q96-86 158-147.5t98-107q36-45.5 50-81t14-70.5q0-60-40-100t-100-40q-47 0-87 26.5T518-680h-76q-15-41-55-67.5T300-774q-60 0-100 40t-40 100q0 35 14 70.5t50 81q36 45.5 98 107T480-228Zm0-273Z"/></svg>'

/* modules/ListItem.js */
class ListItem {
    constructor(type, name, desc, deadline, isDone, isFavorite) {
        this.type = type
        this.name = name
        this.desc = desc
        this.listId = counter
        this.deadline = deadline
        this.isDone = isDone
        this.isFavorite = isFavorite
    }

    addItem() {
        listArray.push({
            type: this.type,
            name: this.name,
            desc: this.desc,
            listId: this.listId,
            deadline: this.deadline,
            isDone: this.isDone,
            isFavorite: this.isFavorite
        })

        this.renderItem()

        console.log(listArray)
        counter++

    }

    startEditItem(target) {
        // Знайти елемент для зміни
        let item = target.closest('.list-item')
        // Отримати дані елемента
        let itemInArray = listArray.find(
            (todo) => +todo.listId === +item.getAttribute('data-id')
        )
        // Ввести нові дані
        let date = new Date(itemInArray.deadline)

        createForm.elements.name.value = itemInArray.name
        createForm.elements.type.value = itemInArray.type
        createForm.elements.deadline.value = `${date.getFullYear()}-${formatNumber(date.getMonth() + 1)}-${formatNumber(date.getDate())}`
        createForm.elements.desc.value = itemInArray.desc

        editIndex = itemInArray.listId
        createForm.elements.button.innerText = 'Редагувати'
        createForm.scrollIntoView({
            alignToTop: true,
            behavior: 'smooth'
        })
    }

    removeItem(target) {
        let item = target.closest('.list-item')
        item.remove()
        let itemIndex = listArray.findIndex(
            (todo) => +todo.listId === +item.getAttribute('data-id')
        )
        listArray.splice(itemIndex, 1)
        localStorage.setItem('list', JSON.stringify(listArray))
    }

    renderItem() {
        let newSection = document.createElement('section')
        newSection.classList.add('list-item')
        newSection.setAttribute('data-id', this.listId)
        newSection.setAttribute('data-type', this.type)
        if (this.isDone) {
            newSection.classList.add('--done')
        }
        if (this.isFavorite) {
            newSection.classList.add('--favorite')
        }

        let content = document.createElement('div')
        content.classList.add('list-item__content')

        let title = document.createElement('h3')
        title.classList.add('list-item__title')
        title.innerText = this.name;
        content.appendChild(title)

        let desc = document.createElement('p')
        desc.classList.add('list-item__desc')
        desc.innerText = this.desc;
        content.appendChild(desc)

        let deadline = document.createElement('time')
        deadline.classList.add('list-item__deadline')
        deadline.innerText = this.deadline;
        content.appendChild(deadline)

        newSection.appendChild(content)
        newSection.appendChild(this.createBtn('list-item__mark', 'done', this.doneItem))
        newSection.appendChild(this.createBtn('list-item__edit', 'edit', this.startEditItem))
        newSection.appendChild(this.createBtn('list-item__remove', 'delete', this.removeItem))
        newSection.appendChild(this.createBtn('list-item__favorite', favoriteStar, this.favoriteItem))

        List.appendChild(newSection)
    }

    doneItem(target) {
        let item = target.closest('.list-item')
        item.classList.toggle('--done')
        let itemInArray = listArray.find(
            (todo) => +todo.listId === +item.getAttribute('data-id')
        )
        itemInArray.isDone = !itemInArray.isDone

        console.log(listArray)
        localStorage.setItem('list', JSON.stringify(listArray))

    }
    favoriteItem(target) {
        let item = target.closest('.list-item')
        item.classList.toggle('--favorite')
        let itemInArray = listArray.find(
            (todo) => +todo.listId === +item.getAttribute('data-id')
        )
        itemInArray.isFavorite = !itemInArray.isFavorite

        console.log(listArray)
        localStorage.setItem('list', JSON.stringify(listArray))
    }

    createBtn(btnClass, btnIcon, callback) {
        let btn = document.createElement('button')
        btn.classList.add('list-item__btn', btnClass)
        btn.onclick = function () {
            callback(event.target)
        }

        let icon = document.createElement('span')
        icon.classList.add('material-symbols-outlined')
        icon.innerHTML = btnIcon
        btn.appendChild(icon)

        return btn
    }
}

/* modules/Task.js */
class Task extends ListItem {
    constructor(name, desc, deadline, isDone, isFavorite, assignee) {
        super('task', name, desc, deadline, isDone, isFavorite);
        this.assignee = assignee
    }
}

/* modules/Purchase.js */
class Purchase extends ListItem {
    constructor(name, desc, deadline, isDone, isFavorite, quantity) {
        super('purchase', name, desc, deadline, isDone, isFavorite);
        this.quantity = quantity
    }
}

createForm.onsubmit = function (event) {
    event.preventDefault();
    const inputs = event.target.elements

    if (inputs.name.value.length >= 5 && inputs.deadline.value) {
        let item

        if (editIndex >= 0) {
            item = document.querySelector(`[data-id="${editIndex}"]`)

            // Оновити старі дані за допомогою InnerText
            item.querySelector('h3').innerText = inputs.name.value
            item.querySelector('p').innerText = inputs.desc.value
            item.querySelector('time').innerText = inputs.deadline.value
            item.setAttribute('data-type', inputs.type.value)

            let indexToUpdate = listArray.findIndex((item) => +item.listId === editIndex)
            // Оновити старі дані в масиві
            listArray[indexToUpdate] = {
                ...listArray[editIndex],
                name: inputs.name.value,
                desc: inputs.desc.value,
                deadline: inputs.deadline.value,
                type: inputs.type.value,
            }
            createForm.elements.button.innerText = 'Додати +'
            editIndex = -1;
            item.scrollIntoView({
                alignToTop: true,
                behavior: 'smooth'
            })
        } else {
            if (inputs.type.value === 'task') {
                item = new Task(inputs.name.value, inputs.desc.value, inputs.deadline.value, false, false)
            } else if (inputs.type.value === 'purchase') {
                item = new Purchase(inputs.name.value, inputs.desc.value, inputs.deadline.value, false, false)
            }
            item.addItem()
        }
        localStorage.setItem('list', JSON.stringify(listArray))
        event.target.reset()
    } else {
        alert('fill all required fields')
    }
}

filterSelect.addEventListener('change', () => {
    const tmp = filterSelect.value
    filterHandler(tmp)
})

function filterHandler(type) {
    let listItems = listArray
    let DOMitems = document.querySelectorAll('.list-item')

    listItems.forEach((item) => {
        if (item === undefined || DOMitems[item.listId] === undefined) {
             
        }
        else if (type === 'all' || item.type === type || (type === 'favorite' && item.isFavorite) || (type === 'done' && item.isDone)) {
            DOMitems[item.listId].style.display = 'grid'
        }
        else {
            DOMitems[item.listId].style.display = 'none'
        }
    })
}

if (JSON.parse(localStorage.getItem('list'))?.length) {
    JSON.parse(localStorage.getItem('list')).forEach(item => {
        let newItem;
        if (item.type === 'task') {
            newItem = new Task(item.name, item.desc, item.deadline, item.isDone, item.isFavorite)
        } else if (item.type === 'purchase') {
            newItem = new Purchase(item.name, item.desc, item.deadline, item.isDone, item.isFavorite)
        }
        newItem.addItem()
    })
} else {
    localStorage.setItem('list', JSON.stringify(listArray))
}

/* Services */
function formatNumber(num) {
    return num < 9 ? `0${num}` : num
}

function formatDate(year, month, day) {
    let lang = 'ua'
    if (lang === 'ua') {
        return `${year}-${formatNumber(month + 1)}-${formatNumber(day)}`
    } else if (lang === 'en') {
        return `${formatNumber(day)}-${formatNumber(month + 1)}-${year}`
    }
}


// sessionStorage.setItem('test', 'test 12312')