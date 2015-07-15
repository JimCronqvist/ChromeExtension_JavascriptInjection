
function injectScript(src, where)
{
    var element = document.createElement('script');
    element.src = src;
    document[where || 'head'].appendChild(element);
}

function injectCss(src, where)
{
    var element = document.createElement('link');
    element.rel = 'stylesheet';
    element.type = 'text/css';
    element.href = src;
    document[where || 'head'].appendChild(element);
}

if(typeof String.prototype.endsWith !== 'function')
{
    String.prototype.endsWith = function(suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
}

var injector = {
    host: null,
    protocol: null,
    url: null
};

injector.host  = window.location.href.match(/:\/\/(.[^\/]+)/)[1];
injector.protocol = window.location.href.substring(0,5) == 'https' ? 'https' : 'http';
injector.url = injector.protocol + "://" + injector.host;

chrome.runtime.sendMessage({method: "getLocalStorage", key: injector.url}, function(response)
{
    if(typeof response.data == 'undefined')
    {
        return;
    }
    console.log(response.data);
    try{
        var data = JSON.parse(response.data);
        if(data.enabled)
        {
            data.scripts.forEach(function(script)
            {
                if(script.substring(0, 1) != '#')
                {
                    script.endsWith('.css') ? injectCss(script) : injectScript(script);
                }
            });
        }
    }
    catch(exception){
        console.log('Failed to parse:');
        console.log(response.data);
        console.log(exception);
    }
});


