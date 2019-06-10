JSAV Demo
=========

This demo simply provides a form where a sequence alignment (in FASTA
format) can be provided and a CGI script which takes these sequences
and runs JSAV.

To use this demonstration code, you can simply run the makedemo.sh
script:

```
makedemo.sh destdir
```

where `destdir` is the destination directory in the HTML tree.
You must also ensure that Apache is configured to allow overrides in
the directory where you place this code or has ExecCGI set with files
with .cgi extensions interpreted as CGI scripts.

The script:

- places the JSAV code in a sub-directory called JSAV
(`JSAV.js`, `JSAV.css`)
- copies over the `external` sub-directory containing JQuery and JQuery-UI


