import { createBtn , changeCoursesBtnObj } from '../buttons.js'

// Get Selected Coourses
function selectCourses() {
    var SlelectedCourses = Array.from(document.getElementById("CourseSelect").selectedOptions);
    var GroupOptions = document.getElementById("GroupSelect").options;
    let GroupCheckboxes = Array.from(document.querySelectorAll('#group-checkboxes input'))

    if (SlelectedCourses.length <= 1) {
       // TODO: change alert to a more user friendly way. 
        window.alert("يرجى اختيار مادتين على الأقل");
    } else {

        // Unselect and Hide all group options
        for (let i = 0; i < GroupOptions.length; i++) {
            GroupOptions[i].hidden = true;
            GroupOptions[i].selected = false;
            
            // Hide all group checkbox
            GroupCheckboxes[i].parentElement.hidden = true;
            GroupCheckboxes[i].checked = false;
        }

        // Select and Display only Groups of Selected Courses
        let SlelectedCoursesCodes = SlelectedCourses.map(selectedCourse => selectedCourse.value)

        
        for (let j = 0; j < SlelectedCoursesCodes.length; j++) {
            codesmap[SlelectedCoursesCodes[j]].forEach((groupIndex) => {
                GroupOptions[groupIndex].hidden = false;
                GroupOptions[groupIndex].selected = false;
                
                // Hide corresponding checkbox
                GroupCheckboxes[groupIndex].parentElement.hidden = false;
                GroupCheckboxes[groupIndex].checked = false;
            })
        }
        CreateGroupUI()
    }
    window.scrollBy(0, 120);
}

// Create Choose Groups UI 
function CreateGroupUI() {
    GroupDiv.style.display = "flex";
    CourseDiv.style.display = "none";

    // Create Change Courses Button
    if (document.getElementById("ChangeC") == null) {
        let changeCoursesBtn = createBtn(changeCoursesBtnObj)
        changeCoursesBtn.addEventListener("click", changeSelectedCourses)
        HeaderD.insertBefore(changeCoursesBtn, document.querySelector('#unselectAll'));
    }
    document.title = 'اختيار المجموعات'
}

// Display Course Div
function changeSelectedCourses() {
    GroupDiv.style.display = "none";
    if (CourseDiv.style.display == "flex") {
        CourseDiv.style.display = "none";
    } else {
        CourseDiv.style.display = "flex";
    }
    window.scrollTo(0, 0);
    document.title = 'اختيار المواد'
}

export { selectCourses, changeSelectedCourses }