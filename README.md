JavaScript Sequence Alignment Viewer (JSAV) V1.8
================================================

JSAV is a simple JavaScript sequence alignment viewer

Look at index.html amd index2.html for example usage information

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
- `width` - The width of the selection slider with units (default: '400px')
- `height` - The height of the selection slider with units. This is actually a font size
and the actualy slider height is relative to this (default: '6pt')
- `selectable`  - Should selection checkboxes be displayed for each sequence
- `deletable`   - Makes it possible to delete sequences
- `deleteLabel` - Label for the delete button
- `highlight`   - Array of ranges to highlight (e.g. [24,34,50,56] would highlight
positions 24-34 and 50-56)
- `submit`      - URL for submitting selected sequences
- `submitLabel` - Label for submit button
- `idSubmit`    - URL for submitting a single sequence where its id/label has been clicked
- `idSubmitClean` - Remove non-alpha characters from sequence before submitting
- `action`      - Function to call using selected sequences - the function will be passed 
the divId and array of sequence objects
- `actionLabel` - Label for action button
- `dotify`      - Repeated residues in the alignment are replaced with dots
- `nocolour` or `nocolor` - Repeated residues are not coloured
- `toggleDotify` - Display a checkbox to toggle the dotify mode
- `toggleDotifyLabel` - Label for dotify checkbox toggle
- `toggleNocolour` or `toggleNocolor` - Display a checkbox to toggle the nocolour-dotify mode
- `toggleNocolourLabel` or `toggleNocolorLabel` - Label for nocolour checkbox toggle
- `fasta`          - Create a FASTA export button 
- `fastaLabel`     - Label for FASTA export button
- `consensus`      - Display consensus sequence
- `colourScheme` or `colorScheme`   - Default colour scheme - valid options 
                                    depend on the css, but are currently
                                    taylor, clustal, zappo, hphob, helix, 
                                    strand, turn, buried
- `selectColour` or `selectColor`  - Display a pull-down to choose the colour 
                                    scheme.
- `colourChoices` or `colorChoices`  - Array of colour scheme names - only used
                                    if the user has added to the CSS
- `plainTooltips` - disable JQuery tool-tips
- `callback`      - name of a function to be called whenever the display is
                    refreshed. The divId is passed into this function.
- `scrollX`       - Specify a width for the sequence display
                    div and make it scrollable (e.g. "500px")
                    Use "100%" to make it the width of the
                    screen (or containing div)
- `scrollY`       - Specify a height for the sequence display
                    div and make it scrollable (e.g. "500px")


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


Optional styling
----------------

By default, JQuery tooltips are enabled. As above, these can be
disabled using the `plainTooltips` option.

The tooltips are fully compatible with the tooltipster package which
gives more attractive tooltips. If you wish to use this, simply
download the package from
https://github.com/iamceege/tooltipster/archive/master.zip and add the
following lines to your HTML:

    <link href="external/tooltipster-master/css/tooltipster.css" rel="stylesheet" />
    <script type='text/javascript' src='external/tooltipster-master/js/jquery.tooltipster.min.js'></script>
    <script>
    function enableTooltipster()
    {
        $(document).ready(function() {
            $('.tooltip').tooltipster();
        });
    enableTooltipster();
    </script>

**Note** that this must appear *after* including the JSAV.js code and
CSS (unless you also remember to set the `options.plainTooltips`
option).

The `enableTooltipster()` function must be called whenever the display is refreshed. This is achieved by
adding the option:

```javascript
    options.callback = "enableTooltipster";
```

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
