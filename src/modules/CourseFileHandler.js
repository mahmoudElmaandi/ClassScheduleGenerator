import { createBtn, chooseCoursesBtnObj, printCombinationsBtnObj } from '../buttons.js'
import { csvToJSONObject } from '../csv-to-json.js'
import { printCombination } from './ScheduleGenerator.js'


const inputfile = document.getElementById("inputfile")
const fileSelectBtn = document.querySelector('#fileSelect')


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
        var reader = new FileReader();
        reader.readAsText(uploadedFile);
        reader.onload = function (e) { handelFile(e.target.result, uploadedFile.type); }
    } else {
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
    ];
    return fileTypes.includes(file.type);
}

// select department
let DepOptionts = document.getElementById('Dep');
DepOptionts.addEventListener('change', selectDepartment);

function selectDepartment(e) {
    if (DepOptionts.options[DepOptionts.selectedIndex].value == "cs") {
        parseFile(csvToJSONObject(coursesInfo))
    }
}

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

    CourseDiv.appendChild(CourseSelect);
    CourseDiv.appendChild(selectAllLabel);
    CourseDiv.appendChild(checkboxes);

}

function handleCorrespondingOptionOfCheckbox(target) {
    // const  = e.target
    const targetSelectID = target.id
    const selector = targetSelectID.includes('group') ? 'GroupSelect' : 'CourseSelect'
    console.log(target.getAttribute('id'))

    const selectOptions = Array.from(document.querySelector(`#${selector}`).options)
    console.log(target.getAttribute('index'))

    const index = target.getAttribute('index')
    if (target.checked) {
        selectOptions[index].selected = true
        target.parentElement.classList.add('selected')
    }
    else {
        selectOptions[index].selected = false
        target.parentElement.classList.remove('selected')

    }
}

function createGroupSelect(groupList) {
    var GroupSelect = document.createElement("select");
    GroupSelect.id = "GroupSelect";
    GroupSelect.setAttribute("multiple", "true");

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
        const label = createLabelCheckboxElement(name, index, 'group')
        checkboxes.appendChild(label)
    }
    // Create select all label 
    const selectAllLabel = createSelectAllCheckboxElement('تحديد كل المجموعات', 'group')

    GroupDiv.appendChild(GroupSelect);
    GroupDiv.appendChild(selectAllLabel);
    GroupDiv.appendChild(checkboxes);
}

function CreateSelectCourseUI() {
    // Delete Header and Department Select
    // document.getElementById('selectdep').remove()

    // Hide home screen 
    document.querySelector('#home-screen').style.display = "none"

    // Choose course button
    let chooseCoursesBtn = createBtn(chooseCoursesBtnObj)

    // Create Course Select
    createCourseSelect(courseList)

    CourseDiv.appendChild(chooseCoursesBtn);
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
    console.log('type',type)
    let checkboxes = Array.from(document.querySelectorAll(`#${type}-checkboxes input`));
    const selectAllCheckbox = document.querySelector(`#${type}-selectall`)
    console.log('checkboxes',checkboxes)
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