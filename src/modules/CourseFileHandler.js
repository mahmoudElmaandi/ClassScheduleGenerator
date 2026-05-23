import { createBtn, chooseCoursesBtnObj, printCombinationsBtnObj } from '../buttons.js'
import { csvToJSONObject } from '../csv-to-json.js'
import { printCombination } from './ScheduleGenerator.js'
import { selectCourses } from './CourseSelectHandler.js'


const inputfile = document.getElementById("inputfile")
const fileSelectBtn = document.querySelector('#fileSelect')

const STORAGE_KEYS = {
    selectedCourses: 'csgen_selected_courses',
    selectedGroups: 'csgen_selected_groups',
    selectedDep: 'csgen_selected_dep'
}

function safeGetItem(key) {
    try {
        return localStorage.getItem(key)
    } catch (error) {
        return null
    }
}

function safeSetItem(key, value) {
    try {
        localStorage.setItem(key, value)
    } catch (error) {
        return null
    }
}

function safeRemoveItem(key) {
    try {
        localStorage.removeItem(key)
    } catch (error) {
        return null
    }
}

function safeParseJSON(value, fallback) {
    try {
        return JSON.parse(value)
    } catch (error) {
        return fallback
    }
}


inputfile.addEventListener("change", readFile, false);

fileSelectBtn.addEventListener("click", () => {
    if (inputfile) {
        inputfile.click();
    }
}, false);


// Read Course File
function readFile() {
    const uploadedFile = this.files[0];

    if (validitaFileType(uploadedFile)) {
        console.log(uploadedFile)
        var reader = new FileReader();
        reader.readAsText(uploadedFile);
        reader.onload = function (e) { handelFile(e.target.result, uploadedFile.type); }
    } else {
        console.log(uploadedFile)

        console.log('Not a Valid type')
    }
}

// Handel File
function handelFile(fileContent, filetype) {

    // TODO: validate CSV/Json file

    let CoursesObject;

    // File is JSON
    if (filetype == "application/json") {
        CoursesObject = JSON.parse(fileContent)
    }
    // File is CSV
    else {
        if (fileContent.endsWith(';')) {
            fileContent = fileContent.slice(0, fileContent.length - 1)
        }
        CoursesObject = csvToJSONObject(fileContent);
    }
    parseFile(CoursesObject)
}



function validitaFileType(file) {
    const fileTypes = [
        "text/plain",
        "application/vnd.ms-excel",
        "application/json",
        "text/csv"
    ];
    return fileTypes.includes(file.type);
}

// select department
let DepOptionts = document.getElementById('Dep');
DepOptionts.addEventListener('change', selectDepartment);

function selectDepartment(e) {
    const optionValue = DepOptionts.options[DepOptionts.selectedIndex].value
    if (validDepValues.includes(optionValue)) {
        safeSetItem(STORAGE_KEYS.selectedDep, optionValue)
        parseFile(csvToJSONObject(window.coursesInfo[optionValue]))
    }
};

// Parsing Courses File to populate these Lists
let courseList = [] // used to create courses select element UI @createCourseSelect()
let groupList = []  // used to create groups select element UI and in draw schedule

// Create Course and Group List
function parseFile(coursesDataList) {
    for (let index = 0; index < coursesDataList.length; index++) {
        const { ccname, ccode, groups, unit } = coursesDataList[index];

        // Create courseList to be used with Course Select.
        courseList.push({
            name: ccname,
            code: ccode
        })

        function range(start, end) {
            return Array(end - start + 1).fill().map((_, idx) => start + idx)
        }

        // Create Map of each course code as a key, and its groups indexes as a value.
        // This enables displaying only groups of the selected courses.
        codesmap[ccode] = range(groupList.length, (groupList.length + groups.length) - 1)

        // Create groupList to be used with Group Select.
        for (let index = 0; index < groups.length; index++) {
            const { glecturer, gnumber, gtimes } = groups[index];
            groupList.push({
                dr: glecturer,
                time: gtimes,
                regcode: `${ccode} ${gnumber}`,
                name: `${ccname} ${gnumber}`,
                optionName: `${ccname} ${gnumber} ${glecturer}`,
                code: ccode,
                unit: unit
            })
        }
    }
    allGroups = groupList;
    CreateSelectCourseUI()
}

