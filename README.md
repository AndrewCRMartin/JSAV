JavaScript Sequence Alignment Viewer (JSAV) V1.5
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
- `highlight`   - Array of ranges to highlight (e.g. [24,34,50,56] would highlight
positions 24-34 and 50-56)
- `submit`      - URL for submitting selected sequences
- `submitLabel` - Label for submit button
- `action`      - Function to call using selected sequences - the function will be passed 
the divId and array of sequence objects
- `actionLabel` - Label for action button
- `dotify`      - Repeated residues in the alignment are replaced with dots
- `nocolour` or `nocolor` - Repeated residues are not coloured
- `toggleDotify` - Display a checkbox to toggle the dotify mode
- `toggleNocolour` or `toggleNocolor` - Display a checkbox to toggle the nocolour-dotify mode
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
- `noTooltips` - disable tool-tips


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

Optional styling
----------------

By default, JQuery tooltips are enabled. As abovem these can be disabled using the `noTooltips` option.

The tooltips are fully compatible with the tooltipster package which
gives more attractive tooltips. If you wish to use this, simply
download the package from
https://github.com/iamceege/tooltipster/archive/master.zip and add the
following lines to your HTML:

```javascript
<link href="tooltipster-master/css/tooltipster.css" rel="stylesheet" />
<script type='text/javascript' src='tooltipster-master/js/jquery.tooltipster.min.js'></script>
<script>
    $(document).ready(function() {
        $('.tooltip').tooltipster();
    });
</script>
```


Note
----
In future, the slider may be replaced with 
   http://refreshless.com/nouislider/
which works better on touchscreens.

