let TAG_SPAN_CIRCLE_START = '<span class="ui red circular';
let TAG_SPAN_START = '<span';
let TAG_SPAN_CLOSE = '</span>';
let P_START = '<p>';
let P_END = '</p>';
count = (inputString, searachString) => {
    inputString += '';
    //searachString += '';
    if (searachString.length <= 0) {
        return 0;
    }
    var subStr = searachString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return (inputString.match(new RegExp(searachString, 'gi')) || []).length;
};
cleanAllSpans = (html) => {
    // console.log('in cleanAllSpans');
    return cleanSpan(cleanSpanCircular(html));
};
cleanSpan = (html) => {
    // removes all span tag entries
    //console.log('in cleanSpan');
    while (-1 < html.indexOf(TAG_SPAN_START)) {
        html = cleanSpanSingle(html);
    }
    return html;
};
cleanSpanSingle = (html) => {
    // removes one single span, keeps data
    //console.log('in cleanSpanSingle')
    let start = 0, end = 0, _html = '';
    start = html.indexOf(TAG_SPAN_START);
    if (start > -1) {
        //console.log('cleanSpan Start');
        _html = html.substring(0,start);
        html = html.substring(start);
        //console.log(_html);
        //console.log(html);
    }
    end = html.indexOf(">");
    if (end > -1) {
        //console.log('cleanSpan End');
        html = html.substring(end + 1); // add length of </span>
        //console.log(html);
        html = _html + html;
        //console.log('cleanSpanCircular Leftofer')
        //console.log(html);
    }
    start = html.indexOf(TAG_SPAN_CLOSE);
    if (start > -1) {
        //console.log('cleanSpan TAG_SPAN_CLOSE');
        _html = html.substring(0,start);
        html = _html + html.substring(start + TAG_SPAN_CLOSE.length);
        //console.log(_html);
        //console.log(html);
    }
    return html;
};    
cleanSpanCircular = (html) => {
// removes all circular span and it's data
//console.log('in cleanSpanCircular');
while (-1 < html.indexOf(TAG_SPAN_CIRCLE_START)) {
    html = cleanSpanCircularSingle(html);
}
return html;
};
cleanSpanCircularSingle = (html) => {
// removes single circular span and it's data
//console.log('in cleanSpanCircularSingle')
//console.log(html);
let start = 0, end = 0, _html = '';
start = html.indexOf(TAG_SPAN_CIRCLE_START);
//console.log('start: ' + start);
if (start > -1) {
    //console.log('cleanSpanCircular Start ' + start);
    _html = html.substring(0,start);
    html = html.substring(start);
    //console.log(_html);
    //console.log(html);
}
end = html.indexOf(TAG_SPAN_CLOSE);
//console.log(end);
if (end > -1) {
    //console.log('cleanSpanCircular End ' + end);
    html = html.substring(end + TAG_SPAN_CLOSE.length); 
    if (html.substring(0,1) == ' '){
        html.substring(1);  // VERIFY for two spaces 
    }
    // add length of </span> + one space ' '
    //console.log(html);
    html = _html + html;
    //console.log('cleanSpanCircular Leftofer')
    //console.log(html);
}
return html;
};

