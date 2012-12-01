function cssCollector(){
var css = {
    start: [],
    useful: [],
    useless: []
};

var html = '';

var inlineStyleNodes = [];

// function parseCss -> parse <style> and <link> and convert it into JSON  
function parseCss(){
    var blockCssContainers = $('link, style');
    var self = this;

    $.each(blockCssContainers, function(key, item){
        if(item.nodeName == "STYLE"){
            css.start.push(CSSJSON.toJSON($(item).html()));
        }else{
            $.ajax({
                        url: item.href,
                        dataType: "html",
                        async: false,
                        success: function(response){
                            css.start.push(CSSJSON.toJSON(response));           
                        },
                        error: function(er){
                            
                        }
                    });

        }
    })
}

function parseHtml(){
    html = window.document;
}

function checkSelectorUsefulness(selector){
    try{
        var query = $(html).find(selector);
        return query.length > 0 ? true : false;
    }catch(e){
        //console.log(selector);
        //console.info(e);
    }
}

function checkStyleInstanceOnUsefulness(CssInstance){
    for(var item in CssInstance){
        var selector = {};
        if(!checkSelectorUsefulness(item)){
            selector[item] = CssInstance[item];
            css.useless.push(selector);
        }else{
            selector[item] = CssInstance[item];
            css.useful.push(selector);
        }
    } 
}

function checkStyles(){
    $.each(css.start, function(key, item){
        checkStyleInstanceOnUsefulness(item);
    });
    sortElementByPriority();
}

function sortElementByPriority(){
    css.useful.reverse();           
}

function getInlineStylesNode(){
    inlineStyleNodes = $('*[style]');
}

function checkSelectorsSameness(selA, selB){
    return $(Object.keys( selA ).pop()).equals($(Object.keys( selB ).pop()));
}

function mergeSelectors(selA, selB){
    // TODO! check if property has !important
    for(var cssStyle in selB[Object.keys( selB ).pop()]){
         if(!selA[Object.keys( selA ).pop()][cssStyle]){
                selA[Object.keys( selA ).pop()][cssStyle] = selB[Object.keys( selB ).pop()][cssStyle];
         }
    }
    return true;
}

function removeOverridenObjectFromArray(keyArr){
    var deletedItem = 0;
    for(var i = 0; i<keyArr.length; i++){
        css.useful.splice(keyArr[i] - deletedItem,1);
        deletedItem++
    }
}

function findOverridenStyles(){
    var arrayKeyToDelete = [];
    for(var i = 0; i<css.useful.length-1; i++){
        for(var j = i+1; j<css.useful.length; j++){
            if(i==j) continue;
            
            checkSelectorsSameness(css.useful[i], css.useful[j]) &&
                mergeSelectors(css.useful[i], css.useful[j]) && 
                    arrayKeyToDelete.indexOf(j) == -1 &&
                        arrayKeyToDelete.push(j);
        }   
    }
    
    removeOverridenObjectFromArray(arrayKeyToDelete);
}

function renderTestResult(){
     
}

function runApp(){
    parseCss();
    parseHtml();
    checkStyles();
    findOverridenStyles();
    //renderTestResult()
    console.log(css.useful);
    //console.log(css.useless);
}

runApp();

}