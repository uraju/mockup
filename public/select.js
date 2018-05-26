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
    console.log(range);
    elmStart = range.startContainer;
    elmEnd = range.endContainer;
    console.log(elmStart);
    console.log(elmEnd);
    elmList.push(elmStart);
    if(!elmStart.isSameNode(elmEnd)) {
        elm = elmStart.nextSibling;
        while((elm != null) && !(elm.isSameNode(elmEnd) || elm.isSameNode(elmStart))) {
            console.log(elm);
            if (elm.hasChildNodes) {
                elm1 = elm.childNodes[0];
                console.log(elm1);
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
    console.log(elmList);
    console.log('elmList.length ' + elmList.length)
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
                        circleSpansTextLength = circleSpansTextLength + elm1.innerText.length;
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
    console.log('snippet');
    console.log(snippet);
    //console.log(tag);
    if (tag.startsWith('<div')) {
        page = snippet;
        //noOrphanTag = false;


    } else {
        // need different alternate to stop on body or html tag
        while (!(tag.startsWith('<p') || tag.startsWith('<P')|| tag.startsWith('<body') || tag.startsWith('<BODY'))) {
            snippet = snippet.parentElement;
            console.log(tag);
            tag = snippet.outerHTML;
        }
        page = snippet.parentElement;
        tag = page.outerHTML;
        console.log('page');
        console.log(page);
        //console.log(tag);
        while (!(tag.startsWith('<div') || tag.startsWith('<DIV')|| tag.startsWith('<body') || tag.startsWith('<BODY'))) {
            page = page.parentElement;
            console.log(page);
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
    start = priorRange.toString().length;
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
    console.log(computedDesc);
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
        console.log(computedDesc);
        _end = computedDesc.indexOf(P_START, _end);
        if (-1 != _end) {
            _st = offsetStart + _end + P_START.length;
            _tx1 = pageHTML.substring(offsetEnd, (offsetEnd + P_START.length));
            offsetEnd = offsetEnd + P_START.length;
            _tx = computedDesc.substring(0,_end);
            computedDesc = _tx + computedDesc.substring(_end + P_START.length) + _tx1;
            _en = _st + _end;
            console.log(computedDesc);
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
        console.log('description <> computedDesc "' + description + '" "' + computedDesc + '"');
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
console.log(sel);
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

function toggleRule(obj) {
obj.classList.toggle("selected"); //filp css style 'selected'
}
let ruleCount = 0;
function getRuleId() {
    ruleCount++;
    var ruleid = "rule00000" + ruleCount;
    var ruleid = ruleid.substring(ruleid.length - 5);
    //console.log(ruleid);
    return ruleid;
}
function applyRules() {
    var style = '';
    var sel = getSelectionCharOffsetsWithin();
    var selObj = window.getSelection();
    console.log(sel);
    var list = $(".icon-bar > a.selected");
    if(list.length > 0){
        var _htm0 = document.getElementById("previewDiv").innerHTML;
        list.map((index, elm) => {
            style = style + elm.id + ' ';
            //console.log(elm.id);
            });
        var sel = getSelectionCharOffsetsWithin();
        var _htm =  _htm0.substring(0, sel.start);
        console.log(_htm);
        _htm =  _htm + '<span id="' + getRuleId() + '" class="'+ style + '">' + _htm0.substring(sel.start, sel.end) + '</span>'
        console.log(_htm);
        _htm =  _htm + _htm0.substring(sel.end);
        console.log(_htm);
        //console.log(sel);
        document.getElementById("previewDiv").innerHTML = _htm;
    }
}