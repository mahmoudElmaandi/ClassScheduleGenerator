const localDateOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: "2-digit",
    minute: "2-digit"
};

export function getArabicADString(ad) {
    return new Date(ad).toLocaleDateString('ar-EG', localDateOptions)
};

export function createOption({ department, index: fileIndex }) {
    const option = document.createElement('option')
    option.innerHTML = department;
    option.value = fileIndex
    return option
};

export function fillInFileSec({ name, content, department, term, createdAt }) {
    const filesSec = document.querySelector('#files-sec');
    filesSec.innerHTML += ` 
    <tr>
     <th scope="row">${department} </th>
     <td>${term}</td>
     <td>${getArabicADString(createdAt)}</td>
     <td><button onclick="window.downloadCSV(this)" name="${name}" content= "${content}">  <i class="bi bi-download"></i></button>
     </td>
    </tr>
   `
};