function getSelectionCharOffsetsWithin() {
var start = 0, end = 0, text='', circleSpansTextLength = 0, circularOnly = false;
var sel, range, priorRange, spanRange, doRangeOffsetSpan = false;
var snippet, page, loop;
sel = window.getSelection();
let tag, pageHTML, pageOriginal, snippetOuterHTML, sinppetIndex =0, cnt;
let rangeOffset = 0, offsetStart = 0, offsetEnd = 0, snippetText = '', description = '', computedDesc='';
let elm, elm1, elmStart, elmEnd, elmList=[], noOrphanTag = true, results = [], result;
//console.log(window.getSelection())
if (typeof window.getSelection() != "undefined" ) {
    try {
    range = window.getSelection().getRangeAt(0);
    //console.log(range);
    elmStart = range.startContainer;
    elmEnd = range.endContainer;
    //console.log(elmStart);
    //console.log(elmEnd);
    elmList.push(elmStart);
    if(!elmStart.isSameNode(elmEnd)) {
        elm = elmStart.nextSibling;
        while((elm != null) && !(elm.isSameNode(elmEnd) || elm.isSameNode(elmStart))) {
            console.log(elm);
            if (elm.hasChildNodes) {
                elm1 = elm.childNodes[0];
                //console.log(elm1);
                if (elm1) {
                    if (elm1.isEqualNode(elmEnd)) {
                        console.log('operlaping span')
                        break;
                    }
                }
            }
            elmList.push(elm);
            elm = elm.nextSibling;
        }
        elmList.push(elmEnd);
    }
    //console.log(elmList);
    //console.log('elmList.length ' + elmList.length)
    // compute total circle span length (circleSpansTextLength) in seleted elmList, that needs to be
    // subtracted for start offset, has issue subtracting length for last element
    if (elmList.length > 1) {
        for (var idx = 0; idx < (elmList.length - 1); idx++) {
            elm = elmList[idx];
            if (elm.hasChildNodes) {
                doRangeOffsetSpan = true;
                elm1 = elm.childNodes[1];
                console.log(elm1);
                if (elm1 != null) {
                    if(elm1.outerHTML.startsWith(TAG_SPAN_CIRCLE_START)){
                        circleSpansTextLength = circleSpansTextaLength + elm1.innerText.length;
                        console.log('circleSpansTextLength ' + circleSpansTextLength);
                    }
                }
            } 
        }
    }
    let totalSnippet = ''; // used for snippet text for compined list
    if (elmList.length > 1) {
        for (var idx = 0; idx < elmList.length; idx++) {
            elm = elmList[idx];
            totalSnippet = totalSnippet + elm.nodeValue;
        }
    }

    // always returns closest common parent on overlaping tags
    tag = range.commonAncestorContainer.parentNode.outerHTML;
    //console.log('range.commonAncestorContainer.parentNode.outerHTML');
    //console.log(tag);
    // test to make sure not just circluar annotion selected
    if (tag.startsWith(TAG_SPAN_CIRCLE_START)) {
        // reject and warn user as invalid selction in case of true
        circularOnly = true;
    }
    snippet = range.startContainer.parentElement;
    tag = snippet.outerHTML;
    if (tag.startsWith(TAG_SPAN_START)) {
        if (!tag.startsWith(TAG_SPAN_CIRCLE_START)) {
            doRangeOffsetSpan = true;
        }
    }
    //console.log('snippet');
    //console.log(snippet);
    //console.log(tag);
    if (tag.startsWith('<div')) {
        page = snippet;
        //noOrphanTag = false;


    } else {
        // need different alternate to stop on body or html tag
        while (!(tag.startsWith('<p') || tag.startsWith('<P')|| tag.startsWith('<body') || tag.startsWith('<BODY'))) {
            snippet = snippet.parentElement;
            //console.log(tag);
            tag = snippet.outerHTML;
        }
        page = snippet.parentElement;
        tag = page.outerHTML;
        //console.log('page');
        //console.log(page);
        //console.log(tag);
        while (!(tag.startsWith('<div') || tag.startsWith('<DIV')|| tag.startsWith('<body') || tag.startsWith('<BODY'))) {
            page = page.parentElement;
            //console.log(page);
            tag = page.outerHTML;
        }
    }
    //console.log(range.startContainer);
    //console.log(snippet);
    //pageOriginal = page.outerHTML;
    pageOriginal = page.innerHTML;
    pageHTML = cleanAllSpans(pageOriginal);
    snippetOuterHTML = cleanAllSpans(snippet.innerHTML);        
    priorRange = range.cloneRange();
    priorRange.selectNodeContents(page);
    priorRange.setEnd(range.startContainer, range.startOffset);
    start = priorRange.toString().length + 3;
    end = start + range.toString().length;
    text = range.toString();
    rangeOffset = range.startOffset;
    //console.log('rangeOffset: ' + rangeOffset);
    cnt = 0;
    if (doRangeOffsetSpan) {
        var dup = snippet.cloneNode();
        spanRange = document.createRange();
        spanRange.selectNodeContents(snippet);
        spanRange.setEnd(range.startContainer, range.startOffset);
        rangeOffset = spanRange.toString().length;
        //console.log('spanRange.toString()');
        //console.log(spanRange.toString());
        //console.log('rangeOffset In span: ' + rangeOffset);
    } 
//         console.log('pageHTML: ');
//         console.log(pageHTML);
//         console.log('snippetOuterHTML: ');
//         console.log(snippetOuterHTML);
//         console.log('priorRange toString: ' + priorRange.toString().length);
//         console.log(priorRange.toString()); 
    if(noOrphanTag){
        sinppetIndex = count(priorRange.toString(), snippetOuterHTML); // check repeats
        offsetStart = pageHTML.indexOf(snippetOuterHTML); // snippet tag start
        snippetText = snippetOuterHTML;
    } else { // need more testing
        snippetText = elmStart.nodeValue;
        sinppetIndex = count(priorRange.toString(), snippetText)
        offsetStart = pageHTML.indexOf(snippetText);
        snippetOuterHTML = snippetText;
    }
    //console.log('sinppetIndex ' + sinppetIndex);
    cnt = 0;
    //console.log('idx: ' + cnt + ', offsetStart ' + offsetStart);
    while (cnt < sinppetIndex) {
        cnt++;
        if (-1 < pageHTML.indexOf(snippetOuterHTML, offsetStart)) {
            offsetStart = pageHTML.indexOf(snippetOuterHTML, (offsetStart + 1));
            //console.log('idx: ' + cnt + ', offsetStart ' + offsetStart);
        }
    }
    description = range.toString();
    offsetStart = offsetStart + rangeOffset;
    offsetEnd = offsetStart + description.length - circleSpansTextLength;
    // if(!noOrphanTag){
    //     offsetStart = start;
    //     offsetEnd = end;
    // }
    computedDesc = pageHTML.substring(offsetStart, offsetEnd);
    //console.log(offsetStart + ' ' + offsetEnd);
    var _end = computedDesc.indexOf(P_END);
    var _shift = 0;
    var _idx = 0, _tx='', _tx1='';
    let _st = offsetStart, _en = offsetEnd;
    //console.log(computedDesc);
    while (-1 != _end) { // TODO: change to while
        //console.log('P_END');
        _en = _st + _end;
        result = {
            offsetStart: _st,
            offsetEnd: _en,
            snippetText: totalSnippet,
            description: description  // may need to replace with computedDesc
        }
        results.push(result);
        _tx1 = pageHTML.substring(offsetEnd, (offsetEnd + P_END.length)); 
        offsetEnd = offsetEnd + P_END.length;
        _tx = computedDesc.substring(0,_end);
        computedDesc = _tx + computedDesc.substring(_end + P_END.length) + _tx1;
        //console.log(computedDesc);
        _end = computedDesc.indexOf(P_START, _end);
        if (-1 != _end) {
            _st = offsetStart + _end + P_START.length;
            _tx1 = pageHTML.substring(offsetEnd, (offsetEnd + P_START.length));
            offsetEnd = offsetEnd + P_START.length;
            _tx = computedDesc.substring(0,_end);
            computedDesc = _tx + computedDesc.substring(_end + P_START.length) + _tx1;
            _en = _st + _end;
            //console.log(computedDesc);
            _end = computedDesc.indexOf(P_END);  //TODO: back to while loop
        }
        _idx++;
        if (idx > 3) {
            //break;
        }
    }

    if (results.length > 0) {
        result = {
            offsetStart: _st,
            offsetEnd: _en,
            snippetText: totalSnippet,
            description: description  // may need to replace with computedDesc
        }
        results.push(result);
    }
    if (description == computedDesc) {
        //console.log('description == computedDesc ' + description)
    } else {
        // TODO: Uma, enable in case of error
        //console.log('description <> computedDesc "' + description + '" "' + computedDesc + '"');
    }
    //var documentFragment = cloneRange.extractContents();
    //console.log('documentFragment: ');
    //console.log(documentFragment);
    //console.log('*************************************************');
    } catch (error) {
        //DOM Exception
        console.log(error);
    }
} 

if (results.length == 0) {
    result = {
        offsetStart: offsetStart,
        offsetEnd: offsetEnd,
        snippetText: snippetText,
        description: computedDesc  // may need to replace with computedDesc
    }  
    results.push(result);      
}
return {
    pageHTML: pageHTML,
    results: results,
    computedDesc: computedDesc,
    start: start,
    end: end,
    text: text, 
    circularOnly: circularOnly
};
}

