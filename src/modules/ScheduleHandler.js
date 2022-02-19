import { getNoAttendanceDays } from './ScheduleGenerator.js'

// TODO: add fliter schedules by free days

function drawSchedule(ScheduleGroupsindexes) {
    let { ScheduleTextFormat, ScheduleTimes } = getScheduleInfo(ScheduleGroupsindexes)

    // Get Free Days As String
    let freeDays = getNoAttendanceDays(ScheduleTimes, true);
    freeDays = freeDays + "<br>" + ScheduleTextFormat
    tableInfo.style.display = "block"
    tableInfo.innerHTML = freeDays

    // console.log(freeDays)
    // console.log('ScheduleTimes', ScheduleTimes)

    // Empty Timetable Cells
    var cells = document.getElementsByClassName("celly");
    for (let i = 0; i < cells.length; i++) {
        cells[i].textContent = '';
    }

    // Fill Allocated Timetable Cells with each Group Info
    ScheduleGroupsindexes.split(",").forEach(element => {
        allGroups[element].time.split(",").forEach((ele) => {
            let courseName = `<span id='courseName'> ${allGroups[element].name}</span>`
            let drName = `<span id='drName'> ${allGroups[element].dr}</span>`
            cells[TableCellsMap.get(ele)].innerHTML = courseName + '<br>' + drName
        })
    })
}

/**
 * 
 * @param {Array} ScheduleGroupsindexes Groups indexes of Current Schedule
 * @returns {} Object containing 
 *             - Schedule in Text Format { course name, group number, instructor, and teaching assistant }
 *             - ScheduleTimes Array of all groups times used to get Number of Attendance Days
 */
function getScheduleInfo(ScheduleGroupsindexes) {
    let ScheduleTextFormat = ''
    let ScheduleTimes = ''
    // Get info of each group {name,dr,time}
    ScheduleGroupsindexes.split(",").forEach(element => {
        ScheduleTextFormat += allGroups[element].name + " [ " + allGroups[element].dr + " ]" + " <br> "
        ScheduleTimes = ScheduleTimes + allGroups[element].time + ','
    })
    return { ScheduleTextFormat, ScheduleTimes }
}

// TODO: Remove duplicate code
function travelsSchedules(e) {
    const travelsingBtn = e.target
    var tableSelect = document.getElementsByClassName(travelsingBtn.id)[0];
    var currentS = tableSelect.selectedIndex;
    let options = Array.from(tableSelect.options)


    if (travelsingBtn.className == 'next') {
        if (currentS <= tableSelect.options.length - 1) {

            // next non-hidden option
            let nextNonHiddenOptions = options.filter(option => {
                return option.hidden == false && option.index > currentS
            })
            // console.log('nextNonHiddenOption', nextNonHiddenOptions[0])

            let nextOption = nextNonHiddenOptions[0]
            if (nextOption != undefined) {
                // travelsingBtn.style.display = 'block'
                nextOption.selected = 'selected'
                drawSchedule(nextOption.value)
                // enable prev option if disabled
                let prev = document.querySelector(`#${travelsingBtn.id}[class="previous"]`)
                if (prev.disabled) {
                    prev.style.cursor = 'pointer'
                    prev.disabled = false
                }
            } else {
                travelsingBtn.style.cursor = 'not-allowed'
                travelsingBtn.disabled = true
            }
        }
    } else {
        if (!(currentS <= 0)) {
            // next non-hidden option
            let prevNonHiddenOptions = options.filter(option => {
                return option.hidden == false && option.index < currentS
            })
            let prevOption = prevNonHiddenOptions[prevNonHiddenOptions.length - 1]
            if (prevOption != undefined) {
                prevOption.selected = 'selected'
                drawSchedule(prevOption.value)
                // enable next option if disabled
                let next = document.querySelector(`#${travelsingBtn.id}[class="next"]`)
                if (next.disabled) {
                    next.style.cursor = 'pointer'
                    next.disabled = false
                }
            } else {
                travelsingBtn.style.cursor = 'not-allowed'
                travelsingBtn.disabled = true
            }
        } else {
            travelsingBtn.style.cursor = 'not-allowed'
            travelsingBtn.disabled = true
        }
    }
}

function enableTravelse(selectclass) {
    let next = document.querySelector(`#${selectclass}[class="next"]`)
    let prev = document.querySelector(`#${selectclass}[class="previous"]`)
    next.style.cursor = 'pointer'
    next.disabled = false
    prev.style.cursor = 'pointer'
    prev.disabled = false
}

