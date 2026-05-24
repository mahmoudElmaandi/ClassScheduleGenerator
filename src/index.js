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
    const response = await fetch(`https://htireg-courses.onrender.com/latest-courses-file?filter=${filter}`);
    // const response = await fetch(`http://localhost:5000/latest-courses-file?filter=${filter}`);
    return await response.json();
};

const fetchCourseFiles = async () => {
    const response = await fetch(`https://htireg-courses.onrender.com/courses-files`);
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
window.offDaysMap = new Map()

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

async function loadHtml2Canvas() {
    if (window.html2canvas) return
    await new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js'
        script.integrity = 'sha384-ZZ1pncU3bQe8y31yfZdMFdSpttDoPmOZg2wguVK9almUodir1PghgT0eY7Mrty8H'
        script.crossOrigin = 'anonymous'
        script.onload = resolve
        script.onerror = reject
        document.head.appendChild(script)
    })
}

async function exportScheduleAsImage() {
    const scheduleTable = document.querySelector('#Schedule')
    if (!scheduleTable) return
    try {
        await loadHtml2Canvas()
        const canvas = await window.html2canvas(scheduleTable)
        const link = document.createElement('a')
        link.download = 'schedule.png'
        link.href = canvas.toDataURL('image/png')
        link.click()
    } catch (error) {
        window.alert('تعذر تصدير الصورة')
    }
}

function addExportButtons() {
    const scheduleDiv = document.querySelector('#ScheduleDiv')
    if (!scheduleDiv) return

    const exportImageBtn = document.createElement('button')
    exportImageBtn.type = 'button'
    exportImageBtn.setAttribute('id', 'exportScheduleImage')
    exportImageBtn.innerHTML = 'تحميل صورة'
    exportImageBtn.addEventListener('click', exportScheduleAsImage)

    const exportPdfBtn = document.createElement('button')
    exportPdfBtn.type = 'button'
    exportPdfBtn.setAttribute('id', 'exportSchedulePDF')
    exportPdfBtn.innerHTML = 'حفظ PDF'
    exportPdfBtn.addEventListener('click', () => window.print())

    printBTN.insertAdjacentElement('afterend', exportImageBtn)
    exportImageBtn.insertAdjacentElement('afterend', exportPdfBtn)
}

addExportButtons()

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
