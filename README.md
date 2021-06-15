JavaScript Sequence Alignment Viewer (JSAV) V2.0
=================================================

JSAV is a simple JavaScript sequence alignment viewer

Look at index.html and index2.html for example usage information

The main user entry point is:
```javascript
    printJSAV(divId, sequenceArray, options);
```

Where:
- `divId` is the name of a div that will be created
- `sequenceArray`  is an array of sequence objects - these contain `id` and `sequence` fields 
- `options`        is an object describing options - see below

The options for controlling the display are:

- `sortable` - Should the sorting options be displayed (default: false)
- `selectable`  - Should selection checkboxes be displayed for each sequence
- `hideable`	- Makes it possible to hide sequences
- `deletable`   - Makes it possible to delete sequences
- `highlight`   - Array of ranges to highlight (e.g. [24,34,50,56] would highlight
positions 24-34 and 50-56)
- `action`      - Function to call using selected sequences - the function will be passed 
the divId and array of sequence objects
- `dotify`      - Repeated residues in the alignment are replaced with dots
- `nocolour` or `nocolor` - Repeated residues are not coloured
- `toggleDotify` - Display a checkbox to toggle the dotify mode
- `toggleNocolour` or `toggleNocolor` - Display a checkbox to toggle the nocolour-dotify mode
- `fasta`          - Create a FASTA export button 
- `consensus`      - Display consensus sequence
- `colourScheme` or `colorScheme`   - Default colour scheme - valid options 
                                    depend on the css, but are currently
                                    taylor, clustal, zappo, hphob
- `selectColour` or `selectColor`  - Display a pull-down to choose the colour 
                                    scheme.
- `colourChoices` or `colorChoices`  - Array of colour scheme names - only used
                                    if the user has added to the CSS
- `callback`      - name of a function to be called whenever the display is
                    refreshed. The divId is passed into this function.
- `scrollX`       - Specify a width for the sequence display
                    div and make it scrollable (e.g. "500px")
                    Use "100%" to make it the width of the
                    screen (or containing div)
- `scrollY`       - Specify a height for the sequence display
                    div and make it scrollable (e.g. "500px")
- `labels`        - Array of residue labels 
- `autoLabels`    - Generate sequential labels automatically
- `submit`        - URL for submitting selected sequences
- `idSubmit`      - URL for submitting a single sequence where its id/label has been clicked.
See also `idSubmitKey` and `idSubmitAttribute` which allows other attributes to be passed 
- `idSubmitClean` - Remove non-alpha characters from sequence before submitting
- `idSubmitAttribute` - Specifies a colon-separated list of attribute values of the sequence
object which should be passed to a URL specified with idSubmit. Default is 'sequence'
- `idSubmitKey`   - Specifies a colon-separated list of attribute keys which should be passed to the URL
specified with idSubmit. 
- `hideLabel`	        - Label for hide button.
- `showallLabel`        - Label for Show All button.
- `deleteLabel`         - Label for delete button
- `submitLabel`         - Label for submit button
- `actionLabel`         - Label for action button
- `toggleDotifyLabel`   - Label for dotify checkbox toggle
- `toggleNocolourLabel` - Label for nocolour checkbox toggle
- `sortLabel`           - Label for sort button
- `exportLabel`         - Label for export buttons


The Sequence Object
-------------------

The sequence object must contain two fields: 

- `id` which contains an identifier that is displayed along side the
  sequence
- `sequence` which is the 1-letter code sequence (with dashes as
  necessary for the alignment)

In addition it may contain any other required fields that will be displayed in the data table below the sequences.
Any number of data items can be included, and missing data is allowed. Data labels containing spaces must be enclosed in quotation marks.
Data items must be emclosed in quotation marks.

CSS Control
-----------

The overall JSAV component is wrapped in a div with the ID specified in the call.
Within this there are two divs 
- the first displays the alignment and has class='JSAVDisplay'
- the second displays the controls and has class='JSAVControls'

Prerequisites
-------------

You must have JQuery and JQuery-UI installed - simply download them
from http://www.jqueryui.com/ and access the two JavaScript files and
the CSS file from your HTML. You can customize the look and feel of
the slider and the confirmation/alert boxes by choosing a different
(or customized) JQuery-UI theme.

Your code should include these with something like:

    <link href="external/jquery.css" rel="stylesheet" />
    <script type='text/javascript' src='external/jquery-1.10.2.min.js'></script>
    <script type='text/javascript' src='external/jquery-ui-1.10.4.custom.min.js'></script>

alternatively, you could access the JQuery code from Google APIs:

    <link rel="stylesheet" href="//ajax.googleapis.com/ajax/libs/jqueryui/1.10.4/themes/smoothness/jquery-ui.css" />
    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
    <script src="//ajax.googleapis.com/ajax/libs/jqueryui/1.10.4/jquery-ui.min.js"></script>

**Note** that this must appear *before* including the JSAV.js code and CSS:

    <link href="JSAV.css" rel="stylesheet" />
    <script type='text/javascript' src='JSAV.js'></script>

Note
----
In future, the slider may be replaced with 
   http://refreshless.com/nouislider/
which works better on touchscreens.

Contributing to JSAV
--------------------
Contributions to JSAV through pull requests are encouraged. If you
contribute, you acknowledge that you transfer copyright in your
modifications to University College London and Dr. Andrew C.R. Martin.
