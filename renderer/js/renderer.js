//* Bunch of stuff that does stuff to do stuff with index.html

//! renderer processes run web pages and do not run Node.js by default for security reasons.
//! Hence why we cant run this in here:
//* const os = require("os")
//? it will return with an error "require is not defined"

const form = document.querySelector('#img-form');
const img = document.querySelector('#img');
const outputPath = document.querySelector('#output-path');

const filename = document.querySelector('#filename')
const heightInput = document.querySelector('#height')
const widthInput = document.querySelector('#width');



function loadImage(e) {
    const file = e.target.files[0];

    if(!isFileImage(file)) {
        console.log('Please select an image')
        return
    }

    //* Get original dimensions
    const image = new Image();
    image.src = URL.createObjectURL(file);
    image.onload = function () {
        widthInput.value = this.width;
        heightInput.value = this.height;
    }

    //* Show form, image name and output path
    form.style.display = 'block';
    filename.innerText = file.name;
    outputPath.innerText = path.join(os.homedir(), 'imageresizer');


}


//* Check if the file is image
function isFileImage(file) {
    const acceptedFileTypes = ['image/gif', 'image/png', 'image/jpeg', 'image/jpg']
    return file && acceptedFileTypes.includes(file['type'])
}

img.addEventListener('change', loadImage);
