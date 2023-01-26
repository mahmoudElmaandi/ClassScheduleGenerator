import { drawSchedule, createButtonsofAttandanceMap, enableTravelse, travelsSchedules } from './ScheduleHandler.js'

function printCombination() {
    failedTestDiv.innerHTML = "";

    const selectedGroups = Array.from(document.getElementById("GroupSelect").selectedOptions);
    const coursesCodeMap = new Map();


    // Array of courses, each course has array of its seleted groups time
    coursesTimes = []
    courseGroupsIndexes = []
    totalNoUnits = 0;

    // Examples
    {
        /*
        Ex of coursesCodeMap
        [
            {
                "key": "CSC426",
                "value": 0
            },
            {
                "key": "CSC420",
                "value": 1
            }
        ]
    
        Ex of coursesTimes
        [
            ["44,45,46,27,28","36,37,38,54,55","26,27,28,44,45","23,24,25,41,42","41,42,43,57,58"],
            ["54,55,31,32","56,57,51,52","54,55,41,42","56,57,47,48","51,52,27,28"]
        ]
    
        Ex of courseGroupsIndexes
         not always successive indexes
        [
            [0,1,2,3,4],
            [5,6,7,8,9]
         ]
         */
    }

    // make sure that more than one course is selected
    //make sure atleast one group is selected
    if (selectedGroups.length == 0) {
        window.alert("يرجى اختيار مجموعة واحدة على الأقل");
        empty()
    }
    else {
        selectedGroups.forEach(group => {
            const courseCode = group.value
            const courseUnit = group.getAttribute('unit')
            const groupTime = group.getAttribute('time')
            const groupIndex = group.index

            if (!coursesCodeMap.has(courseCode)) {
                const courseIndex = coursesTimes.length
                // this allow to push groups time of same course into one array
                coursesCodeMap.set(courseCode, courseIndex)

                coursesTimes.push([groupTime])
                courseGroupsIndexes.push([groupIndex])

                // total number of units 
                totalNoUnits += parseInt(courseUnit)
            } else {
                let index = coursesCodeMap.get(courseCode)
                coursesTimes[index].push(groupTime)
                courseGroupsIndexes[index].push(groupIndex)
            }
        })

        if (coursesCodeMap.size == 0) {
            window.alert("يرجى اختيار مادتين مختلفتين على الأقل");
            empty()
        }
        else {
            const printCombination = document.getElementById('printCombination')
            printCombination.disabled = true;
            printCombination.innerHTML = " ..... جاري طباعة الاحتمالات"

            function proceed() {
                setTimeout(() => {
                    checkNoCombinations();
                    empty();
                }, 20);
                document.title = 'تصفح الجداول'
            }

            // Check number of units
            if (document.querySelector("#isFailingStu").checked) {
                proceed()
            } else {
                if (totalNoUnits <= unitLimit) proceed()
                else {
                    showCombinationsResult(" عدد الواحدات  " + totalNoUnits + "&#10;" + "وقد تخطت الحد المسموح" + " 20");
                    empty()
                }
            }
        }
    }
}

// To get number of combinations
function getNoCombinations() {
    let numberofcomb = 1
    for (let i = 0; i < coursesTimes.length; i++) {
        numberofcomb = numberofcomb * coursesTimes[i].length;
    }
    return numberofcomb
}

function checkNoCombinations() {
    const numberofcomb = getNoCombinations()

    if (numberofcomb < CombinationLimit) {
        generateCombinations()
    } else {
        // To prevent crashing
        showCombinationsResult(" عدد الاحتمالات  " + numberofcomb + "&#10;" + "وقد تخطت الحد المسموح");

    }
}

function generateCombinations() {
    numresult = generateAllPossibleCombinations(coursesTimes);
    textresult = generateAllPossibleCombinations(courseGroupsIndexes);
    checkOverlapping();
}

