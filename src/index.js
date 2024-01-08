import { CSCoursesCSV } from './coursesInfo.js'
import './modules/CourseFileHandler.js'
import './modules/ScheduleGenerator.js'

// import "./style.css"
import { setPrintUI, printSchedule } from './modules/ScheduleHandler.js';
import { createOption, fillInFileSec, getArabicADString } from './utils.js';

// TODO: improve UI design
window.form = document.getElementById("zero");

window.CombinationLimit = 16e+7; // in decimal form 160000000

// TODO: Document and Demonstrate the features of the script.
// TODO: Allow user to specify unit limit  @select-course-ui.
window.unitLimit = 20

// get coursesInfo file online
const fetchCoursesInfoFile = async (filter = "cs") => {
    const response = await fetch(`https://calm-gray-yak-toga.cyclic.app/latest-courses-file?filter=${filter}`);
    // const response = await fetch(`http://localhost:5000/latest-courses-file?filter=${filter}`);
    return await response.json();
};

const fetchCourseFiles = async () => {
    const response = await fetch(`https://calm-gray-yak-toga.cyclic.app/courses-files`);
    return await response.json();
};

(async () => {
    // window.coursesInfo =
    document.querySelector("#invalidMessages").innerHTML += ` <div class="form-check">
    <input class="form-check-input" type="checkbox" style="float: none;margin: 0px;" value="" id="isFailingStu">
    <label class="form-check-label" for="flexCheckDefault">
     هل أنت طالب متعثر؟ قم بالتحديد لإلغاء حد الـ 20 وحدة
    </label>
    </div>`
    window.coursesInfo = {};
    window.validDepValues = [];

    const depSelect = document.querySelector('.form-select');
    depSelect.disabled = true;

    function pushDepFileContent(courseFile) {
        const { content, description, index: fileIndex, department, createdAt } = courseFile;
        if (!content) return
        window.coursesInfo[fileIndex] = content;
        window.validDepValues.push(fileIndex)
        if (description) document.querySelector('#header-note').innerHTML += `${getArabicADString(createdAt)} [[ ${department} :  ${description} ]] <br>`;
        fillInFileSec(courseFile)
    };
    const files = await fetchCourseFiles();
    files.forEach((file, index) => {
        file["index"] = index.toString();
        pushDepFileContent(file)
        depSelect.appendChild(createOption(file));
    });
    depSelect.disabled = false;
})();

window.codesmap = new Map()
window.allGroups = []

window.GroupDiv = document.createElement("div")
window.GroupDiv.id = "GroupSelector"
window.CourseDiv = document.createElement("div");
window.CourseDiv.id = "CourseSelector"

window.HeaderD = document.createElement("div")
window.tableInfo = document.getElementById('tableInfo')
window.failedTestDiv = document.getElementById('failed')
window.attendanceDaysMap = new Map()

window.totalNoUnits = 0
window.coursesTimes = []
window.courseGroupsIndexes = []
window.numresult = []
window.textresult = []
window.nooverlapcombintion = []
window.TestID = 1
window.selectTableNum = 1;


window.TableCellsMap = new Map()
for (let index = 0; index < document.getElementsByClassName("celly").length; index++) {
    TableCellsMap.set(document.getElementsByClassName("celly")[index].textContent, index)
}


const printBTN = document.querySelector('#printSchedule')
printBTN.addEventListener("click", printSchedule)
setPrintUI()

window.downloadCSV = function downloadCSV(target) {
    console.log(target);
    let csv = target.getAttribute("content");
    if (!csv) return;
    let name = target.getAttribute("name");
    csv = csv.replace(/\n/g, "\r\n");
    var blob = new Blob([csv], { type: "text/plain" });
    var anchor = document.createElement("a");
    anchor.download = `${name}.csv`;
    anchor.href = window.URL.createObjectURL(blob);
    anchor.target = "_blank";
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
}