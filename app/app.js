const toDo = document.querySelector(".nav_button:first-child")
const caldendar = document.querySelector(".nav_button:last-child")
const list = document.querySelector(".today .tasks")
const addForNextDay = document.querySelector(".calendar .add")
const listForNextDay = document.querySelector(".calendar .tasks")
const confirmForNextDay = document.querySelector(".calendar .confirm")
const addToday = document.querySelector(".today .add")
const mark = document.querySelector(".mark")
const confirmToday = document.querySelector(".today .confirm")
const month = document.querySelector(".month")
const back =  document.querySelector(".back")
const forward =  document.querySelector(".forward")
let dayIcons = document.querySelectorAll(`.days[type="number"] li`)
const days = document.querySelector('.days[type="number"]')

const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];



const listDay = new Map()
let day = new Date()
let offset = 0

clearYesterdayTask()
clearTaskForPast()

listDay.set(list, new Date())
setCurrent(list)

addTask(list, addToday, confirmToday, todayPattern, dayIcons, listDay)
addTask(listForNextDay, addForNextDay, confirmForNextDay, calPattern, dayIcons, listDay)

toDo.addEventListener("click", () => {
    slide(toDo, caldendar, "toDo")
    const plan = document.querySelector(".calendar .list")
    plan.className = "list hidden"
    setCurrent(list)
    mark.removeAttribute("style")
    addToday.removeAttribute("style")
    confirmToday.removeAttribute("style")
})

caldendar.addEventListener("click", () => {
    slide(caldendar, toDo, "cal")
})

mark.addEventListener("click", () => {
    const selected = list.querySelectorAll(`li[checked="true"]`)
    markHandler(selected, listDay, list)
    addCheckable(document.querySelectorAll(".today .task"))
    addDeleting(document.querySelectorAll(".today .task .delete"))
    mark.removeAttribute("style")
    addToday.removeAttribute("style")
})


buildCalendar(new Date(), days, month, monthNames, listDay)

back.addEventListener("click", () => {
    const back = new Date()
    back.setMonth(back.getMonth() + --offset)
    buildCalendar(back, days, month, monthNames, listDay)
})

forward.addEventListener("click", () => {
    const next = new Date()
    next.setMonth(next.getMonth() + ++offset)
    buildCalendar(next, days, month, monthNames, listDay)
})


function calPattern(value, marked = false) {
    return `<p>
                <span class="text">${value}</span>
            </p>
            <div class="delete">
                <i class="fas fa-times"></i>
            </div>`
}


function todayPattern(value, marked = false) {
    let status = "status"
    if(marked) {
        status = "status fas fa-check"
    }
    return  `<p>
                <i class="${status}"></i>
                <span class="text">${value}</span>
            </p>
            <div class="delete">
                <i class="fas fa-times"></i>
            </div>`
}


function markHandler(selected, listDay, list) {
    for(let i = 0; i < selected.length; i++) {
        selected[i].className = "marked"
        const checkBox = selected[i].querySelector(".status")
        const delet = selected[i].querySelector(".delete")
        delet.removeEventListener("click", deleteHandler)
        delet.removeEventListener("mouseover", deleteOn)
        delet.removeEventListener("mouseout", deleteOff)
        checkBox.removeEventListener("click", change)
        const value = selected[i].querySelector(".text").innerHTML
        fixMarked(value)
        fixTask(new Date(), value, true)
    }
}


function fixMarked(value) {
    let marked = localStorage.getItem("Marked")
    if(marked){
        marked += `;${value}`
    } else {
        marked = value
    }
    localStorage.setItem("Marked", marked)
    const today = new Date()
    localStorage.setItem("Marked for", `${today.getMonth()} ${today.getDate()} ${today.getFullYear()}`)
}


function addTask(list, addButton, confirmButton, pattern, dayIcons, listDay){
    let input = null
    addButton.addEventListener("click", () => {
        input = addHandler(list, addButton, confirmButton)
    })

    confirmButton.addEventListener("click", () => {
        saveTaskHanlder(list, input, listDay, pattern, confirmButton, addButton)
        markPlans(list, dayIcons)
    })
}


function addHandler(list, addButton, confirmButton) {
    let input = createInput()
    list.appendChild(input)
    addButton.setAttribute("style", "display:none")
    confirmButton.setAttribute("style", "display:block")
    return input
}


function saveTaskHanlder(list, input, listDay, pattern, confirmButton, addButton) {
    const value = document.querySelector(".new input").value
    list.appendChild(createTask(value, pattern))
    list.removeChild(input)
    addButton.removeAttribute("style")
    confirmButton.removeAttribute("style")
    addCheckable(list.querySelectorAll(".task"))
    addDeleting(list.querySelectorAll(".task .delete"))            
    const day = listDay.get(list)
    fixTask(day, value)
}


function markPlans(list, dayIcons) {
    if (checkTasks(list)) {
        for(let dayIcon of dayIcons){
            if(dayIcon.className == "" && dayIcon.innerHTML == day.getDate()) {
                addClass(dayIcon, "plan")
            }
        }
    }
}


