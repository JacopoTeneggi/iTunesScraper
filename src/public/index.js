var source = new EventSource('/analyzer/update-stream');
source.addEventListener('message', function (e) {
    let data = JSON.parse(e.data);
    let type = data.type;
    if (type == 'completed') {
        let completedData = data.completed;
        let progressId = completedData.id;
        let progress = $('#' + progressId);
        let parent = $('#' + progressId).parent();
        let trailingIcon = composeTrailingIcon('done');
        trailingIcon.appendTo(parent);
        progress.remove();
    } else {
        let el = composeEl(data);
        el.appendTo('#updates');
    }
}, false)

$(document).ready(function () {
    $('#start').click(function (e) {
        e.preventDefault();
        $.ajax({
            type: 'POST',
            url: '/analyzer'
        })
    })
});

var composeEl = function (data) {
    let el = $('<li></li>', {
        class: 'mdc-list-item'
    })
    let type = data.type;
    let text = data.text;
    if (text) {
        let listText = $('<span></span', {
            class: 'mdc-list-item__text',
            text: text
        })
        listText.appendTo(el);
    }
    switch (type) {
        case 'progress':
            let progressData = data.progress;
            let progress = composeProgress({ id: progressData.id, type: progressData.type })
            progress.appendTo(el);
            break;
    }
    return el;
}

var composeProgress = function (opts) {
    let id = opts.id;
    let type = opts.type;
    let progress = '<div id=' + id + ' role="progressbar" class="mdc-linear-progress mdc-linear-progress--' + type + '"><div class="mdc-linear-progress__buffering-dots"></div><div class="mdc-linear-progress__buffer"></div><div class="mdc-linear-progress__bar mdc-linear-progress__primary-bar"><span class="mdc-linear-progress__bar-inner"></span></div><div class="mdc-linear-progress__bar mdc-linear-progress__secondary-bar"><span class="mdc-linear-progress__bar-inner"></span></div></div>';
    return $(progress);
}

var composeTrailingIcon = function (icon) {
    let trailingIcon = $('<span></span>', {
        class: "mdc-list-item__meta material-icons",
        text: icon
    });
    return trailingIcon;
}