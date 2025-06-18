export const debounce = (fn, delay) => {
    let timer;
    return function() {
        let context = this, args = arguments;
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(context, args), delay);
    };
};

export function loadScripts(){
    // Extract and execute scripts from the new content
    Dom.query('script').each((script) => {
        const newScript = document.createElement("script");
        if (script.src) {
            newScript.src = script.src;  // Reload external scripts
        } else {
            newScript.textContent = script.textContent;  // Re-execute inline scripts
        }
        document.body.appendChild(newScript);
    });
}


export async function eachAsync(func,asyncFunc){
    this.forEach(item => {
        func(item);
    });
    await asyncFunc();
};
export function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

export const mapData = {
    'P':'paragraph',
    'H':'header',
    'LI':'list',
    'DIV':'paragraph',
    'IMG':'image',
    'undefined':'paragraph',
    undefined:'paragraph',
    'H2':'header',
    'H3':'header',
    'H4':'header',
    'H5':'header',
    'H6':'header',
};

export function toJson(element){
    let blocks = [];

    for(let elem of element.children){
        if(!mapData[elem.nodeName]){
            console.log(elem.nodeName);
            continue
        }
        let type = mapData[elem.nodeName];

        if(!type)
            continue;

        let node = {
            type: type,
            data:{
                text: elem.html()
            }
        };

        if(type == 'header')
            node.data.level = elem.nodeName.match('[0-9]+')[0];

        blocks.push(node);
    }

    return blocks;
};