function addClass(element, className) {
    const name = element.className.split(" ")
    if(!name.includes(className)){
        element.className += ` ${className}`
    }
}


function buildCalendar(date, days, month, monthNames, listDay){

    days.innerHTML = ""
    month.innerHTML = `${monthNames[date.getMonth()]} ${date.getFullYear()}`

    generatePrevDays(new Date(date.getFullYear(), date.getMonth(), date.getDate()), days)

    generateSelectedMonth(new Date(date.getFullYear(), date.getMonth(), date.getDate()), days)

    generateNextDays(new Date(date.getFullYear(), date.getMonth(), date.getDate()), days)

    showPlan(monthNames, listDay)
}


function generatePrevDays(date, days) {
    date.setDate(1)
    let from = date.getDay() - 1
    date.setDate(0)
    const lastDay = date.getDate()
    if(from == -1) {
        from = 6
    }
    for(let i = from; i > 0; i--) {
        const li = document.createElement(`li`)
        li.innerHTML = lastDay - i + 1
        li.className = "prev"
        days.appendChild(li)
    }
}


function generateSelectedMonth(date, days) {
    let next = new Date(date.getFullYear(),date.getMonth() + 1,0)
    for(let i = 1; i <= next.getDate(); i++){
        const li = document.createElement(`li`)
        li.innerHTML = i
        const now = new Date()
        if(now.getFullYear() == next.getFullYear()
        & now.getMonth() == next.getMonth()
        & i == now.getDate()){
            li.className = "now"
        }
        days.appendChild(li)
    }
}


function generateNextDays(date, days) {
    let next = new Date(date.getFullYear(),date.getMonth()+1,1)
    let i = next.getDay()
    if(i == 0) {
        const li = document.createElement(`li`)
        li.innerHTML = 1
        li.className = "next"
        days.appendChild(li)
    } else if(i != 1) {
        for(let j = 1; i <= 7; i++,j++){
            const li = document.createElement(`li`)
            li.innerHTML = j
            li.className = "next"
            days.appendChild(li)
        }
    }
}


function setCurrent(list) {
    let newTasks = getSavedTasksForDay(new Date(), list, todayPattern)
    addCheckable(newTasks)
    let deletes = newTasks.map(task => task.querySelector(".delete"))
    addDeleting(deletes)
    setMarked(todayPattern, list)
}

function setMarked(pattern, list) {
    let marked = localStorage.getItem("Marked")
    if(marked) {
        marked = marked.split(";")
        for(let item of marked) {
            list.appendChild(createTask(item, pattern, true))
        }
    }
}


function showPlan(monthNames, listDay) {
    dayIcons = document.querySelectorAll(`.days[type="number"] li`)
    for(let dayIcon of dayIcons){
        buildList(dayIcon, listDay, true)
        const today = new Date()
        if(setDisableIcon(dayIcon, monthNames)) {
            continue
        }
        let dayMonth = buildList.bind(undefined, dayIcon, listDay, false)
        dayIcon.addEventListener("click", dayMonth)
    }
}


function setDisableIcon(dayIcon, monthNames) {
    let month = document.querySelector(`.calendar .month`).innerHTML.split(" ")
    let monthIndex = monthNames.indexOf(month[0])
    let targetDay = new Date(+month[1], monthIndex, +dayIcon.innerHTML)

    if( isPastDay(targetDay)
        && (!dayIcon.className || dayIcon.className==" plan")) {
        dayIcon.className = "disable"
        return true
    } else if(dayIcon.className == "prev" | dayIcon.className == "next") {
        dayIcon.className += " disable"
        return true
    }
    return false
}


function buildList(dayIcon, listDay, hidden = false) {
    let month = document.querySelector(".calendar .month")
    const list = document.querySelector(".calendar .list")

    getExistTask(month, list, listDay, dayIcon)

    if(checkTasks(list) && !dayIcon.className) {
        addClass(dayIcon, "plan")
    }

    if(hidden) {
        return
    }

    const title = document.querySelector(".calendar .title")
    title.innerHTML = `Plans for ${dayIcon.innerHTML} ${month.innerHTML}`
    list.className = "list"

    let currMonth = month.innerHTML.split(" ")
    if(now(dayIcon.innerHTML, currMonth[0], +currMonth[1])){
        setMarked(calPattern, list)
    }

    const tasks = list.querySelectorAll(".task")

    if(tasks.length>0){
        addDeleting(list.querySelectorAll(".delete"))
    }
}


function getExistTask(month, list, listDay, dayIcon) {
    let currMonth = month.innerHTML.split(" ")
    for(let i = 0; i < monthNames.length; i++) {
        if(monthNames[i] == currMonth[0]) {
            month = i
        }
    }
    const date = new Date(currMonth[1], month, +dayIcon.innerHTML)

    listDay.set(list.querySelector(".tasks"), date)
    getSavedTasksForDay(date, list.querySelector(".tasks"), calPattern)
}


