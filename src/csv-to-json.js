function csvToJSONObject(content) {
    // console.log('content',content)
    var arr = content.trim().split("\n");
    let courseObj = {}
    let coursesInfo = []
    for (let index = 0; index < arr.length; index++) {
        let groubRecord = arr[index];
        let ccode = groubRecord.split(';')[3]

        if (courseObj[ccode] != undefined) {
            let oo = courseObj[ccode]
            oo.push(index)
            courseObj[ccode] = oo
        } else {
            courseObj[ccode] = [index]
        }
    }
    // console.log(courseObj)
    let courseCodes = Object.keys(courseObj)
    // console.log(courseCodes)
    for (let index = 0; index < courseCodes.length; index++) {
        const courseCode = courseCodes[index];
        let list = courseObj[courseCode]



        let groups = []
        let courseInfoObj = {}

        list.forEach((recordIndex, index) => {
            let record = arr[recordIndex];
            let splits = record.split(';')
            let
                gnumber = splits[1],
                glecturer = splits[2],
                gtimes = splits[4],
                ccode = splits[3],
                ccname = splits[0],
                unit = splits[5],
                deparment = "CS",
                year = "2021"

            // course info  
            if (index == 0) {
                courseInfoObj.ccname = ccname
                courseInfoObj.ccode = ccode
                courseInfoObj.unit = unit
                courseInfoObj.deparment = deparment
                courseInfoObj.year = year
            }
            // groups info  
            groups.push({ gnumber, gtimes, glecturer })
        });

        // add groups to the main course
        courseInfoObj.groups = groups

        // console.log(courseInfoObj)
        // console.log('==========================')

        coursesInfo.push(courseInfoObj)
    }
    // console.log(coursesInfo[0])
    return coursesInfo
}
export {csvToJSONObject}