function printSelection() {
var sel = getSelectionCharOffsetsWithin();
var pval = document.getElementById("result");
var _txt = '';
//console.log('selection: ');
//console.log(sel);
if (sel.circularOnly) {
    _txt = "Selected Cirular only, invalid text";
} else if (sel.text.length > 0) {
    _txt = "Start: " + sel.start + ", End: " + sel.end + ", Text: '" + sel.text + "', length: " + sel.text.length;
} else {
    _txt = "No selection found.";
}
pval.innerText =  "Selected Text: " +  _txt;
}
function clearSelection() {
var pval = document.getElementById("result");
pval.innerText =  "Selected Text:" ;
}

function formatedRules(text) {
    if (text) {
        // remove rule prefix
        var _text = text.replace(/rule-/g, '');
        // replace ' ' with ','
        _text = _text.replace(/\s+/g, ', ');
        //console.log(_text);
        return _text;
    } else {
        return '';
    }
}
function resetToolbar() {
    $(".icon-bar > a.selected").removeClass("selected");
}
function toggleRule(obj) {
    obj.classList.toggle("selected"); //filp css style 'selected'
    $("#selectedText").removeClass();
    var style = getCurrentRules();
    if (style.length > 0) {
        $("#selectedText").addClass(style);
        document.getElementById("selectedRules").innerText = formatedRules(style);
    }
}
let ruleCount = 0;
let currentrules = [];
function getRuleId() {
    ruleCount++;
    var ruleid = "00000" + ruleCount;
    ruleid = 'rule' + ruleid.substring(ruleid.length - 5);
    //console.log(ruleid);
    return ruleid;
}
function getCurrentRules() {
    var style= '';
    var list = $(".icon-bar > a.selected");
    if(list.length > 0){
        list.map((index, elm) => {
            style = style + elm.id + ' ';
        });
    }
    return style.trim();
}
function applyRules() {
    var selObj = window.getSelection();
    if(!(selObj && selObj.toString().trim().length > 0)) {
        return;
    }
    var rule = {active: true, norepeat: true};
    var style = getCurrentRules();
    //console.log(sel);
    
    if(style.length > 0){
        //var _htm0 = document.getElementById("previewDiv").innerHTML;
        rule.id = getRuleId();
        rule.rules = formatedRules(style)
        rule.text = selObj.toString();
        var sel = getSelectionCharOffsetsWithin();
        rule.start = sel.start;//may be limit to start and end?
        rule.end = sel.end; 
        currentrules.push(rule); //store in global variable for later use
        console.log(currentrules);
       // var _htm =  _htm0.substring(0, sel.start);
       // _htm =  _htm + '<span id="' + rule.id + '" class="'+ style + '">' + _htm0.substring(sel.start, sel.end) + '</span>'
       // _htm =  _htm + _htm0.substring(sel.end);
       // document.getElementById("previewDiv").innerHTML = _htm;
        // update rule history table
        var _history = '';
        var aid;
        if(currentrules.length > 0) { // may be convert text link to icons
            _history = '<div style="width: 100%;">'
            _history = _history + '<span style="float:right;">';
            _history = _history + '<a href="#" onClick="displayRules()">Display Rules</a> | '
            _history = _history + '<a href="#" onClick="showAllRules()">Show All</a> | '
            _history = _history + '<a href="#" onClick="hideAllRules()">Hide All</a> | '
            _history = _history + '<a href="#" onClick="removeAllRules()">Delete All</a></span></div>'           
            _history = _history + '<table id="history"><thead><tr><th>Rules</th><th>Selected Text</th>';
            _history = _history + '<th>Actions</th></tr></thead><tbody>';
            currentrules.map((elm, index) => {
                aid = 'showhide_' + elm.id;
                // console.log(aid);
                _history = _history + '<tr><td>' + elm.rules + '</td><td>';
                _history = _history + elm.text + '</td><td>';
                _history = _history + '<a id="' + aid + '" href="#" onClick="showHideRule(';
                _history = _history + elm.id +')">Hide</a> | <a href="#" onClick=';
                _history = _history +'"removeRule(' + elm.id +')">Remove</td></tr>';
            });
            _history = _history + '</tbody></table>';
        }
        // //console.log(_history);
        document.getElementById("ruleDocument").innerHTML = _history;
        // reset toolbar
        resetToolbar();
        $("#rules-def, #icons-v, #create-rule").addClass('display-none');
        var _html = $("#htmlSrc").html();
        _html = ruleHtmlInsertAll(_html, currentrules);
        document.getElementById("previewDiv").innerHTML = _html;
        document.getElementById("selectedText").innerHTML = "";
        document.getElementById("selectedRules").innerHTML = "";
        $("#selectedRules").removeClass();
    }
}
function getHistorySpanId(text) {
    if (!text) return '';
    if(typeof text === 'object'){
        //var lst = text.classList;
        //console.log(lst); // use this to read class names
        return text.id;
    }
    return text;
}
function showHideRule(id) {
    console.log('showHideRule');
    var _id = getHistorySpanId(id);
    console.log(_id);
    var elm = document.getElementById('showhide_' + _id);
    console.log(elm);
    if (elm) {
        if (elm.innerText === 'Show'){
          elm.innerText = 'Hide';
          $('#'+ obj.id).removeClass('display-none');
        }
        else {
          elm.innerText = 'Show';
          $('#'+ obj.id).addClass('display-none');
        }
    }
}
function removeRule(id) {
    console.log('removeRule');
    var _id = getHistorySpanId(id);
    console.log(_id);
}
function editRule(id) { //not used now
    console.log('editRule');
    var _id = getHistorySpanId(id);
    console.log(_id);
}

