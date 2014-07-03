JSAV Demo
=========

This demo simply provides a form where a sequence alignment (in FASTA
format) can be provided and a CGI script which takes these sequences
and runs JSAV.

To use this demonstration code, you need to unpack the JSAV code in a
sub-directory called JSAV - this needs to contain JSAV.js, JSAV.css
and the 'external' sub-directory containing JQuery and JQuery-UI

You must also ensure that Apache is configured to allow overrides in
the directory where you place this code or has ExecCGI set with files
with .cgi extensions interpreted as CGI scripts.

