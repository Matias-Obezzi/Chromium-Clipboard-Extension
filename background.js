var content = [];
var lang = "es";
var notif = false;
var contBase = 0;
var cont = 0;
var alarm;
var opt = {
    type: "basic",
    title: "Clipboard",
    message: "",
    iconUrl: "media/icon.png"
}

load();

chrome.commands.onCommand.addListener(function(command){
    if(command==="copy"){
        chrome.tabs.executeScript({
            code:"window.getSelection().getRangeAt(0).toString();"
        }, function(selection){
            if(undefined !== selection && selection.toString()!==""){
                content.push(generate(selection));
                chrome.storage.local.set({'clipboard': content}, function(data){
                });
                cont+=1;
                if(notif){
                    if(lang==="es"){
                        textNotification = "Añadido";
                    }else{
                        textNotification = "Added";
                    }
                }else{
                    textNotification = cont-contBase;
                }
                notification(textNotification);
            }
        });
    }else if(command === "clear"){
        chrome.storage.local.set({'clipboard': ""}, function(){
            content = [];
            cont = 0;
            contBase = 0;
            if(notif){
                if(lang==="es"){
                    textNotification = "Borrado";
                }else{
                    textNotification = "Cleared";
                }
            }else{
                textNotification = 0;
            }
            notification(textNotification);
        });
        
    }
});

chrome.storage.local.onChanged.addListener(function(){
    load();
    message("change");
});

function load(){
    loadClip();
    loadLang();
    loadNotif();
}

function loadClip(){
    chrome.storage.local.get(['clipboard'], function(clip){
        if(undefined === clip.clipboard || "" === clip.clipboard){
            content=[];
        }else{
            content = clip.clipboard;
            contBase = content.length();
            cont = contBase;
        }
    });
}

function loadLang(){
    chrome.storage.local.get('lang', function(data){
        if(undefined === data.lang){
            chrome.storage.local.set({'lang': lang}, function(data){
                lang = "es";
            });
        }else{
            lang = data.lang;
        }
    });
}

function loadNotif(){
    chrome.storage.local.get('notif', function(data){
        if(undefined === data.notif){
            chrome.storage.local.set({'notif': notif}, function(data){
                notif = false;
            });
        }else{
            notif = data.notif;
        }
    });
}

function notification(textNotification){
    if(notif){
        opt.message=textNotification;
        chrome.notifications.create(opt);
    }else{
        chrome.browserAction.setBadgeText({"text": textNotification.toString() + ""});
        setTimeout(()=>{
            chrome.browserAction.setBadgeText({"text": ""});
        }, 3000);
    }
}

function generate(text){
    text = text.toString().replace(/\"|\'|\n/gi, "");
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
