$("#content").css("margin-top", $("#menu").height() + 10);

var content = [];
var lang = "es";
var tooltip;
var button;
var popperInstance = null;
main();

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

function generateCard(text, timeBase){
    time = dateString(timeBase);
    return '<div class="card mx-auto m-2 my-4 p-2 text-center w-100 blockquote mb-0"><div class="d-flex justify-content-end"><a id="copy" href="#" class=""><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="24" height="24" viewBox="0 0 24 24"><path d="M17,9H7V7H17M17,13H7V11H17M14,17H7V15H14M12,3A1,1 0 0,1 13,4A1,1 0 0,1 12,5A1,1 0 0,1 11,4A1,1 0 0,1 12,3M19,3H14.82C14.4,1.84 13.3,1 12,1C10.7,1 9.6,1.84 9.18,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3Z" /></svg></a><div id="tooltip" role="tooltip">Copy<div id="arrow" data-popper-arrow></div></div></div><p>' + text + '</p><footer class="blockquote-footer text-center w-75 mx-auto">' + time + '</footer></div>';
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

function create() {
    button=copy;
    popperInstance = Popper.createPopper(button, tooltip, {});
}

function destroy() {
    if (popperInstance) {
        popperInstance.destroy();
        popperInstance = null;
    }
}

function show() {
    tooltip.setAttribute('data-show', '');
    create();
}

function hide() {
    tooltip.removeAttribute('data-show');
    destroy();
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
            setCopys();
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
    }else if(opc==="es" || opc==="en"){
        chrome.storage.local.set({'lang': opc}, function(data){
            lang = opc;
            setButton();
            setCopys();
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
            ant.find("svg").css("fill", "black");
            ant.find("footer").css("color", "gray");
        }
        copyToClipboard(text, el);
        $(this).parent().parent().addClass("copied");
        $(this).parent().parent().css({"transition": "1s","background-color": "green", "color": "white"});
        $(this).parent().parent().find("p").css({"transition": "1s","color": "white", "color": "white"});
        $(this).parent().parent().find("svg").css({"transition": "0s", "fill": "white"});
        $(this).parent().parent().find("footer").css({"transition": "1s", "color": "white"});
        if(null!==popperInstance){
            hide();
        }    
        tooltip = el.parent().parent().find("#tooltip")[0];
        button = el;
        show(el);
    });
});

chrome.commands.onCommand.addListener(function(command){
    if(command === "clear"){
        chrome.storage.local.set({'clipboard': ""}, function(){
            content = [];
        });
        $("#content").html("");
    }
});