function getSavedTasksForDay(date, list, pattern) {
    let dateString = `${date.getMonth()} ${date.getDate()} ${date.getFullYear()}`
    let storageTasks = localStorage.getItem(dateString)
    list.innerHTML = ""
    
    let tasks = []

    if(!storageTasks) {
        return tasks
    }

    storageTasks = storageTasks.split(";")
    for (let storageTask of storageTasks) {
        let task = createTask(storageTask, pattern)
        list.appendChild(task)
        tasks.push(task)
    }
    return tasks
}


function fixTask(date, value, del = false) {
    const dateString = `${date.getMonth()} ${date.getDate()} ${date.getFullYear()}`
    let storageTasks = localStorage.getItem(dateString)
    if(!del) {
        if(!storageTasks) {
            storageTasks = value
        } else {
            storageTasks += `;${value}` 
        }
        localStorage.setItem(dateString, storageTasks)
    } else {
        storageTasks = storageTasks.split(";")
        for(let i = 0; i < storageTasks.length; i++) {
            if(storageTasks[i] == value) {
                storageTasks.splice(i,1)
            }
        }
        localStorage.setItem(dateString, storageTasks.join(";"))
    }
}

function markedExecuted(tasks) {
    const marked = document.querySelectorAll(".today .tasks .marked")
    for(let i = 0; i < tasks.length; i++) {
        for(let j = 0; j < marked.length; j++) {
            if(marked[j].innerHTML == tasks[i].innerHTML) {
                tasks[i].className = "marked"
            }
        }
    }
}


function now(day, month, year) {
    const now = new Date()
    return now.getDate() == +day
        && monthNames[now.getMonth()] == month
        && year == now.getFullYear()
}


function checkTasks(list) {
    const tasks = list.querySelectorAll(".tasks li")
    if(tasks.length  > 0){
        return true
    }
    return false
}


function createInput() {
    const input = document.createElement("li")
    input.className = "new"
    input.innerHTML = `<input type="text">`
    return input
}


function createTask(value, pattern, marked = false) {
    const li = document.createElement("li")
    li.className = "task"
    li.innerHTML = pattern(value, marked)
    if(marked) {
        li.className= "marked"
    }
    return li
}


function slide(position, unActive, frame){
    position.className = "nav_button active"
    unActive.className = "nav_button"
    document.querySelector(".today").className = "today " + frame
    document.querySelector(".calendar").className = "calendar " + frame
}


function addCheckable (tasks) {  
    for(let i = 0; i < tasks.length; i++){
        const checkBox = tasks[i].querySelector(".status")
        if(!checkBox) {
            continue
        }
        checkBox.removeEventListener("click", change)
        checkBox.addEventListener("click", change)
    }
}


function change(event){
    const checkBox = event.currentTarget
    const task = checkBox.parentElement.parentElement
    if(checkBox.className == "status"){
        checkBox.className = "status fas fa-check"
        task.setAttribute("checked","true")
    } else {
        checkBox.className = "status"
        task.removeAttribute("checked")
    }
    if(isSelected(task.parentElement.querySelectorAll(".task"))) {
        addToday.setAttribute("style", "display:none")
        mark.setAttribute("style","display:block")
    } else{
        addToday.removeAttribute("style")
        mark.removeAttribute("style")
    }
}


function addDeleting(deletes) {
    for(let i = 0; i < deletes.length; i++){
        deletes[i].removeEventListener("click", deleteHandler)
        deletes[i].addEventListener("click", deleteHandler)
        hoverAnim(deletes[i])
    }
}


function deleteHandler(event) {
    const li = event.target.parentElement.parentElement
    const list = li.parentElement 
    list.removeChild(li)
    const value = li.querySelector(".text").innerHTML
    const date = listDay.get(list)
    fixTask(date, value, true)
}


function hoverAnim(element) { 
    element.removeEventListener("mouseover", deleteOn)
    element.removeEventListener("mouseout", deleteOff)
    element.addEventListener("mouseover", deleteOn)
    element.addEventListener("mouseout", deleteOff)
}

function deleteOn(event) {
    event.currentTarget.querySelector(".fas").className = "fas fa-times hovered"
}

function deleteOff(event) {
    event.currentTarget.querySelector(".fas").className = "fas fa-times"
}


function isSelected(tasks) {
    for(let task of tasks) {
        if(task.getAttribute("checked")) {
            return true
        }
    }
    return false
}


function clearYesterdayTask() {
    const today = new Date()
    let day = `${today.getMonth()} ${today.getDate()} ${today.getFullYear()}`
    if(localStorage.getItem("Marked for") && localStorage.getItem("Marked for") != day){
        localStorage.removeItem("Marked")
    }
}


function clearTaskForPast() {
    for(let i = 0; i < localStorage.length; i++) {
        let key = localStorage.key(i)
        
        key = key.split(" ")
        
        if(isPastDay(new Date(+key[2], +key[0], +key[1]))){
            localStorage.removeItem(localStorage.key(i))
        }
    }
}

function isPastDay(day) {
    const today = new Date()
    return today.getFullYear() > +day.getFullYear()
        || today.getMonth() > day.getMonth()
        && today.getFullYear() == day.getFullYear()
        || today.getMonth() == day.getMonth()
        && today.getFullYear() == day.getFullYear()
        && today.getDate() > +day.getDate()
}