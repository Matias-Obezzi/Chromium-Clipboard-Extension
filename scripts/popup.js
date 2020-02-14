$("#content").css("margin-top", $("#menu").height() + 10);

var content = [];
var lang = "es";
var notif = false;
var touch = false;
var tooltip;
var button;
var popperInstance = null;

chrome.commands.onCommand.addListener(function(command){
    if(command === "clear"){
        chrome.storage.local.set({'clipboard': ""}, function(){
            content = [];
        });
        $("#content").html("");
        $("#menu").removeClass("shadow");
    }
});

main();

function generateCard(text, timeBase){
    time = dateString(timeBase);
    return '<div class="card mx-auto m-2 my-4 p-2 text-center w-100 blockquote mb-0 shadow"><div class="d-flex justify-content-end"><a id="copy" href="#" class="icon-clipboard"></a></div><p>' + text + '</p><footer class="blockquote-footer text-center w-75 mx-auto">' + time + '</footer></div>';
}

function dateString(timeBase){
    dateTemp = timeBase.split(" ")[0].split("/");
    timeTemp = timeBase.split(" ")[1].split(":");
    today = new Date();
    timeTemp = new Date(dateTemp[2], dateTemp[1], dateTemp[0], timeTemp[0], timeTemp[1], timeTemp[2]);
    var diff = today.getTime() - timeTemp.getTime();
    if(lang==="es"){
        if((diff/(1000*60*60*24*30*12)) >=1){
            return("Hace " + Math.round(diff/(1000*60*60*24*30*12)) + " año(s)");
        }else if((diff/(1000*60*60*24*30)) >=1){
            return("Hace " + Math.round(diff/(1000*60*60*24*30)) + " mes(es)");
        }else if((diff/(1000*60*60*24)) >=1){
            return("Hace " + Math.round(diff/(1000*60*60*24)) + " dia(s)");
        }else if((diff/(1000*60*60))>=1){
            return("Hace " + Math.round(diff/(1000*60*60*2)) + " hora(s)");
        }else if((diff/(1000*60))>=1){
            return("Hace " + Math.round(diff/(1000*60)) + " minuto(s)");
        }else if((diff/(1000))>=1){
            return("Hace " + Math.round(diff/(1000)) + " segundo(s)");
        }else{
            return("Hace instantes");
        }
    }else if(lang==="en"){
        if((diff/(1000*60*60*24*30*12)) >=1){
            return(Math.round(diff/(1000*60*60*24*30*12)) + " year(s) ago");
        }else if((diff/(1000*60*60*24*30)) >=1){
            return(Math.round(diff/(1000*60*60*24*30)) + " month(s) ago");
        }else if((diff/(1000*60*60*24)) >=1){
            return(Math.round(diff/(1000*60*60*24)) + " day(s) ago");
        }else if((diff/(1000*60*60))>=1){
            return(Math.round(diff/(1000*60*60*2)) + " hour(s) ago");
        }else if((diff/(1000*60))>=1){
            return(Math.round(diff/(1000*60)) + " minute(s) ago");
        }else if((diff/(1000))>=1){
            return(Math.round(diff/(1000)) + " second(s) ago");
        }else{
            return("Moments ago");
        }
    }
}

function copyToClipboard(text, el) {
    var copyTest = document.queryCommandSupported('copy');
    var elOriginalText = el.attr('data-original-title');
  
    if (copyTest === true) {
      var copyTextArea = document.createElement("textarea");
      copyTextArea.value = text;
      document.body.appendChild(copyTextArea);
      copyTextArea.select();
      try {
        var successful = document.execCommand('copy');
      } catch (err) {
        console.log('Oops, unable to copy');
      }
      document.body.removeChild(copyTextArea);
      el.attr('data-original-title', elOriginalText);
    } else {
      // Fallback if browser doesn't support .execCommand('copy')
      window.prompt("Copy to clipboard: Ctrl+C or Command+C, Enter", text);
    }
}
  
function setButton(){
    if(lang === "es"){
        $("#clean").html("LIMPIAR");
    }else if(lang === "en"){
        $("#clean").html("CLEAN");
    }
}

function setCopys(){
    $("#content").html("");
    for(var i = content.length-1; i>=0; i--){
        $("#content").append(generateCard(JSON.parse(content[i]).content, JSON.parse(content[i]).time));
    }
}

function setNotif(){
    touch = false;
    elem = $(".custom-control-label");
    if(lang==="es"){
        elem.html("Notificaciones");
    }else if(lang==="en"){
        elem.html("Notifications");
    }
    if(notif){
        $("#notif-state").prop("checked", true);
    }
}

function main(){
    chrome.storage.local.get('lang', function(data){
        if(undefined === data.lang){
            chrome.storage.local.set({'lang': lang}, function(data){
                lang = "es";
            });
        }else{
            lang = data.lang;
            setButton();
        }
    });
    chrome.storage.local.get('clipboard', function(clip){
        if(undefined === clip.clipboard){
            content=[];
            console.log("empty");
        }else{
            content = clip.clipboard;
            if(content.length>0){ 
                $("#menu").addClass("shadow");
            }
            setCopys();
        }
    });
    chrome.storage.local.get('notif', function(a){
        if(undefined === a.notif){
            notif = false;
            console.log("empty");
        }else{
            notif = a.notif;
            setNotif();
        }
    });
}

$("a").click(function(){
    opc = $(this).attr("id");
    if(opc==="clean"){
        chrome.storage.local.set({'clipboard': ""}, function(){
            content = [];
        });
        $("#content").html("");
        $("#menu").removeClass("shadow");
    }else if(opc==="es" || opc==="en"){
        chrome.storage.local.set({'lang': opc}, function(data){
            lang = opc;
            setButton();
            setCopys();
            setNotif();
        });
    }else if(opc==="mail"){
        chrome.tabs.create({url: $(this).attr("href")});
    }else if(opc==="rel"){
        main();
    }
});

$(document).ready ( function () {
    $(document).on ("click", "#copy", function () {
        var el = $(this);
        var text = el.parent().parent().find("p").html();
        var ant = $(".copied");
        if(undefined !== ant){
            ant.removeClass('copied');
            ant.css("transition", "0,5s");
            ant.css("background-color", "");
            ant.find("p").css("color", "black");
            ant.find("#copy").css("color", "black");
            ant.find("footer").css("color", "gray");
        }
        copyToClipboard(text, el);
        $(this).parent().parent().addClass("copied");
        $(this).parent().parent().css({"transition": "1s","background-color": "green", "color": "white"});
        $(this).parent().parent().find("p").css({"transition": "1s","color": "white", "color": "white"});
        $(this).parent().parent().find("#copy").css({"transition": "0s", "color": "white"});
        $(this).parent().parent().find("footer").css({"transition": "1s", "color": "white"});
    });
});

$("#notif").click(function(){
    touch = true;
})

$("#notif-state").change(function () {
    if(touch){
        notif = !notif;
        chrome.storage.local.set({'notif': notif}, function(data){
            console.log(notif);
        });
    }
}).change();