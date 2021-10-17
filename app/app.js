const toDo = document.querySelector(".nav_button:first-child")
const caldendar = document.querySelector(".nav_button:last-child")
let deletes
const list = document.querySelector(".today .tasks")
const addForNextDay = document.querySelector(".calendar .add")
const listForNextDay = document.querySelector(".calendar .tasks")
const confirmForNextDay = document.querySelector(".calendar .confirm")
const add = document.querySelector(".today .add")
const mark = document.querySelector(".mark")
const confirM = document.querySelector(".today .confirm")
const month = document.querySelector(".month")
const back =  document.querySelector(".back")
const forward =  document.querySelector(".forward")
let tasks
const days = document.querySelector('.days[type="number"]')
const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
let dayIcons = document.querySelectorAll(`.days[type="number"] li`)
let input
let id = 0
let checked = new Map()
let listeners = new Map()
const listDay = new Map()
let day = new Date()
for(let i = 0; i < localStorage.length; i++) {
    let key = localStorage.key(i)
    console.log(i)
    key = key.split(" ")
    if(+key[0]<day.getMonth() | +key[1]<day.getDate()){
        localStorage.removeItem(localStorage.key(i))
    }
}
day = `${day.getMonth()} ${day.getDate()}`
if(localStorage.getItem("Marked for") && localStorage.getItem("Marked for")!=day){
    localStorage.removeItem("Marked")
}

setCurrent()
listDay.set(list, new Date())
addDeleting(deletes,listForNextDay)
toDo.addEventListener("click", () => {
    slide(toDo,caldendar,"toDo")
    const plan = document.querySelector(".calendar .list")
    plan.className = "list hidden"
    const current = document.querySelector(".today .tasks")
    setCurrent()
})

caldendar.addEventListener("click", () => {
    slide(caldendar,toDo,"cal")
})

addTask(list,add,confirM,todayPattern)
addTask(listForNextDay,addForNextDay,confirmForNextDay, calPattern, false, true, true)

mark.addEventListener("click", () => {
    const selected = list.querySelectorAll(`li[checked="true"]`)
    for(let i = 0; i < selected.length; i++) {
        selected[i].className = "marked"
        const checkBox = selected[i].querySelector(".status")
        const change = listeners.get(selected[i].querySelector(".status"))
        checkBox.removeEventListener("click", change)
        checked.delete(checkBox)
        listeners.get(checkBox)[0] = null
        const value = selected[i].querySelector(".text").innerHTML
        fixMarked(value)
        fixTask(listDay.get(list), value, true)
    }
    addCheckable(document.querySelectorAll(".today .task"))
    addDeleting(document.querySelectorAll(".today .task .delete"))
    mark.removeAttribute("style")
    add.removeAttribute("style")
})

buildTable(new Date())
let offset = 0

back.addEventListener("click", () => {
    const back = new Date()
    back.setMonth(back.getMonth() + --offset)
    buildTable(back)
})

forward.addEventListener("click", () => {
    const next = new Date()
    next.setMonth(next.getMonth() + ++offset)
    buildTable(next)
})

function calPattern(value, id, marked = false) {
    return `<p>
                <span class="text">${value}</span>
            </p>
            <div class="delete" target = "t${id}">
                <i class="fas fa-times"></i>
            </div>`
}

function todayPattern(value, id, marked = false) {
    let status = "status"
    if(marked) {
        status = "status fas fa-check"
    }
    return  `<p>
                <i class="${status}" target = "t${id}"></i>
                <span class="text">${value}</span>
            </p>
            <div class="delete" target = "t${id}">
                <i class="fas fa-times"></i>
            </div>`
}

function fixMarked(value) {
    let marked = localStorage.getItem("Marked")
    if(marked){
        marked += ` ${value}`
    } else {
        marked = value
    }
    localStorage.setItem("Marked", marked)
    const today = new Date()
    localStorage.setItem("Marked for", `${today.getMonth()} ${today.getDate()}`)
}

function addTask(list, add, confirM, pattern, checkable=true, deleting = true, now = true){
    add.addEventListener("click", () => {
        input = createInput()
        list.appendChild(input)
        add.setAttribute("style", "display:none")
        confirM.setAttribute("style", "display:block")
    })
    
    confirM.addEventListener("click", () => {
        const value = document.querySelector(".new input").value
        list.appendChild(createTask(value, id, pattern))
        list.removeChild(input)
        id++
        add.removeAttribute("style")
        confirM.removeAttribute("style")
        if(checkable) {
            addCheckable(list.querySelectorAll(".task"), list)
        }
        if(deleting) {
            addDeleting(list.querySelectorAll(".task .delete"), list)            
        }
        const day = listDay.get(list)
        fixTask(day, value)
        if (checkTasks(list)) {
            for(let dayIcon of dayIcons){
                if(dayIcon.className == "" && dayIcon.innerHTML == day.getDate()) {
                    addClass(dayIcon, "plan")
                }
            }
        }
    })
}

function addClass(element, className) {
    const name = element.className.split(" ")
    if(!name.includes(className)){
        element.className += ` ${className}`
    }
}
function buildTable(date){
    days.innerHTML = ""
    month.innerHTML = monthNames[date.getMonth()]
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
    let next = new Date(date.getFullYear(),date.getMonth()+2,0)
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
    next = new Date(date.getFullYear(),date.getMonth()+2,1)
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
    showPlan()
}
function setCurrent() {
    setTasks(new Date(), list, todayPattern)
    tasks = document.querySelectorAll(".today .task")
    deletes = document.querySelectorAll(".delete")
    addCheckable(tasks,list)
    addDeleting(deletes,list)
    setMarked(todayPattern,list)
}