function filterSchedulesByAttandacneDay(event) {
    let thisAttBTN = event.target
    thisAttBTN.style.backgroundColor = '#41b53f'

    // Get Schedule option Indexes of Current Filter
    const optionIndexes = thisAttBTN.value.split(',')
    const selectclass = thisAttBTN.getAttribute('selectclass')
    const key = thisAttBTN.getAttribute('key')
    changeAttandanBtnColor(selectclass, key)
    enableTravelse(selectclass)

    let tableSelect = document.querySelector(`.${selectclass}`);
    let originOptions = Array.from(tableSelect.options)

    // console.log('tableSelect', tableSelect)

    // Hide all Schedule Options
    originOptions.forEach(originOption => originOption.hidden = true)

    // Show Schedule Options of Current Filter
    optionIndexes.forEach(optionIndex => {
        originOptions[optionIndex].hidden = false;
    })
    tableSelect.selectedIndex = optionIndexes[0]
    drawSchedule(tableSelect.options[optionIndexes[0]].value)
}

function showAllOptions(event) {
    let thisFullBTN = event.target
    thisFullBTN.style.backgroundColor = '#41b53f'
    const selectclass = thisFullBTN.getAttribute('selectclass')
    const key = thisFullBTN.getAttribute('key')
    changeAttandanBtnColor(selectclass, key)
    enableTravelse(selectclass)
    let tableSelect = document.querySelector(`.${selectclass}`)
    let options = Array.from(tableSelect.options)
    options.forEach(option => {
        option.hidden = false
    })
    options[0].selected = 'selected'
    drawSchedule(options[0].value)
}

function createButtonsofAttandanceMap(attendanceDaysMap) {
    let attendanceDiv = document.querySelector('.attendanceDiv' + selectTableNum)
    attendanceDiv.innerHTML = 'عدد أيام الحضور : عدد الاحتمالات <br>';

    // create a btn for showing all options
    var fullAttendanceBTN = document.createElement("button");
    fullAttendanceBTN.type = "button";
    fullAttendanceBTN.setAttribute("id", 'fullAttendancebtn');
    fullAttendanceBTN.setAttribute("key", 'all');
    fullAttendanceBTN.setAttribute("selectclass", "TableSelectT" + selectTableNum);
    fullAttendanceBTN.addEventListener("click", showAllOptions);
    fullAttendanceBTN.style.backgroundColor = '#41b53f'
    fullAttendanceBTN.innerHTML = `كل الاحتمالات : ${nooverlapcombintion.length}`;
    attendanceDiv.appendChild(fullAttendanceBTN);

    for (let [key, value] of attendanceDaysMap) {
        var attendanceBTN = document.createElement("button");
        attendanceBTN.type = "button";
        attendanceBTN.setAttribute("id", 'attendancebtn');
        attendanceBTN.setAttribute("key", key);
        attendanceBTN.setAttribute("value", value);
        attendanceBTN.setAttribute("selectclass", "TableSelectT" + selectTableNum);
        attendanceBTN.addEventListener("click", filterSchedulesByAttandacneDay);
        let length = value.length;
        attendanceBTN.innerHTML = `${key} : ${length}`;
        attendanceDiv.appendChild(attendanceBTN);
    }
}

function changeAttandanBtnColor(selectclass, key) {
    let attendanceOptions = document.querySelectorAll(`[selectclass="${selectclass}"]`)

    attendanceOptions.forEach(attendanceOption => {
        if (attendanceOption.getAttribute('key') != key) {
            attendanceOption.style.backgroundColor = '#3f51b5'
        }
    })
    // changing fullAttendancebtn color
    if (key != 'all') {
        let fullAttendancebtn = document.querySelector('#fullAttendancebtn')
        fullAttendancebtn.style.backgroundColor = '#3f51b5'
    }
}


function setPrintUI() {
    const myTimeTable = document.querySelector("#Schedule")
    const myTableWrapper = document.querySelector('#ScheduleDiv')

    window.addEventListener("beforeprint", function (event) {
        document.body.style.visibility = "hidden"
        myTimeTable.style.visibility = "visible"
        myTimeTable.style.top = 0
        myTimeTable.style.left = 0
        myTimeTable.style.position = 'absolute'
        myTimeTable.style.padding = '30px'

        myTableWrapper.style.height = '0px'
    });
    window.addEventListener('afterprint', (event) => {
        document.body.style.visibility = "visible"
        myTimeTable.style.position = 'inherit'
        myTimeTable.style.top = 'inherit'
        myTimeTable.style.left = 'inherit'
        myTimeTable.style.padding = '0px'

        myTableWrapper.style.height = '1000px'
    });
}


function printSchedule() {
    window.print()
}


export { drawSchedule, travelsSchedules, createButtonsofAttandanceMap, enableTravelse , setPrintUI , printSchedule }