// It takes array having selected courses's times
function generateAllPossibleCombinations(arr) {
    // base case
    if (arr.length === 0) { return []; }
    else if (arr.length === 1) { return arr[0]; }
    else {
        var result = [];
        var allCasesOfRest = generateAllPossibleCombinations(arr.slice(1));
        for (var c in allCasesOfRest) {
            for (var i = 0; i < arr[0].length; i++) {
                result.push(arr[0][i] + "," + allCasesOfRest[c]);
            }
        }
        return result;
    }
}

// TO:DO - Change Implementation
function getNoAttendanceDays(currentScheduleTimes, isReturnAsText) {
    var from = [11, 21, 31, 41, 51]; // 61
    var TO = [18, 28, 38, 48, 58]; // 68

    var noAttendanceDays = 0;
    var textResult = "";
    var nonAttendanceDaysList = [];
    let scheduleTimes = currentScheduleTimes.split(",");

    // Loop from day 1 to 5 through ScheduleTimes and check if current period allocate a day.
    for (var o = 0; o < from.length; o++) {

        for (var i = 0; i < scheduleTimes.length; i++) {
            const currentPeriodTime = scheduleTimes[i];
            // if current period time is equal or in between from, to, then increment noAttendanceDays and break inner loop
            if (currentPeriodTime != '' && currentPeriodTime >= from[o] && currentPeriodTime <= TO[o]) {
                noAttendanceDays += 1;
                break;
            }
            // keep checking until last period of the ScheduleTimes
            // if inner loop didn't break, push current day [o+1] as a non attendance day
            if (i == scheduleTimes.length - 1) {
                nonAttendanceDaysList.push(o + 1)
            }
        }
    }

    textResult = "الحضور:" + noAttendanceDays;

    // If there is non Attendance Days
    if (nonAttendanceDaysList.length != 0) {
        textResult += "&#10;" + "الاجازة:";
        for (i = 0; i < nonAttendanceDaysList.length; i++) {
            switch (nonAttendanceDaysList[i]) {
                case 1: textResult += "السبت "; break;
                case 2: textResult += " الاحد "; break;
                case 3: textResult += " الاثنين "; break;
                case 4: textResult += " الثلاثاء "; break;
                case 6: textResult += " الخميس "; break;
                case 5: textResult += " الاربعاء "; break;
            }
        }
    }
    // Return Result Days as Text
    if (isReturnAsText) {
        return textResult
    }

    // Return Number of Attendance Days as Number
    return noAttendanceDays;
}

function checkOverlapping() {
    for (var k = 0; k < numresult.length; k++) {
        const co = numresult[k].split(",");
        // var overlap;
        // const set = new Set(co);
        // if (set.size == co.length) {
        //   nooverlapcombintion.push(k)
        // }

        // check is there's overlap
        function set() {
            const len = co.length
            for (let i = 0; i < len; i++) {
                for (let j = i + 1; j < len; j++) {
                    if (co[i] == co[j]) {
                        return true;
                    }
                }
            } return false;
        }
        if (set() == false) { nooverlapcombintion.push(k); }
    }

    if (nooverlapcombintion.length == 0) {
        showCombinationsResult(" عدد الاحتمالات  " + textresult.length + "&#10;" + "  الناجحة منها " + nooverlapcombintion.length + " هناك تداخل في مواعيد المواد المختارة ");
    }

    else {
        createCombinationTestUI()
        TestID = TestID + 1;
        selectTableNum += 1;
    }
}