function setMarked(pattern,list) {
    let marked = localStorage.getItem("Marked")
    if(marked) {
        marked = marked.split(" ")
        for(let item of marked) {
            list.appendChild(createTask(item, id, pattern, true))
        }
    }
}

function showPlan() {
    dayIcons = document.querySelectorAll(`.days[type="number"] li`)
    for(let dayIcon of dayIcons){
        buildList(dayIcon,true)
        const today = new Date()
        let month = document.querySelector(`.calendar .month`).innerHTML
        month = monthNames.indexOf(month)
        if((today.getMonth() > month ||
        today.getDate() > dayIcon.innerHTML &&
        today.getMonth() == month) &&
        !dayIcon.className) {
            dayIcon.className = "disable"
            continue
        } else if(dayIcon.className == "prev" | dayIcon.className == "next") {
            dayIcon.className += " disable"
            continue
        }
        if(!listeners.has(dayIcon)){
            let dayMonth = buildList.bind(undefined, dayIcon, false)
            dayIcon.addEventListener("click", dayMonth)
            listeners.set(dayIcon, dayMonth)
        } else {
            continue
        }
}
}

function buildList(dayIcon, hidden = false) {
    const list = document.querySelector(".calendar .list")
    const title = document.querySelector(".calendar .title")
    let month = document.querySelector(".calendar .month")
    title.innerHTML = `Plans for ${dayIcon.innerHTML} ${month.innerHTML}`
    if(!hidden){
        list.className = "list"
    }
    for(let i = 0; i < monthNames.length; i++) {
        if(monthNames[i] == month.innerHTML) {
            month = i
        }
    }
    const date = new Date()
    date.setMonth(month)
    date.setDate(+dayIcon.innerHTML)
    listDay.set(list.querySelector(".tasks"), date)
    const consist = setTasks(date, list.querySelector(".tasks"),calPattern)
    if(consist | checkTasks(list)) {
        addClass(dayIcon, "plan")
    }
    if(now(dayIcon.innerHTML, monthNames[month])){
        console.log("today")
        setMarked(calPattern,listForNextDay)
    }
}

function setTasks(date, list, pattern) {
    let dateString = `${date.getMonth()} ${date.getDate()}`
    let storageTasks = localStorage.getItem(dateString)
    list.innerHTML = ""
    id = 0
    if(!storageTasks) {
        return false
    }
    storageTasks = storageTasks.split(" ")
    for (storageTask of storageTasks) {
        list.appendChild(createTask(storageTask, id, pattern))
        id++
    }
    return true
}

function fixTask(date, value, del = false) {
    const dateString = `${date.getMonth()} ${date.getDate()}`
    let storageTasks = localStorage.getItem(dateString)
    if(!del) {
        if(!storageTasks) {
            storageTasks = value
        } else {
            storageTasks += ` ${value}` 
        }
        localStorage.setItem(dateString, storageTasks)
    } else {
        storageTasks = storageTasks.split(" ")
        for(let i = 0; i < storageTasks.length; i++) {
            if(storageTasks[i] == value) {
                storageTasks.splice(i,1)
            }
        }
        localStorage.setItem(dateString, storageTasks.join(" "))
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
function now(day, month) {
    const now = new Date()
    return now.getDate() == +day && monthNames[now.getMonth()] == month 
}

function checkTasks(list) {
    const tasks = list.querySelectorAll(".tasks li")
    if(tasks.length>0){
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

function createTask(value, id, pattern, marked = false) {
    const li = document.createElement("li")
    li.className = "task"
    li.innerHTML = pattern(value, id, marked)
    li.id = `t${id}`
    if(marked) {
        li.className= "marked"
    }
    return li
}

function slide(position,unactive,frame){
    position.className = "nav_button active"
    unactive.className = "nav_button"
    document.querySelector(".today").className = "today " + frame
    document.querySelector(".calendar").className = "calendar " + frame
}

function addCheckable (tasks) {
    for(let i =0; i<tasks.length; i++){
        const checkBox = tasks[i].querySelector(".status")
        const changeWithTask = change.bind(undefined,[tasks[i],checkBox])
        if(!listeners.has(checkBox)){
            console.log(checkBox)
            checkBox.addEventListener("click", changeWithTask)
            listeners.set(checkBox,changeWithTask)
        }
    }
}

function change(event){
    if(!checked.get(event[1])){
        event[1].className = "status fas fa-check"
        checked.set(event[1],true)
        event[0].setAttribute("checked","true")
    } else {
        event[1].className = "status"
        checked.set(event[1],false)
        event[0].removeAttribute("checked")
    }
    if(isSelected()) {
        add.setAttribute("style", "display:none")
        mark.setAttribute("style","display:block")
    } else{
        add.removeAttribute("style")
        mark.removeAttribute("style")
    }
}

function addDeleting(deletes, list) {
    for(let i = 0; i < deletes.length; i++){
        if(!listeners.has(deletes[i])){
            listeners.set(deletes[i],true)
        } else {
            continue
        }
        const li = document.getElementById(deletes[i].getAttribute("target"))
        deletes[i].addEventListener("click", () => {
            console.log(deletes[i].getAttribute("target"))
            list.removeChild(li)
            const value = li.querySelector(".text").innerHTML
            const date = listDay.get(list)
            fixTask(date, value, true)
        })
        deletes[i].addEventListener("mouseover", () => {
            deletes[i].querySelector(".fas").className = "fas fa-times hovered"
        })
        deletes[i].addEventListener("mouseout", () => {
            deletes[i].querySelector(".fas").className = "fas fa-times"
        })
    }
}

function isSelected() {
    const keys = checked.keys()
    for(key of keys) {
        if(checked.get(key)){
            return true
        }
    }
    return false
}