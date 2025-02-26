(function() {
    'use strict';

    async function eachAsync(func,asyncFunc){
        this.forEach(item => {
            func(item);
        });
        await asyncFunc();
    };

    const mapData = {
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

    function toJson(element){
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

})();