// TODO: Split and Improve 
function createCombinationTestUI() {
    if (TestID == 1) {
        //  Container for all Combination Tests
        var CombinationTestsContainer = document.createElement("div");
    }
    else {
        var CombinationTestsContainer = document.getElementsByName("CombinationTestsContainer")[0];
    }

    CombinationTestsContainer.setAttribute("name", 'CombinationTestsContainer');
    CombinationTestsContainer.setAttribute("class", 'CombinationTestsContainer');
    form.appendChild(CombinationTestsContainer);

    // CombinationTestDiv has Toggle Btn and CombinationResultContainer
    var CombinationTestDiv = document.createElement("div");
    CombinationTestDiv.setAttribute('class', 'CombinationTestDiv');
    CombinationTestDiv.setAttribute("id", TestID);
    CombinationTestsContainer.appendChild(CombinationTestDiv);

    // Hide/Show Combination Result Container
    var toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.setAttribute("name", TestID);
    toggleBtn.setAttribute("class", "collapsible active");
    toggleBtn.innerHTML = " المحاولة " + TestID;
    toggleBtn.addEventListener("click", toggleCombinationResult);
    CombinationTestDiv.appendChild(toggleBtn);

    // Combination Result contains hide,delete btns
    var CombinationResultContainer = document.createElement("div");
    CombinationResultContainer.setAttribute('class', 'CombinationResultContainer');
    CombinationResultContainer.setAttribute("id", "ResultContainer" + TestID);
    CombinationResultContainer.style.display = "block";

    var TestSummary = document.createElement("P");
    TestSummary.setAttribute('id', 'TestSummary')
    const TestSummaryTxt = " عدد الاحتمالات  " + textresult.length + " | " + " الناجحة منها " + nooverlapcombintion.length + " | " + " عدد الواحدات المسجلة " + totalNoUnits;
    TestSummary.innerHTML = TestSummaryTxt;
    CombinationResultContainer.appendChild(TestSummary);
    CombinationTestDiv.appendChild(CombinationResultContainer);


    // Delete Button
    var deleteCombinationTestBtn = document.createElement("button");
    deleteCombinationTestBtn.type = "button";
    deleteCombinationTestBtn.setAttribute("class", TestID);
    deleteCombinationTestBtn.setAttribute("id", 'deleteCombinationTestBtn');
    deleteCombinationTestBtn.addEventListener("click", deleteCombinationTest);
    deleteCombinationTestBtn.innerHTML = "حذف";
    CombinationResultContainer.appendChild(deleteCombinationTestBtn);

    function deleteCombinationTest() {
        form.children[2].removeChild(document.getElementById(this.className));
        // if there is no more Combination Test
        if (document.getElementsByClassName('CombinationTestDiv').length == 0) {
            ScheduleDiv.style.display = 'none';
            Schedule.style.display = 'none';
            document.getElementById('tableInfo').style.display = 'none';
        }
    }

    // Hide Button
    var hideCombinationTestBtn = document.createElement("button");
    hideCombinationTestBtn.type = "button";
    hideCombinationTestBtn.setAttribute("id", 'hideCombinationTestBtn');
    hideCombinationTestBtn.addEventListener("click", hideCombinationTest);
    hideCombinationTestBtn.innerHTML = "إخفاء";
    CombinationResultContainer.appendChild(hideCombinationTestBtn);

    function hideCombinationTest() {
        var ele = this.parentElement.parentElement;
        ele.children[0].click()
    }

    Schedule.style.display = 'inline-table';
    ScheduleDiv.style.display = 'block'
    ScheduleDiv.style.display = 'block'
    ScheduleDiv.style.height = '1000px';

    function createScheduleHandlerUI() {
        // attendance div
        let attendanceDiv = document.createElement('div')
        attendanceDiv.setAttribute('id', 'attendanceDiv');
        attendanceDiv.setAttribute('class', 'attendanceDiv' + selectTableNum);
        CombinationResultContainer.appendChild(attendanceDiv);

        var tableSelect = document.createElement("select");
        tableSelect.setAttribute("id", "TableSelectT");
        tableSelect.setAttribute("class", "TableSelectT" + selectTableNum);
        tableSelect.addEventListener('change', (event) => {
            drawSchedule(event.target.value)
            enableTravelse(event.target.className)
        })



        for (var i = 0; i < nooverlapcombintion.length; i++) {
            let indexselect = i + 1
            var Tableoption = document.createElement("option");
            Tableoption.innerHTML = indexselect;
            Tableoption.value = textresult[nooverlapcombintion[i]];
            tableSelect.appendChild(Tableoption);

            let attendanceDays = getNoAttendanceDays(numresult[nooverlapcombintion[i]])
            if (attendanceDays < 5) {
                // console.log('attendanceDays', attendanceDays, i)
                // if attendanceDays exists, push the new index
                if (attendanceDaysMap.has(attendanceDays)) {
                    let arr = Array.from(attendanceDaysMap.get(attendanceDays)).concat([i])
                    attendanceDaysMap.set(attendanceDays, arr)
                    // console.log('value', attendanceDaysMap.get(attendanceDays))
                } else {
                    attendanceDaysMap.set(attendanceDays, [i])
                }
            }
        }

        createButtonsofAttandanceMap(attendanceDaysMap)
        drawSchedule(tableSelect.options[0].value)

        // Travelsing Buttons
        var previous = document.createElement('button')
        previous.setAttribute("type", "button");
        previous.setAttribute('id', "TableSelectT" + selectTableNum);
        previous.setAttribute('class', 'previous');
        previous.addEventListener('click', travelsSchedules);
        previous.innerHTML = '&#10094;';

        var next = document.createElement('button');
        next.setAttribute("type", "button");
        next.setAttribute('id', "TableSelectT" + selectTableNum);
        next.setAttribute('class', 'next');
        next.addEventListener('click', travelsSchedules);
        next.innerHTML = '&#10095;';

        CombinationResultContainer.appendChild(previous);
        CombinationResultContainer.appendChild(tableSelect);
        CombinationResultContainer.appendChild(next);
    }
    createScheduleHandlerUI()
}

