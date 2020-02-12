var content;

chrome.commands.onCommand.addListener(function(command){
    chrome.storage.local.get(['clipboard'], function(clip){
        if(undefined === clip.clipboard || "" === clip.clipboard){
            content=[];
        }else{
            content = clip.clipboard;
        }
    });
    if(command==="copy"){
        chrome.tabs.executeScript({
            code:"window.getSelection().getRangeAt(0).toString();"
        }, function(selection){
            if(undefined !== selection){
                content.push(generate(selection));
                chrome.storage.local.set({'clipboard': content}, function(data){
                    chrome.tabs.executeScript({
                        code:"console.log(\""+content + "\");"
                    });
                });
                
            }
        });
    }else if(command === "clear"){
        chrome.storage.local.set({'clipboard': ""}, function(){
            content = [];
        });
    }
});

function generate(text){
    text = text.toString().replace(/\"|\'|\n/gi, function(data){
        if(data === '\"'){
            return '\\"';
        }else if(data === "\'"){
            return "\\'";
        }else{
            return " ";
        }
    });

    var m = new Date();
    var time =
        ("0" + m.getDate()).slice(-2) + "/" +
        ("0" + (m.getMonth())).slice(-2) + "/" +
        m.getFullYear()+ " " +
        ("0" + m.getHours()).slice(-2) + ":" +
        ("0" + m.getMinutes()).slice(-2) + ":" +
        ("0" + m.getSeconds()).slice(-2)+ ":" +
        ("0" + m.getMilliseconds()).slice(-2);
    return '{ \"id\":\"' + content.length + '\",\"content\": \"' + text.toString() + '\",\"time\":\"' + time.toString() + '\"}';
}