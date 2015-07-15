
var injector = {
    tabId: null,
    host: null,
    protocol: null,
    url: null,

    setData: function(key, value)
    {
        localStorage[key] = JSON.stringify(value);
    },

    getData: function(key)
    {
        if(typeof localStorage[key] == 'undefined')
        {
            return null;
        }
        return JSON.parse(localStorage[key]);
    },

    loadSelectedTab: function()
    {
        chrome.tabs.query({ active: true, windowId: chrome.windows.WINDOW_ID_CURRENT }, function(tabs)
        {
            injector.tabId = tabs[0].id;
            injector.host  = tabs[0].url.match(/:\/\/(.[^\/]+)/)[1];
            injector.protocol = tabs[0].url.substring(0,5) == 'https' ? 'https' : 'http';
            injector.url = injector.protocol + "://" + injector.host;

            var hosts = injector.getData('hosts') || [];

            if(hosts.indexOf(injector.url) == -1)
            {
                hosts.push(injector.url);
            }
            injector.setData('hosts', hosts);

            hosts.forEach(function(host)
            {
                var $option = $('<option>' + host + '</option>');
                if(host == injector.url)
                {
                    $option.attr('selected', 'selected');
                }
                $('#host').append($option);
            });

            injector.hostChange();
        });
    },

    hostChange: function()
    {
        var form = injector.getData($('#host').val()) || {enabled: false, scripts: ''};
        $('#enabled').attr('checked', form.enabled);
        $('#scripts').val(form.scripts.join("\n"));
    },

    save: function(e)
    {
        e.preventDefault();
        var form = {};
        form.enabled = $('#enabled').is(':checked');
        form.scripts = [];

        $('#scripts').val().match(/[^\r\n]+/g).forEach(function(script)
        {
            form.scripts.push(script);
        });

        injector.setData($('#host').val(), form);

        chrome.tabs.query({active: true, currentWindow: true}, function (tabs)
        {
            var code = 'window.location.replace("");';
            chrome.tabs.executeScript(tabs[0].id, {code: code});
        });

        window.close();
    }
};

$(function()
{
    injector.loadSelectedTab();

    $('#save').on('click', injector.save);
    $('#host').on('change', injector.hostChange);
});