function empty() {
    coursesTimes = []
    courseGroupsIndexes = []
    nooverlapcombintion = [];
    numresult = [];
    textresult = [];
    totalNoUnits = 0;
    attendanceDaysMap = new Map()
    if (document.getElementsByName('CombinationTestsContainer')[0] != undefined) {
        Autocollap(TestID - 1);
    }
    const printCombination = document.getElementById('printCombination')
    printCombination.disabled = false;
    printCombination.innerHTML = "اطبع الاحتمالات"
}

function showCombinationsResult(txtresult) {
    if (TestID == 1) {
        var CombinationTestsContainer = document.createElement("div");
        CombinationTestsContainer.setAttribute("name", 'CombinationTestsContainer');
        CombinationTestsContainer.setAttribute("class", 'CombinationTestsContainer');
        form.appendChild(CombinationTestsContainer);
    }

    var dresiltiv = document.createElement("div");
    dresiltiv.setAttribute("id", TestID);
    dresiltiv.innerHTML = txtresult;
    // Delete the output for each try
    var delbtn = document.createElement("button");
    delbtn.type = "button";
    delbtn.setAttribute("class", TestID);
    delbtn.setAttribute("id", 'Specdelbtn');
    delbtn.innerHTML = " حذف المحاولة الفاشلة " + TestID;
    failedTestDiv.appendChild(dresiltiv);
    failedTestDiv.appendChild(delbtn);
    delbtn.setAttribute("onclick", "failedTestDiv.removeChild(document.getElementById(this.className));failedTestDiv.removeChild(document.getElementsByClassName(this.className)[0]);");
    TestID = TestID + 1;
    window.scrollBy(0, 250);
}





// auto collap after each try
function Autocollap(current) {
    Array.from(document.getElementsByName('CombinationTestsContainer')[0].children).forEach(
        (ele) => {
            if (ele.children[0].name == current) {
            } else {
                if (ele.children[0].classList.contains('active')) {
                    ele.children[0].click()
                }
            }
        })
}


function toggleCombinationResult(event) {
    let thisB = event.target
    var resCollaDiv = document.getElementById("ResultContainer" + thisB.name);
    if (!(thisB.classList.contains('active'))) {
        thisB.classList.toggle("active");
    } else {
        thisB.classList.remove("active");
    }
    if (resCollaDiv.style.display == "block") {
        resCollaDiv.style.display = "none";
    } else {
        resCollaDiv.style.display = "block";
    }
}

export { generateAllPossibleCombinations, printCombination, getNoAttendanceDays }