function persistSelections() {
    const courseSelect = document.getElementById("CourseSelect")
    const groupSelect = document.getElementById("GroupSelect")

    if (courseSelect) {
        const selectedCourses = Array.from(courseSelect.selectedOptions).map(option => option.value)
        safeSetItem(STORAGE_KEYS.selectedCourses, JSON.stringify(selectedCourses))
    }

    if (groupSelect) {
        const selectedGroups = Array.from(groupSelect.selectedOptions)
            .map(option => option.getAttribute('regCode'))
            .filter(Boolean)
        safeSetItem(STORAGE_KEYS.selectedGroups, JSON.stringify(selectedGroups))
    }
}

function updateCourseSummary() {
    const summaryDiv = document.getElementById('courseSelectionSummary')
    const courseSelect = document.getElementById("CourseSelect")
    if (!summaryDiv || !courseSelect) return
    const selectedCourses = Array.from(courseSelect.selectedOptions)
    summaryDiv.innerHTML = `عدد المواد المختارة: ${selectedCourses.length}`
}

function updateSelectionSummary() {
    const summaryDiv = document.getElementById('selectionSummary')
    const groupSelect = document.getElementById("GroupSelect")
    if (!summaryDiv || !groupSelect) return

    const selectedGroups = Array.from(groupSelect.selectedOptions)
    let courseUnits = new Map()
    let courseCounts = new Map()

    selectedGroups.forEach(option => {
        const code = option.value
        const unit = parseInt(option.getAttribute('unit') || '0', 10)
        courseUnits.set(code, unit)
        courseCounts.set(code, (courseCounts.get(code) || 0) + 1)
    })

    const totalUnits = Array.from(courseUnits.values()).reduce((total, unit) => total + unit, 0)
    const duplicates = Array.from(courseCounts.entries())
        .filter(([_, count]) => count > 1)
        .map(([code, count]) => `${code} (${count})`)

    const duplicatesText = duplicates.length ? `تكرار المادة: ${duplicates.join('، ')}` : 'لا يوجد تكرار'
    summaryDiv.innerHTML = `عدد المواد المختارة: ${courseUnits.size} | عدد المجموعات المختارة: ${selectedGroups.length} | مجموع الوحدات: ${totalUnits}<br>${duplicatesText}`
}

function applyGroupSelections(savedGroupRegCodes) {
    const groupSelect = document.getElementById("GroupSelect")
    if (!groupSelect) return
    const savedSet = new Set(savedGroupRegCodes)
    const groupOptions = Array.from(groupSelect.options)
    const groupCheckboxes = Array.from(document.querySelectorAll('#group-checkboxes input'))

    groupOptions.forEach((option, index) => {
        const regCode = option.getAttribute('regCode')
        const shouldSelect = savedSet.has(regCode)
        option.selected = shouldSelect
        if (groupCheckboxes[index]) {
            groupCheckboxes[index].checked = shouldSelect
            if (shouldSelect) {
                groupCheckboxes[index].parentElement.classList.add('selected')
            } else {
                groupCheckboxes[index].parentElement.classList.remove('selected')
            }
        }
    })
    updateSelectionSummary()
}

function restoreSelections() {
    const savedCourses = safeParseJSON(safeGetItem(STORAGE_KEYS.selectedCourses), [])
    if (!Array.isArray(savedCourses) || savedCourses.length == 0) {
        updateCourseSummary()
        updateSelectionSummary()
        return
    }

    const courseSelect = document.getElementById("CourseSelect")
    if (!courseSelect) return

    const courseOptions = Array.from(courseSelect.options)
    const courseCheckboxes = Array.from(document.querySelectorAll('#course-checkboxes input'))
    courseOptions.forEach((option, index) => {
        if (savedCourses.includes(option.value)) {
            option.selected = true
            if (courseCheckboxes[index]) {
                courseCheckboxes[index].checked = true
                courseCheckboxes[index].parentElement.classList.add('selected')
            }
        }
    })

    updateCourseSummary()
    selectCourses()

    const savedGroups = safeParseJSON(safeGetItem(STORAGE_KEYS.selectedGroups), [])
    if (Array.isArray(savedGroups) && savedGroups.length > 0) {
        applyGroupSelections(savedGroups)
    } else {
        updateSelectionSummary()
    }
}

function clearSavedSelections() {
    safeRemoveItem(STORAGE_KEYS.selectedCourses)
    safeRemoveItem(STORAGE_KEYS.selectedGroups)
    safeRemoveItem(STORAGE_KEYS.selectedDep)
    window.alert("تم مسح الاختيارات المحفوظة")
}

