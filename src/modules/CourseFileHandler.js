import { createBtn, chooseCoursesBtnObj, selectAllBtnObj, unselectAllBtnObj, printCombinationsBtnObj } from '../buttons.js'
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

// Parse JSON to create Course and Group List


function parseFile(coursesDataList) {
    // Loop over coursesDataList and 
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

        // Create Map of course's groups index, to show them only per course.
        // @
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

// TODO: show selected course total unit while selecting @select-course-ui


function createCourseSelect(courseList) {
    var CourseSelect = document.createElement("select");
    CourseSelect.setAttribute("multiple", "true");
    CourseSelect.id = "CourseSelect";
    for (let index = 0; index < courseList.length; index++) {
        const { name, code } = courseList[index];
        let Coption = document.createElement("option");
        Coption.innerHTML = name;
        Coption.value = code;
        CourseSelect.appendChild(Coption);
    }
    CourseDiv.appendChild(CourseSelect);
}

function createGroupSelect(groupList) {
    var GroupSelect = document.createElement("select");
    GroupSelect.id = "GroupSelect";
    GroupSelect.setAttribute("multiple", "true");
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
    }
    GroupDiv.appendChild(GroupSelect);
}

// Split data from view or any dom manipulation
function CreateSelectCourseUI() {
    // Delete Header and Department Select
    document.getElementById('header').remove()
    document.getElementById('selectdep').remove()

    // Unselect options button
    let unselectAllBtn = createBtn(unselectAllBtnObj)

    // Select all options button
    let selectAllBtn = createBtn(selectAllBtnObj)

    // Choose course button
    let chooseCoursesBtn = createBtn(chooseCoursesBtnObj)

    // Create Course Select
    createCourseSelect(courseList)

    CourseDiv.appendChild(chooseCoursesBtn);
    HeaderD.appendChild(unselectAllBtn);
    HeaderD.appendChild(selectAllBtn);
    GroupDiv.appendChild(HeaderD);

    // Create Group Select
    createGroupSelect(groupList)

    form.appendChild(CourseDiv);
    form.appendChild(GroupDiv);

    // Display Course div and Hide Probability
    CourseDiv.style.display = "block";
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
export { parseFile }