import { selectCourses } from './modules/CourseSelectHandler.js'

/**
 * @param {Object} btnObject Btn Object 
 * @returns {HTMLButtonElement}
 */
 function createBtn({ id, style, type, innerHTML, onclick, Eventtype }) {
    let btn = document.createElement('button');
    btn.setAttribute('id', id)
    btn.setAttribute('style', style)
    btn.type = type
    btn.innerHTML = innerHTML
    if (onclick != null) {
        if (Eventtype == "listener") {
            btn.addEventListener('click', onclick)
        }
        else {
            btn.setAttribute("onclick", onclick);
        }
    }
    return btn
}

// Choose course button
let chooseCoursesBtnObj = {
    Eventtype: 'listener',
    id: 'chooseCourses',
    style: 'display: block; margin: 5px auto;',
    type: "button",
    innerHTML: "اختيار المواد",
    onclick: selectCourses
}
// select all options button
let selectAllBtnObj = {
    id: 'selectAll',
    style: 'display: block; margin: auto auto 5px;',
    type: "button",
    innerHTML: "تحديد الكل",
    onclick: "var elements = document.getElementById('GroupSelect').options;Array.from(elements).forEach((ele)=>{if(ele.hidden==false){ele.selected = true}} )"
}

// unselect options button
let unselectAllBtnObj = {
    id: 'unselectAll',
    style: 'display: block; margin: auto auto 5px;',
    type: "button",
    innerHTML: "إلغاء تحديد الكل",
    onclick: "var elements = document.getElementById('GroupSelect').selectedOptions;while (elements.length > 0){   elements[0].selected = false;}"
}

// change course button
let changeCoursesBtnObj = {
    Eventtype: 'listener',
    id: 'ChangeC',
    style: 'display: block; margin: 5px auto;',
    type: "button",
    innerHTML: "تغيير المواد",
}

// Print combinations
let printCombinationsBtnObj = {
    // Eventtype: 'listener',
    id: 'printCombination',
    style: 'display: block; margin: 5px auto;',
    type: "submit",
    innerHTML: "اطبع الاحتمالات",
}

export { createBtn , chooseCoursesBtnObj, selectAllBtnObj, unselectAllBtnObj, changeCoursesBtnObj, printCombinationsBtnObj } 