// require needed libraries (cheerio for server side JQuery manipulation)
var request = require('request');
var cheerio = require('cheerio');

function onClassSelected(err, res, body) {
    if (!err && res.statusCode === 200) {
        console.log('Yes!!');
    } else {
        console.log('Class request failed!');
    }
}

// finds all classes based on the subject and term and calls onClassSelected for each class
function onSubjectSelected(err, res, body) {
    if (!err && res.statusCode === 200) {
        console.log('Got it!');
        $('#ctl00_BodyContentPlaceHolder_crsredir1_lstCourseNormal option').each(function () {
            if (this.type === 'tag' && this.name === 'option') {
                var myClass = this.attrib.value.split(' ').join('+');
                url = 'http://www.registrar.ucla.edu/schedule/detselect.aspx?termsel=' + encodedTerm +
                    '&subareasel=' + encodedSubjects + '&idxcrs=' + myClass, onClassSelected;
                console.log(url);
                request(url, onClassSelected);
            }
        });
    } else {
        console.log('Subject request failed!');
    }
}

request('http://www.registrar.ucla.edu/schedule/schedulehome.aspx', function (err, res, body) {
    if (!err && res.statusCode === 200) {
        $ = cheerio.load(body);

        $('#ctl00_BodyContentPlaceHolder_SOCmain_lstTermDisp option').each(function () {
            if (this.type === 'tag' && this.name === 'option') {
                var term = this.attribs.value.split(' ').join('+');
                $('#ctl00_BodyContentPlaceHolder_SOCmain_lstSubjectArea option').each(function () {
                    if (this.type === 'tag' && this.name === 'option') {
                        var subject = this.attribs.value.split(' ').join('+');
                        var url = 'http://www.registrar.ucla.edu/schedule/crsredir.aspx?termsel=' + term + 
                            '&subareasel=' + subject;
                        console.log(url);
                        request(url, onSubjectSelected);
                    }
                });
            }
        });
    }
});
