import { CSCoursesCSV } from './coursesInfo.js'
import './modules/CourseFileHandler.js'
import './modules/ScheduleGenerator.js'

// import "./style.css"
import { setPrintUI, printSchedule } from './modules/ScheduleHandler.js';

// TODO: improve UI design
window.form = document.getElementById("zero");

window.CombinationLimit = 16e+7; // in decimal form 160000000

// TODO: Document and Demonstrate the features of the script.
// TODO: Allow user to specify unit limit  @select-course-ui.
window.unitLimit = 20

window.coursesInfo = CSCoursesCSV

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