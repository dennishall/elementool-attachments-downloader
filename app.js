var request = require('request')
  , fs = require('fs');

var accountname = process.argv[2];
var username = process.argv[3];
var password = process.argv[4];
var resumeFromIssueNumberIndex = process.argv[5];

if(process.argv.length < 5){
  console.log('usage:  node app "account name" "username" "password" [optional fourth parameter: "# to resume from"]');
  return;
}

// file that has the list of issue numbers, one per line, that have attachments.
// duplicate issue numbers is ok and expected.
var attachmentslist = 'attachments.txt';
var downloadDirectory = './attachments/';
// if there was a problem, update this value to resume from where you left off.
// set to -1 to start from the beginning


var issueNumbers = fs.readFileSync(attachmentslist).toString().replace(/Issue ID\r?\n/, '').split(/\r?\n/g);
while(issueNumbers[issueNumbers.length-1]=='') issueNumbers.length--;
var issueNumberIndex = -1;
var issueNumber = -1;
var previousIssueNumber = -1;
var serials = "";
var jar = request.jar();
var startTime = new Date();

// log in.
request.post({
  uri: 'https://www.elementool.com/Services/loginPage/enter.aspx?source=f',
  followAllRedirects: true,
  form: {
    actiontype: 'Submit',
    accountname: accountname,
    username: username,
    password: password
  }
}, function(err, response, body){
  // save the "serials"
  serials = '&' + response.request.uri.query;
  // save the cookie to the "cookie jar"
  response.request.headers.cookie.split(/; /g).forEach(function(c){
    jar.add(request.cookie(c));
  });
  // start iterating through the tickets and downloading the attachments
  download_attachments_of_next_ticket();
});


function download_attachments_of_next_ticket(){

  // skip duplicate numbers, resume from where we left off
  while(issueNumber == previousIssueNumber || issueNumberIndex < resumeFromIssueNumberIndex){
    issueNumberIndex++;
    issueNumber = issueNumbers[issueNumberIndex];
  }
  // check for exit condition (no more issueNumbers to process)
  if(typeof issueNumber == 'undefined' || !(1*issueNumber)){
    console.log('Complete. (Elapsed time: ' + (Math.round((((new Date())-startTime)/60000)*10)/10) + ' minutes)');
    return;
  }

  var uri = 'http://www.elementool.com/Services/BugTracking/ViewIssue.aspx?bug_no=';
  uri += issueNumber + '&actionType=display' + serials;

  request(uri, function(err, response, body){
    //Just a basic error check
    if(err && response.statusCode !== 200){
      console.log('Request error.');
      return;
    }
    // identify and download attachments for this ticket
    var needle = "FileSharing/GetFile.aspx";
    var a = body.indexOf(needle);
    while(a > 0){
      var b = body.indexOf('"', a);
      var c = body.indexOf('>', b);
      var d = body.indexOf('<', c);
      var filename = body.substring(c+1, d);
      var fileUrl = body.substring(a, b).replace(/&amp;/g, '&');
      var ws = fs.createWriteStream(downloadDirectory + issueNumber + ' - ' + filename);
      console.log('('+(issueNumberIndex+1) +' of '+ issueNumbers.length+') ' + filename);
      request({uri: "http://www.elementool.com/Services/" + fileUrl, jar:jar}).pipe(ws);
      a = body.indexOf(needle, d);
    }
    // continue processing the queue.
    // todo (complicated) - might need to add connection throttling/pooling
    previousIssueNumber = issueNumber;
    download_attachments_of_next_ticket();
  });

}
