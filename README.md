elementool-attachments-downloader
=================================

An export from elementool does not provide the attachments. This fixes that.


### Instructions

 1. <a href="http://nodejs.org/#download">Install node</a> (if you haven't already).
 1. Export your elementool database (if you haven't already).
 1. Open it in excel.
 1. When prompted to select a table, choose `attachments`.
 1. Delete the columns except the first column.
 1. "Save As" "text (tab-delimited) .txt". For convenience, name the file `attachments.txt`.
 1. Move that file, `attachments.txt`, into this project's root folder, `elementool-attachments-downloader`.
 1. Open a command prompt and navigate to this project's root folder, `elementool-attachments-downloader`.
 1. Run `npm install request`.
 1. Run `node app "project name" "username" "password"`.

Depending on your internet connection speed, how busy elementool's servers are (time of day helps),
  and of course, how many attachments, how large they are -- the time to complete could be minutes or hours.
  If it ends with `Complete.`, it worked. Your attachments are in the attachments folder.
  Attachment filenames are prefixed with their elementool issuenumber.
  If that is already your practice, the filenames will become doubly prefixed with the issue number.

Note: If the program does not end with `Complete.`, then it did not process all attachments.
  Look at the output to see where it left off and add that number as a fourth parameter:
  `node app "project name" "username" "password" "# to resume from"`.

Surprisingly, I obtained the best results from node on windows (v0.6.19). It processed all 1200 attachments in one go.