function setupSearchFilter(inputElement, labelSelector) {
    if (!inputElement) return
    inputElement.addEventListener('input', () => {
        const query = inputElement.value.trim()
        const labels = Array.from(document.querySelectorAll(labelSelector))
        labels.forEach(label => {
            const text = label.innerText || ''
            label.hidden = query.length > 0 && !text.includes(query)
        })
    })
}

// Create crossponding checkboxes for select options
function createLabelCheckboxElement(text, index, type) {
    let label = document.createElement("label");
    label.setAttribute('for', `${type}${index}`)
    label.setAttribute('class', `checkbox-label`)
    label.innerText = text

    let input = document.createElement("input");
    input.setAttribute('type', 'checkbox')
    input.setAttribute('index', index)
    input.setAttribute('id', `${type}${index}`)
    input.setAttribute('class', `checkbox-input`)
    input.addEventListener('click', (e) => { handleCorrespondingOptionOfCheckbox(e.target) })
    label.appendChild(input)
    return label
}

// TODO: show total units of selected course while selecting @select-course-ui
function createCourseSelect(courseList) {
    var CourseSelect = document.createElement("select");
    CourseSelect.setAttribute("multiple", "true");
    CourseSelect.id = "CourseSelect";
    CourseSelect.addEventListener('change', () => {
        persistSelections()
        updateCourseSummary()
    })

    // Create crossponding checkboxes div
    var checkboxes = document.createElement("div");
    checkboxes.id = "course-checkboxes";
    checkboxes.className = "select-checkboxes";

    for (let index = 0; index < courseList.length; index++) {
        const { name, code } = courseList[index];

        let Coption = document.createElement("option");
        Coption.innerHTML = name;
        Coption.value = code;
        CourseSelect.appendChild(Coption);

        // Create crossponding checkbox for each option
        const label = createLabelCheckboxElement(name, index, 'course')

        checkboxes.appendChild(label)
    }

    // Create select all label 
    const selectAllLabel = createSelectAllCheckboxElement('تحديد كل المواد', 'course')

    const courseSearch = document.createElement('input')
    courseSearch.setAttribute('type', 'text')
    courseSearch.setAttribute('id', 'courseSearchInput')
    courseSearch.setAttribute('placeholder', 'ابحث عن مادة')
    courseSearch.style.margin = '6px'
    courseSearch.style.width = '60%'
    setupSearchFilter(courseSearch, '#course-checkboxes label')

    const courseSummary = document.createElement('div')
    courseSummary.setAttribute('id', 'courseSelectionSummary')
    courseSummary.style.margin = '6px'

    CourseDiv.appendChild(CourseSelect);
    CourseDiv.appendChild(selectAllLabel);
    CourseDiv.appendChild(courseSearch);
    CourseDiv.appendChild(courseSummary);
    CourseDiv.appendChild(checkboxes);

}

function handleCorrespondingOptionOfCheckbox(target) {
    const targetSelectID = target.id
    const selector = targetSelectID.includes('group') ? 'GroupSelect' : 'CourseSelect'

    const selectOptions = Array.from(document.querySelector(`#${selector}`).options)
    const index = target.getAttribute('index')
    if (target.checked) {
        selectOptions[index].selected = true
        target.parentElement.classList.add('selected')
    }
    else {
        selectOptions[index].selected = false
        target.parentElement.classList.remove('selected')

    }
    persistSelections()
    updateCourseSummary()
    updateSelectionSummary()
}