function hideAllRules() {
    console.log('hideAllRules');
    if(currentrules.length > 0) {
        currentrules.map((obj) =>{
            var elm = document.getElementById('showhide_' + obj.id);
            $('#'+ obj.id).removeClass('display-none');
            //console.log(elm);
            // set active flag to false
            if (elm) {
                elm.innerText = 'Show';
            }
        });
    }
}
function showAllRules() {
    console.log('showAllRules');
    if(currentrules.length > 0) {
        currentrules.map((obj) =>{
            var elm = document.getElementById('showhide_' + obj.id);
            //console.log(elm);
            // set active flag to true
            if (elm) {
                elm.innerText = 'Hide';
            }
        });
    }
}
function removeAllRules() {
    console.log('removeAllRule');
    if(currentrules.length > 0) {
        // find span by id and remove them
        // empty rules array object
        currentrules.map((obj) =>{
            var elm = document.getElementById('showhide_' + obj.id);
            //console.log(elm);
        });
    }
}
function displayRules() { // mehod to display 'rules' as formated json data
    console.log('DisplayRules');
}

function formatSpan(id, styles, text) {
    var _str = '<span id="'+ id + '" class="' + ruleFormat(id, styles) + '">' + text + '</span>';
    return _str;
}
function ruleFormat(id, rule) {
    if(!rule) return rule;
    rule = rule.replace(/\s/g, ''); // remve any spaces
    if (rule.indexOf(',') > -1) {
        let styles = rule.split(',');
        rule = id;
        styles.map(function(elm){
            rule = rule + ' rule-' + elm;
        });
    } else {
        rule = id + ' rule-' + rule;
    }
    return rule;
}       
function getId(id) {
    return id + ' ';
}
let startShift;
function ruleHtmlInsertAll(html, rules) {
    startShift = 0;
    var _html = html;
    rules.map(function(elm){
        _html = ruleHtmlInsertOne(_html, elm, startShift)
    });
    return _html;
}
function ruleHtmlInsertOne(html, rule, startShift) {
    var st = rule.start + startShift;
    var ed = rule.end + startShift;
    //console.log('ruleHtmlInsertOne');console.log(rule);console.log(startShift);
    //console.log(st);
    var _html = html.substring(0, st);
    var _html1 = ruleToHtml(noolSrc, rule);
    startShift = startShift + (_html1.length - rule.text.length);
    //console.log(startShift);console.log(startShift + rule.end);
    //console.log(html.substring(ed));
    _html = _html + _html1 + html.substring(ed);
    return _html;
}
var noolSrc, flow, Selection;
function ruleToHtml(noolSrc, rule){
    console.log(rule);

    var m = new Selection(rule);
    var session = flow.getSession(m);
    session.match(function(err){
        if(err){
            console.error(err);
        } else{
            session.dispose();
        }
    });
    // if (session)
    //     session.dispose();
    console.log(m.html);
    return m.html;
}
