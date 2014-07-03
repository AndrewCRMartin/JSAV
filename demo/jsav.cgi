#!/usr/bin/perl 
#*************************************************************************
#
#   Program:    JSAV demo
#   File:       jsav.cgi
#   Version:    V1.0
#   Date:       03.07.14
#
#*************************************************************************
#
#   Description
#   -----------
#   This is a simple CGI script to demonstrate the use of the JSAV
#   alignment viewer
#
#*************************************************************************
use strict;
use CGI;

# Obtain the sequences from the form
my $cgi = new CGI;
print $cgi->header();

my $seqs = $cgi->param('seqs');

printResults($seqs);

#*************************************************************************
# Convert the FASTA for an alignment into a set of JavaScript to create
# an array of sequence objects for JSAV
sub createSeqArrayHTML
{
    my ($seqs) = @_;
    my $html = "var seqs = [];\n";

    $seqs =~ s/\r//g;
    my @lines = split(/\n/, $seqs);

    my $seqCount=(-1);
    my $seq = "";
    my $id  = "";
    for(my $i=0; $i<scalar(@lines); $i++)
    {
        if($lines[$i] =~ /^>/)
        {
            if($seq ne "")
            {
                $html .= "seqs.push({id :'$id', sequence :'$seq'});\n";
                $seq = "";
            }
            $id = $lines[$i];
        }
        else
        {
            $seq .= $lines[$i];
        }
    }
    if($seq ne "")
    {
        $html .= "seqs.push({id :'$id', sequence :'$seq'});\n";
        $seq = "";
    }

    return($html);
}


#*************************************************************************
# Print the results from the MUSCLE alignment calling JSAV to print the
# actual aligment
sub printResults
{
    my($seqs) = @_;

    my $seqArrayHTML = createSeqArrayHTML($seqs);

    my $html = <<__EOF;
<html>
<head>
<title>JSAV Demo</title>
<!-- JQuery and JQuery-UI -->
<link href="JSAV/external/jquery.css" rel="stylesheet" />
<script type='text/javascript' src='JSAV/external/jquery-1.10.2.min.js'></script>
<script type='text/javascript' src='JSAV/external/jquery-ui-1.10.4.custom.min.js'></script>

<!-- JSAV -->
<link href="JSAV/JSAV.css" rel="stylesheet" />
<script type='text/javascript' src='JSAV/JSAV.js'></script>

<!-- If using tooltipster -->
<link href="JSAV/external/tooltipster-master/css/tooltipster.css" rel="stylesheet" />
<script type='text/javascript' src='JSAV/external/tooltipster-master/js/jquery.tooltipster.min.js'></script>
<script>
function enableTooltipster()
{
   \$(document).ready(function() {
       \$('.tooltip').tooltipster();
   });
}
enableTooltipster();
</script>
<!-- END -->
</head>
<body>
<h1>JSAV Alignment Display</h1>
<script type='text/javascript'>
$seqArrayHTML
var opts = Array();
opts.sortable = true;
opts.selectable = true;
opts.deletable = true;
opts.border = false;
opts.toggleDotify = true;
opts.toggleNocolour = true;
opts.fasta = true;
opts.consensus = true;
opts.colourScheme = "zappo";
opts.selectColour = true;
opts.callback = "enableTooltipster";

printJSAV('sequenceDisplay', seqs, opts);


</script>
</body>
</html>
__EOF

    print $html;
}