function createGroupSelect(groupList) {
    var GroupSelect = document.createElement("select");
    GroupSelect.id = "GroupSelect";
    GroupSelect.setAttribute("multiple", "true");
    GroupSelect.addEventListener('change', () => {
        persistSelections()
        updateSelectionSummary()
    })

    // Create crossponding checkboxes div
    var checkboxes = document.createElement("div");
    checkboxes.id = "group-checkboxes";
    checkboxes.className = "select-checkboxes";

    for (let index = 0; index < groupList.length; index++) {
        const { dr, time, regcode, name, optionName, code, unit } = groupList[index];
        var option = document.createElement("option");
        option.innerHTML = optionName
        option.value = code
        option.setAttribute("time", time);
        option.setAttribute("unit", unit);
        option.setAttribute("regCode", regcode);
        delete groupList[index].optionName;
        delete groupList[index].code;
        delete groupList[index].regcode;
        delete groupList[index].unit;
        GroupSelect.appendChild(option);

        // Create crossponding checkbox for each option
        const label = createLabelCheckboxElement(name + ' ' + dr, index, 'group')
        checkboxes.appendChild(label)
    }
    // Create select all label 
    const selectAllLabel = createSelectAllCheckboxElement('تحديد كل المجموعات', 'group')

    const groupSearch = document.createElement('input')
    groupSearch.setAttribute('type', 'text')
    groupSearch.setAttribute('id', 'groupSearchInput')
    groupSearch.setAttribute('placeholder', 'ابحث عن مجموعة أو دكتور')
    groupSearch.style.margin = '6px'
    groupSearch.style.width = '60%'
    setupSearchFilter(groupSearch, '#group-checkboxes label')

    const selectionSummary = document.createElement('div')
    selectionSummary.setAttribute('id', 'selectionSummary')
    selectionSummary.style.margin = '6px'

    GroupDiv.appendChild(GroupSelect);
    GroupDiv.appendChild(selectAllLabel);
    GroupDiv.appendChild(groupSearch);
    GroupDiv.appendChild(selectionSummary);
    GroupDiv.appendChild(checkboxes);
}

function CreateSelectCourseUI() {
    // Delete Header and Department Select
    // document.getElementById('selectdep').remove()

    // Hide home screen 
    document.querySelector('#home-screen').style.display = "none"

    // Choose course button
    let chooseCoursesBtn = createBtn(chooseCoursesBtnObj)
    let clearSavedBtn = document.createElement('button')
    clearSavedBtn.type = 'button'
    clearSavedBtn.setAttribute('id', 'clearSavedSelections')
    clearSavedBtn.innerHTML = 'مسح الاختيارات المحفوظة'
    clearSavedBtn.addEventListener('click', clearSavedSelections)

    // Create Course Select
    createCourseSelect(courseList)

    CourseDiv.appendChild(chooseCoursesBtn);
    CourseDiv.appendChild(clearSavedBtn);
    GroupDiv.appendChild(HeaderD);

    // Create Group Select
    createGroupSelect(groupList)

    form.appendChild(CourseDiv);
    form.appendChild(GroupDiv);

    // Display Course div and Hide Probability
    CourseDiv.style.display = "flex";
    GroupDiv.style.display = "none";

    // Print combinations Div
    var div = document.createElement("div");
    div.setAttribute('id', 'submitcomb')

    let CombinationBtn = createBtn(printCombinationsBtnObj)

    GroupDiv.appendChild(div);
    div.appendChild(CombinationBtn);

    // window.scrollBy(0, 250);
    form.addEventListener("submit", printCombination);
    document.title = 'اختيار المواد'
    updateCourseSummary()
    updateSelectionSummary()
    restoreSelections()
}

function createSelectAllCheckboxElement(text, type) {
    let label = document.createElement("label");
    label.setAttribute('for', `${type}-selectall`)
    label.setAttribute('class', `select-all-checkbox`)
    label.innerText = text

    let input = document.createElement("input");
    input.setAttribute('type', 'checkbox')
    input.setAttribute('id', `${type}-selectall`)
    input.setAttribute('class', `select-all-checkbox-input`)
    input.addEventListener('click', () => { selectAll(type) })
    label.appendChild(input)

    return label
}


function selectAll(type) {
    console.log('clicked')
    console.log('type', type)
    let checkboxes = Array.from(document.querySelectorAll(`#${type}-checkboxes input`));
    const selectAllCheckbox = document.querySelector(`#${type}-selectall`)
    console.log('checkboxes', checkboxes)
    checkboxes.forEach((checkbox) => {
        if (checkbox.parentElement.hidden == false) {

            if (selectAllCheckbox.checked) {
                console.log('selectAllCheckbox is checked')
                console.log('selectAllCheckbox.checked', selectAllCheckbox.checked)

                checkbox.checked = true
                // // first uncheck checkboxes 
                // checkbox.checked = false
                // // then select options
                // checkbox.click()
                // if check all is not checked

                handleCorrespondingOptionOfCheckbox(checkbox);
            } else {
                console.log(' selectAllCheckbox not checked')
                checkbox.checked = false
                handleCorrespondingOptionOfCheckbox(checkbox);
                // bad old sol
                // first select checkboxes
                // checkbox.checked = true
                // // affect on the select options
                // checkbox.click()
            }
        }
    })
}
export { parseFile }
