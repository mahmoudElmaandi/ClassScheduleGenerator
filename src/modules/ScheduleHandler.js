import { getNoAttendanceDays, getScheduleGapMetrics } from './ScheduleGenerator.js'

// TODO: add fliter schedules by free days
const ACTIVE_FILTER_COLOR = '#41b53f'
const DEFAULT_FILTER_COLOR = '#3f51b5'
const FILTER_GROUPS = ['attendance', 'offday', 'gap']
const OFF_DAY_LABELS = {
    1: 'السبت',
    2: 'الاحد',
    3: 'الاثنين',
    4: 'الثلاثاء',
    5: 'الاربعاء',
    6: 'الخميس'
}

function getOffDayLabel(dayKey) {
    return OFF_DAY_LABELS[dayKey] || `اليوم ${dayKey}`
}


function drawSchedule(ScheduleGroupsindexes) {
    let { ScheduleTextFormat, ScheduleTimes } = getScheduleInfo(ScheduleGroupsindexes)

    // Get Free Days As String
    let freeDays = getNoAttendanceDays(ScheduleTimes, true);
    let gaps = getScheduleGapMetrics(ScheduleTimes).totalGaps
    freeDays = freeDays + "<br>" + "الفجوات:" + gaps + "<br>" + ScheduleTextFormat
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

function setActiveFilterButton(selectclass, group, key) {
    let filterButtons = document.querySelectorAll(`[selectclass="${selectclass}"][data-filter-group="${group}"]`)
    filterButtons.forEach(filterButton => {
        if (filterButton.getAttribute('key') == key) {
            filterButton.style.backgroundColor = ACTIVE_FILTER_COLOR;
        } else {
            filterButton.style.backgroundColor = DEFAULT_FILTER_COLOR;
        }
    })
}

function resetOtherFilterGroups(selectclass, group) {
    FILTER_GROUPS.forEach((filterGroup) => {
        if (filterGroup == group) return
        let filterButtons = document.querySelectorAll(`[selectclass="${selectclass}"][data-filter-group="${filterGroup}"]`)
        if (filterButtons.length == 0) return
        filterButtons.forEach(filterButton => {
            if (filterButton.getAttribute('key') == 'all') {
                filterButton.style.backgroundColor = ACTIVE_FILTER_COLOR;
            } else {
                filterButton.style.backgroundColor = DEFAULT_FILTER_COLOR;
            }
        })
    })
}

function filterSchedulesByIndexes(event, group) {
    let thisBTN = event.target

    // Get Schedule option Indexes of Current Filter
    const optionIndexes = thisBTN.value.split(',')
    const selectclass = thisBTN.getAttribute('selectclass')
    const key = thisBTN.getAttribute('key')
    setActiveFilterButton(selectclass, group, key)
    resetOtherFilterGroups(selectclass, group)
    enableTravelse(selectclass)

    let tableSelect = document.querySelector(`.${selectclass}`);
    let originOptions = Array.from(tableSelect.options)

    // Hide all Schedule Options
    originOptions.forEach(originOption => originOption.hidden = true)

    // Show Schedule Options of Current Filter
    optionIndexes.forEach(optionIndex => {
        originOptions[optionIndex].hidden = false;
    })
    tableSelect.selectedIndex = optionIndexes[0]
    drawSchedule(tableSelect.options[optionIndexes[0]].value)
}

function filterSchedulesByAttandacneDay(event) {
    filterSchedulesByIndexes(event, 'attendance')
}

function filterSchedulesByOffDay(event) {
    filterSchedulesByIndexes(event, 'offday')
}

function filterSchedulesByGap(event) {
    filterSchedulesByIndexes(event, 'gap')
}

function showAllOptions(event) {
    let thisFullBTN = event.target
    const selectclass = thisFullBTN.getAttribute('selectclass')
    const key = thisFullBTN.getAttribute('key')
    const group = thisFullBTN.getAttribute('data-filter-group')
    setActiveFilterButton(selectclass, group, key)
    resetOtherFilterGroups(selectclass, group)
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
    attendanceDiv.innerHTML = '<div style="width:100%;text-align:center;">عدد أيام الحضور : عدد الاحتمالات</div>';

    // create a btn for showing all options
    var fullAttendanceBTN = document.createElement("button");
    fullAttendanceBTN.type = "button";
    fullAttendanceBTN.setAttribute("id", 'fullAttendancebtn');
    fullAttendanceBTN.setAttribute("key", 'all');
    fullAttendanceBTN.setAttribute("selectclass", "TableSelectT" + selectTableNum);
    fullAttendanceBTN.setAttribute("data-filter-group", "attendance");
    fullAttendanceBTN.addEventListener("click", showAllOptions);
    fullAttendanceBTN.style.backgroundColor = ACTIVE_FILTER_COLOR;
    fullAttendanceBTN.innerHTML = `كل الاحتمالات : ${nooverlapcombintion.length}`;
    attendanceDiv.appendChild(fullAttendanceBTN);

    for (let [key, value] of attendanceDaysMap) {
        var attendanceBTN = document.createElement("button");
        attendanceBTN.type = "button";
        attendanceBTN.setAttribute("id", 'attendancebtn');
        attendanceBTN.setAttribute("key", key);
        attendanceBTN.setAttribute("value", value);
        attendanceBTN.setAttribute("selectclass", "TableSelectT" + selectTableNum);
        attendanceBTN.setAttribute("data-filter-group", "attendance");
        attendanceBTN.addEventListener("click", filterSchedulesByAttandacneDay);
        let length = value.length;
        attendanceBTN.innerHTML = `${key} : ${length}`;
        attendanceDiv.appendChild(attendanceBTN);
    }
}

function createButtonsOfOffDaysMap(offDaysMap) {
    let attendanceDiv = document.querySelector('.attendanceDiv' + selectTableNum)
    let offDaysDiv = document.createElement('div')
    offDaysDiv.setAttribute('class', 'offDaysDiv')
    offDaysDiv.innerHTML = 'ايام الاجازة : عدد الاحتمالات <br>';
    attendanceDiv.appendChild(offDaysDiv);

    if (offDaysMap.size == 0) {
        let noOffDays = document.createElement('span')
        noOffDays.innerHTML = 'لا توجد اجازات'
        offDaysDiv.appendChild(noOffDays)
        return
    }

    var showAllOffDaysBTN = document.createElement("button");
    showAllOffDaysBTN.type = "button";
    showAllOffDaysBTN.setAttribute("id", 'offDaysAllBtn');
    showAllOffDaysBTN.setAttribute("key", 'all');
    showAllOffDaysBTN.setAttribute("selectclass", "TableSelectT" + selectTableNum);
    showAllOffDaysBTN.setAttribute("data-filter-group", "offday");
    showAllOffDaysBTN.addEventListener("click", showAllOptions);
    showAllOffDaysBTN.style.backgroundColor = ACTIVE_FILTER_COLOR;
    showAllOffDaysBTN.innerHTML = `عرض الكل`;
    offDaysDiv.appendChild(showAllOffDaysBTN);

    let sortedKeys = Array.from(offDaysMap.keys()).sort((a, b) => a - b);
    sortedKeys.forEach((key) => {
        let value = offDaysMap.get(key);
        var offDayBTN = document.createElement("button");
        offDayBTN.type = "button";
        offDayBTN.setAttribute("id", 'offdaybtn');
        offDayBTN.setAttribute("key", key);
        offDayBTN.setAttribute("value", value);
        offDayBTN.setAttribute("selectclass", "TableSelectT" + selectTableNum);
        offDayBTN.setAttribute("data-filter-group", "offday");
        offDayBTN.addEventListener("click", filterSchedulesByOffDay);
        let length = value.length;
        offDayBTN.innerHTML = `${getOffDayLabel(key)} : ${length}`;
        offDaysDiv.appendChild(offDayBTN);
    })
}

function createButtonsOfGapsMap(gapsMap) {
    let attendanceDiv = document.querySelector('.attendanceDiv' + selectTableNum)
    let gapsDiv = document.createElement('div')
    gapsDiv.setAttribute('class', 'gapsDiv')
    gapsDiv.innerHTML = 'عدد الفجوات : عدد الاحتمالات <br>';
    attendanceDiv.appendChild(gapsDiv);

    if (gapsMap.size == 0) {
        let noGaps = document.createElement('span')
        noGaps.innerHTML = 'لا توجد فجوات'
        gapsDiv.appendChild(noGaps)
        return
    }

    var showAllGapsBTN = document.createElement("button");
    showAllGapsBTN.type = "button";
    showAllGapsBTN.setAttribute("id", 'gapsAllBtn');
    showAllGapsBTN.setAttribute("key", 'all');
    showAllGapsBTN.setAttribute("selectclass", "TableSelectT" + selectTableNum);
    showAllGapsBTN.setAttribute("data-filter-group", "gap");
    showAllGapsBTN.addEventListener("click", showAllOptions);
    showAllGapsBTN.style.backgroundColor = ACTIVE_FILTER_COLOR;
    showAllGapsBTN.innerHTML = `عرض الكل`;
    gapsDiv.appendChild(showAllGapsBTN);

    let sortedKeys = Array.from(gapsMap.keys()).sort((a, b) => a - b);
    sortedKeys.forEach((key) => {
        let value = gapsMap.get(key);
        var gapBTN = document.createElement("button");
        gapBTN.type = "button";
        gapBTN.setAttribute("id", 'gapbtn');
        gapBTN.setAttribute("key", key);
        gapBTN.setAttribute("value", value);
        gapBTN.setAttribute("selectclass", "TableSelectT" + selectTableNum);
        gapBTN.setAttribute("data-filter-group", "gap");
        gapBTN.addEventListener("click", filterSchedulesByGap);
        let length = value.length;
        gapBTN.innerHTML = `${key} : ${length}`;
        gapsDiv.appendChild(gapBTN);
    })
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


export { drawSchedule, travelsSchedules, createButtonsofAttandanceMap, createButtonsOfOffDaysMap, createButtonsOfGapsMap, enableTravelse , setPrintUI , printSchedule }
