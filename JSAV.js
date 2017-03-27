/** @preserve 
    @file
    JSAV V1.10.1 25.02.16
    Copyright:  (c) Dr. Andrew C.R. Martin, UCL, 2014-2016
    This program is distributed under the Gnu Public Licence (GPLv2)
*/
/** ***********************************************************************
   Program:    JSAV  
   File:       JSAV.js
   
   Version:    V1.10.1
   Date:       25.02.16
   Function:   JavaScript Sequence Alignment Viewier
   
   Copyright:  (c) Dr. Andrew C.R. Martin, UCL, 2014-2016
   Author:     Dr. Andrew C.R. Martin
   Address:    Institute of Structural and Molecular Biology
               Division of Biosciences
               University College
               Gower Street
               London
               WC1E 6BT
   EMail:      andrew@bioinf.org.uk
               
**************************************************************************
   This program is distributed under the Gnu Public licence (GPLv2 or 
   above)

   Alternative licences for commercial use are available on request.
**************************************************************************
   Description:
   ============
   JSAV is a simple JavaScript protein sequence alignment viewer. It
   allows you to select a region of the alignment and sort on that
   region.
**************************************************************************
   Revision History:
   =================
   V1.0    06.06.14   Original  By: ACRM
   V1.1    10.06.14   Code cleanup
                      Changed options to a hash
                      Further code cleanup - some code was assuming
                      sequences were stored in an array called 'sequences'
                      Added 'selectable' option
           12.06.14   Added 'deletable' and 'border' options
                      Implemented sequence deletion
           13.06.14   Checks that some sequences are selected before 
                      deletion
                      Cleaned up comments/documentation
                      Cleaned up defaults in printJSAV
                      Changed some routine names
   V1.2    13.06.14   Added highlight option
                      Added submit/submitLabel options
                      Added action/actionLabel options
   V1.2.1  15.06.14   Added height option
                      Changed to use ACRM_alert()
   V1.2.2  16.06.14   Changed to use ACRM_confirm()
   V1.3    16.06.14   Added dotify/nocolour/toggleDotify/toggleNocolour
   V1.4    17.06.14   Added fasta/fastaLabel export options
                      Added consensus sequence display and colourScheme
                      Added selectColour/selectColor and
                      colourChoices/colorChoices
                      Added refresh of options on reload
   V1.5    18.06.14   Added tooltips
   V1.5.1  19.06.14   Added callback option
   V1.6    17.09.14   Changed to manipulate the DOM rather than writing
                      to the document  By: JHN
   V1.7    23.09.15   Added options.toggleDotifyLabel
                      Added options.toggleNocolourLabel and options.toggleNocolorLabel
                      Added options.deleteLabel
                      Added options.idSubmit
                      By: ACRM
   V1.8    24.09.15   Added options.scrollX and options.scrollY
   V1.9    22.12.15   Added options.labels array and label printing
   V1.10   11.02.16   Modified JSAV_wrapAction() to add whole sequence 
                      object to output array rather than just the ID and sequence
                      Added options.idSubmitAttribute so that clicking on an
                      ID can now call a URL with things other than the sequence
   V1.10.1 25.02.16   Delete button is now correctly 'deletebutton' class
                      instead of 'delete' class

TODO: 
      1. Bar display of conservation from entropy
      2. Allow user to specify key sequence for sorting
      3. Clean up passing of globals

*************************************************************************/
/**
This is the only routine called by a user. It takes an array of
sequence objects and displays them as a coloured sortable table
optionally with a slider and sort button, delete button, etc

@example 
var Seqs = [];
Seqs.push({id :"id1b1.L", sequence :"SASSSVNYMYACREFGHIKLMNPTRSTVWY"});
Seqs.push({id :"id1a.L",  sequence :"SASSSTNYMYACDEFGHIKLMNPQRSTVWY"});

var options = Array();
options.width = '400px';
options.sortable = true;
options.highlight = [3,5,10,14];
options.submit = "http://www.bioinf.org.uk/cgi-bin/echo.pl";
options.submitLabel = "Submit sequences";
options.action = "myAction";
options.actionLabel = "My Action";
options.consensus = true;
options.deletable = true;
options.fasta = true;
printJSAV('mySeqDisplay', sequenceArray, options);
Where 'mySeqDisplay' is the name of a div that will be created
      sequenceArray  is an array of sequence objects
      options        is an object describing options - see below

Note that the sequence object can contain additional fields that mean nothing to
JSAV itself but may be used by 'actions' that are called from JSAV (e.g. an
accession code).


@param {object[]}  sequences                      - Array of sequence objects
@param {string}    divId                          - ID of div to print in
@param {Object}    options                        - Options that can be provided - see Properties
@property {bool}      options.sortable            - Should the sorting options be displayed
                                                    (default: false)
@property {string}    options.width               - The width of the selection slider with
                                                    units (default: '400px')
@property {string}    options.height              - The height of the selection slider with
                                                    units (default: '6pt')
@property {bool}      options.selectable          - Should selection checkboxes be displayed
                                                    for each sequence
@property {bool}      options.deletable           - Makes it possible to delete sequences
@property {bool}	  options.hideable			  - Makes it possible to hide sequences and respective
													datatable rows
@property {string}    options.deleteLabel         - Label for delete button
@property {int[]}     options.highlight           - Array of ranges to highlight
@property {string}    options.submit              - URL for submitting selected sequences
@property {string}    options.submitLabel         - Label for submit button
@property {string}    options.idSubmit            - URL for submitting a single sequence where its
                                                    id/label has been clicked. 
                                                    See also options.idSubmitAttribute
@property {bool}      options.idSubmitClean       - Remove non-alpha characters from sequence
                                                    before submitting
@property {string}    options.idSubmitAttribute   - Specifies which attribute of the sequence
                                                    object should be passed to a URL specified
                                                    with options.idSubmit. Default is 'sequence'
@property {string}    options.action              - Function to call using selected sequences.
                                                    This is passed the seqId and array of
                                                    currently selected sequence objects
@property {string}    options.actionLabel         - Label for action button
@property {bool}      options.dotify              - Repeated amino acids in the sequence are
                                                    replaced by a dot
@property {bool}      options.nocolour            - Dotified amino acids are not coloured
                                                    (except deletions)
@property {bool}      options.toggleDotify        - Create a check box for toggling dotify
@property {string}    options.toggleDotifyLabel   - Label for dotify checkbox toggle
@property {bool}      options.toggleNocolour      - Create a check box for toggling nocolour
@property {string}    options.toggleNocolourLabel - Label for nocolour checkbox toggle
@property {bool}      options.fasta               - Create a FASTA export button 
@property {string}    options.fastaLabel          - Label for FASTA export button
@property {bool}      options.consensus           - Display consensus sequence
@property {string}    options.colourScheme        - Default colour scheme - valid options 
                                                    depend on the css, but are currently
                                                    taylor, clustal, zappo, hphob, helix, 
                                                    strand, turn, buried. Note that this must be
                                                    specified in lower case
@property {bool}      options.selectColour        - Display a pull-down to choose the colour 
                                                    scheme.
@property {string[]}  options.colourChoices       - Array of colour scheme names - only used
                                                    if the user has added to the CSS. This
                                                    can be in mixed case.
@property {bool}      options.plainTooltips       - Don't use JQuery tooltips
@property {callback}  options.callback            - Specify the name of a function to be
                                                    called whenever the display is refreshed.
                                                    This is passed the seqId
@property {string}    options.scrollX             - Specify a width for the sequence display
                                                    div and make it scrollable (e.g. "500px")
                                                    Use "100%" to make it the width of the
                                                    screen (or containing div)
@property {string}    options.scrollY             - Specify a height for the sequence display
                                                    div and make it scrollable (e.g. "500px")
@property {string[]}  options.labels              - Array of residue label strings
@property {bool}      options.autolabels          - Automatically generate label strings
                                                    (overrides options.labels)

@author 
- 29.05.14 Original  By: ACRM
- 30.05.14 Now just calls JSAV_buildSequencesHTML() and prints the results
- 05.06.14 Added divId parameter and sortable
- 06.06.14 Added width
- 10.06.14 sortable and width parameters now replaced by 'options'
           Added 'selectable' option
           Stores sequence length in global array
- 11.06.14 Added deletable
- 13.06.14 Cleaned up use of defaults
- 13.06.14 Added highlight
- 13.06.14 Added submit and action, submitLabel and actionLabel
- 15.06.14 Added height
- 16.06.14 Added dotify, nocolour, toggleDotify, toggleNocolour
- 17.06.14 Added fasta, fastaLabel
           Added consensus
           Added colourScheme/colorScheme
           Added selectColour/selectColor and colourChoices/colorChoices
- 18.06.14 Added tooltips and plainTooltips option
- 19.06.14 Added callback
- 02.09.14 Avoid using write and writeln. Rather use jQuery to insert into DOM.
           Fixes overwrite issues with using after page closure. By: JHN
- 23.09.15 Added toggleDotifyLabel 
           Added toggleNocolourLabel/toggleNocolorLabel
           Added deleteLabel
           Move FASTA before submit and action buttons
           Added idSubmit and idSubmitClean
           By: ACRM
- 24.09.15 Added scrollX and scrollY
- 22.12.15 Added labels and autolabels
- 11.02.16 Added idSubmitAttribute
- 09.01.17 Several modifications as follows By: JH 
			- added global arrays gDisplayColumn for datatable column display status,
			  gDisplayOrder for reordering sequence and datatable rows based on sort,
			  displayRow (in sequence object) for indicating display status of sequences 
			  and datatable rows
			- datatable functions added, writing to tag divId_Table
			- added mousehandler for handling sort region
			- added call to JSAV_transposeSequencesHTML, based on status of options.transpose,
			  for displaying transposed (vertical) sequence view
			- reorganised button display order
			- added options.iconButtons for option to display buttons as text or icons
			- start and stop sort positions now global
			- now uses Bootstrap tooltips instead of jQuery tooltips
*/
function printJSAV(divId, sequences, options)
{
   // Deal with options
   if(options                     == undefined) { options                     = Array();                   }
   if(options.width               == undefined) { options.width               = "400px";                   }
   if(options.height              == undefined) { options.height              = "6pt";                     }
   if(options.submitLabel         == undefined) { options.sumbitLabel = (options.iconButtons)
						? "<span class='fa fa-check' aria-hidden='true'></span>"
						: "Submit Sequences";        				   }
   if(options.actionLabel         == undefined) { options.actionLabel = (options.iconButtons)
						? "<span class='fa fa-cogs' aria-hidden='true'></span>"
						: "Process Sequences";       				}
   if(options.nocolor)                          { options.nocolour            = true;                      }
   if(options.toggleNocolor)                    { options.toggleNocolour      = true;                      }
   if(options.transpose           == undefined) { options.transpose           = false;                     }
   if(options.fastaLabel          == undefined) { options.fastaLabel = (options.iconButtons)
						? "<span class='fa fa-share-square-o' aria-hidden='true'></span>"
						: "Export Selected";         				}
   if(options.sortLabel          == undefined) 	{ options.sortLabel = (options.iconButtons)
						? "<span class='fa fa-sort-down' aria-hidden='true'></span>"
						: "Sort";         					}
   if(options.colorScheme)                      { options.colourScheme        = options.colorScheme;       }
   if(options.colourScheme        == undefined) { options.colourScheme        = "taylor";                  }
   if(options.selectColor)                      { options.selectColour        = true;                      }
   if(options.colorChoices        != undefined) { options.colourChoices       = options.colorChoices;      }
   if(options.deletable)                        { options.selectable          = true;                      }
   if(options.hideable)                         { options.selectable          = true;                      }	
   if(options.idSubmitAttribute   == undefined) { options.idSubmitAttribute   = "sequence";                }
   if(options.toggleDotifyLabel   == undefined) { options.toggleDotifyLabel = (options.iconButtons) 	
						? "<span class='fa fa-ellipsis-h' aria-hidden='true'></span>"
						: "Dotify";						}
   if(options.toggleNocolourLabel == undefined) { options.toggleNocolourLabel = (options.iconButtons)	
						? "<span class='fa fa-th' aria-hidden='true'></span>"
						: "Do not colour repeats";   				}
   if(options.toggleTransposeLabel == undefined) { options.toggleTransposeLabel = (options.iconButtons)	
						? "<span aria-hidden='true'></span>"
						: "Transpose sequences";   				}
   if(options.toggleNocolorLabel  != undefined) { options.toggleNocolourLabel = options.toggleNocolorLabel;}
   if(options.hideLabel        	  == undefined) { options.hideLabel = (options.iconButtons)
						? "<span class='fa fa-eye-slash' aria-hidden='true'></span>"
						: "Hide Selected";    					}
   if(options.showallLabel        == undefined) { options.showallLabel = (options.iconButtons)
						? "<span class='fa fa-eye' aria-hidden='true'></span>"
						: "Unhide All";						}
   if(options.deleteLabel         == undefined) { options.deleteLabel = (options.iconButtons)
						? "<span class='fa fa-window-close' aria-hidden='true'></span>"
						: "Delete Selected";					}
   if(options.autoLabels)                       { options.labels              = JSAV_autoLabels(sequences);} 

   // Initialize globals if not yet done
   JSAV_init();
   document.onmouseup = mouseUpHandler;				
   gOptions[divId]         = options;
   gSequences[divId]       = sequences;
   initDisplayrow(gSequences[divId]);				
   gSequenceLengths[divId] = sequences[0].sequence.length;
   gDisplayOrder[divId] = initDisplayOrder(sequences);
   gDisplayColumn[divId] = initDisplayColumn(divId, sequences);

   if(options.consensus)
   {
       gConsensus[divId] = JSAV_buildConsensus(sequences);
   }
   var div = '';
   if($("#" + divId).length == 0) {
       div = $('<div />').appendTo($('body'));
       div.attr('id', divId);
   }
   else{
       div = $("#" + divId);
   }
   var div_sortable = $('<div />').appendTo(div);
   div_sortable.attr('id', divId + '_sortable');
   div_sortable.attr('class', 'JSAVDisplay');

   
   if(options.scrollX != null)
   {
      div_sortable.css('overflow-x', 'hidden');
      div_sortable.css('white-space', 'nowrap');
      div_sortable.css('width', options.scrollX);
      document.getElementById(divId+"_Table").classList.add('table_xscroll');
   }
   
   if(options.scrollY != null)
   {
      div_sortable.css('overflow-y', 'scroll');
      div_sortable.css('white-space', 'nowrap');
      document.getElementById(divId+"_Table").classList.add('table_yscroll');
   }
   

   if (options.transpose) {
	   var html = JSAV_transposeSequencesHTML(divId, sequences);
	} else {
	   var html = JSAV_buildSequencesHTML(divId, sequences);
	}
   div_sortable.append(html);


   var div_controls = $('<div />').appendTo(div);
   div_controls.attr('id', divId + '_controls');
   div_controls.attr('class', 'JSAVControls');

   if(options.sortable)
   {
 
	  gStartPos[divId] = 1;
	  gStopPos[divId] = gSequenceLengths[divId];
      JSAV_showRange(divId);
      var html = "<button type='button' class='sortbutton' data-toggle='tooltip' title='Sort the sequences based on the range specified in the Sort Region' onclick='JSAV_sortAndRefreshSequences(\"" + divId + "\")'>"+options.sortLabel+"</button>";
      div_controls.append(html);

   }
   
   if(options.hideable)
   {
      JSAV_printHide(divId, options.hideLabel);	
      JSAV_printShowAll(divId, options.showallLabel);
   }
   
   if(options.deletable)
   {
      JSAV_printDelete(divId, options.deleteLabel);
  }

   if(options.fasta)
   {
      JSAV_printFASTA(divId);
   }

   if(options.submit != undefined)
   {
      JSAV_printSubmit(divId, options.submit, options.submitLabel);
   }

   if(options.action != undefined)
   {
      JSAV_printAction(divId, options.action, options.actionLabel);
   }

   if(options.selectColour)
   {
       JSAV_printColourSelector(divId, options);
   }
   if(options.toggleDotify)
   {
       JSAV_printToggleDotify(divId, options);
   }
   if(options.toggleNocolour)										
   {
       JSAV_printToggleNocolour(divId, options);
   }

   if(options.toggleTranspose)										
   {
       JSAV_printToggleTranspose(divId, options);
   }
   
   if(options.border)
   {
       JSAV_modifyCSS(divId);
   }

   printDataTable(divId, sequences);

   // Ensure buttons etc match the data
   window.onload = function(){JSAV_refreshSettings(divId);};

   if(options.callback != undefined)
   {
       window[options.callback](divId);
   }
}

// ---------------------------------------------------------------------  
/**
Initialise the displayrow elements for all sequences

@param {object[]} sequences - the sequence array

@author - 09.01.17 Original	By: JH
*/

function initDisplayrow(sequences)
{
	for (var s=0; s<sequences.length; s++)
		sequences[s].displayrow = true;
}

// -----------------------------------------------------------------------
/**
Returns optimum height of the display areas based on number of sequences

@param {object[]} sequences	- the sequence array
@param {boolean} consensus	- true if options.consensus 
@param {boolean} hightlight	- true if options.highlight 
@param {boolean} sortable	- true if options.sortable
@param {int} scrollY 		- default scrollY value
@return {string} 		- css string for height

@author
 - 09.01.17 Original	By: JH
 */

function calculateTableHeight(sequences, consensus, highlight, sortable, scrollY) {
	var height = 60; 		//Two label rows + two typeLabel rows + scroll bar
	var rowheight = 18;
	var highlightheight = 18;
        var sortheight = 10;

	for (var s=0; s<sequences.length; s++)
		if (sequences[s].displayrow) height += rowheight;
	if (consensus) height += rowheight + 2;
	if (highlight) height += (highlightheight * 2);
        if (sortable) height += sortheight;
	if (height < scrollY ) 
		{ return(height + 'px'); }
	else
		{ return(scrollY + 'px'); }
}

// ---------------------------------------------------------------------
/**
Updates the buttons to match the settings. This is called when the
window is reloaded

@param {string} divId   - The ID of the div we are printing in

@author 
- 17.06.14 Original   By: ACRM
*/
function JSAV_refreshSettings(divId)
{
    if(gOptions[divId].selectColour)
    {
        // Colour scheme
        var tag = "#" + divId + "_selectColour";
        $(tag).val(gOptions[divId].colourScheme);
    }
    if(gOptions[divId].toggleDotify)
    {
        // Dotify option
        var tag = "#" + divId + "_toggleDotify";
        if(gOptions[divId].dotify == undefined)
        {
            $(tag).prop('checked', false);
        }
        else
        {
            $(tag).prop('checked', gOptions[divId].dotify);
        }
    }
    if(gOptions[divId].toggleNocolour)
    {
        // Dotify-nocolour option
        var tag = "#" + divId + "_toggleNocolour";
        if(gOptions[divId].nocolour == undefined)
        {
            $(tag).prop('checked', false);
        }
        else
        {
            $(tag).prop('checked', gOptions[divId].nocolour);
        }
    }
    if(gOptions[divId].selectable)
    {
        // Selectable
        var tag = "#" + divId + "_AllNone";
        $(tag).prop('checked', false);
//        JSAV_unselectAll(divId);
    }
}

// ---------------------------------------------------------------------
/** 
Prints a pulldown menu to select a colour scheme

@param {string} divId   - The ID of the div we are printing in
@param {object} options - User options

@author 
- 17.06.14 Original   By: ACRM
- 18.06.14 Added tooltip
- 02.09.14 Modifies the DOM rather than writing to document  By: JHN
*/
function JSAV_printColourSelector(divId, options)
{
   // Initialize colour choices if not provided
   if(options.colourChoices == undefined)
   {
      options.colourChoices = JSAV_initColourChoices();
   }

    var id   = divId + "_selectColour";
    var html = "<select class='colourselect' data-toggle='tooltip' title='Select colour scheme' id = '" + id + "' onchange='JSAV_setColourScheme(\"" + divId + "\", this)'>";
    for(var i=0; i<options.colourChoices.length; i++)
    {
        var lcChoice = options.colourChoices[i].toLowerCase();
        var selected = "";
        if(options.colourScheme == lcChoice)
        {
            selected = " selected='selected'";
        }
        html += "<option value='" + lcChoice + "'" + selected + ">" + 
                options.colourChoices[i] + "</option>";
    }
    html += "</select>";
    var parrenttag = '#' + divId + '_controls';
    $(parrenttag).append(html);
}

// ---------------------------------------------------------------------
/**
Called when the colour scheme selector is changed. Sets the selected
colour scheme and refreshes the display

@param {string}  divId    - The ID of the div we are working in
@param {object}  select   - The select pull-down

@author 
- 17.06.14  Original   By: ACRM
- 22.12.15  Added passing of labels
- 09.01.17	Added options.transpose to JSAV+refresh parameter list By: JH
*/
function JSAV_setColourScheme(divId, select)
{
	gOptions[divId].colourScheme = select.value;

    var options = gOptions[divId];
    if(options.sorted)
    {
        JSAV_sortAndRefreshSequences(divId)
    }
    else
    {
        JSAV_refresh(divId, gSequences[divId], gStartPos[divId]-1, gStopPos[divId]-1);
    }
}

// ---------------------------------------------------------------------
/**
Prints the button to allow FASTA export

@param {string} divId   - The ID of the div we are printing in

@author 
- 17.06.14 Original   By: ACRM
- 18.06.14 Added tooltip
- 02.09.14 Modifies the DOM rather than printing to the document By: JHN
*/
function JSAV_printFASTA(divId)
{
   var parrenttag = '#' + divId + '_controls';
   var label = gOptions[divId].fastaLabel;
   var html = "<button type='button' class='exportbutton' data-toggle='tooltip' title='Export the selected sequences, or all sequences if none selected' onclick='JSAV_exportFASTA(\"" + divId + "\")'>"+label+"</button>";
   $(parrenttag).append(html);
}

// ---------------------------------------------------------------------
/**
Exports the selected sequences as FASTA

@param {string} divId   - The ID of the div we are printing in

@author 
- 17.06.14 Original   By: ACRM
*/
function JSAV_exportFASTA(divId)
{
   var sequenceText = JSAV_buildFASTA(divId);

   ACRM_dialog("FASTA Export", sequenceText, 600, true);
}

// ---------------------------------------------------------------------
/** 
Print a checkbox for toggling dotify mode

@param {string}  divId    The div that we are working in
@param {object}  options  The options

@author 
- 16.06.14 Original   By: ACRM
- 18.06.14 Added tooltip
- 02.09.14 Modifies the DOM rather than printing to the document By: JHN
- 23.09.15 Dotify label now comes from options  By: ACRM
- 09.01.17 Now includes dotifybutton class, checked changed to active, label now taken from options.toggleDotifyLabel  By: JH
*/
function JSAV_printToggleDotify(divId, options)
{
    var html = "";
    var active = "";
    if(options.dotify) { active = " active"; };
    var id = divId + "_toggleDotify";
	var label = options.toggleDotifyLabel;
    var idText = " id='" + id + "'";
    var onclick = " onclick='JSAV_toggleOption(\"" + divId + "\", \"" + id + "\", \"dotify\")'";
    var tooltip = "Replace repeated residues with dots";

    html += "<button type='button' class='dotifybutton" + active + "' " + idText + " data-toggle='tooltip' title='"+tooltip+ "' "  + onclick + ">"+label+"</button>";

    var parrenttag = '#' + divId + '_controls';
    $(parrenttag).append(html);
}

// ---------------------------------------------------------------------
/** 
Print a checkbox for toggling nocolour-dotify mode

@param {string}  divId    The div that we are working in
@param {object}  options  The options

@author 
- 16.06.14 Original   By: ACRM
- 18.06.14 Added tooltip
- 02.09.14 Modifies the DOM rather than printing to the document By: JHN
- 23.09.15 Obtains label from options.toggleNocolourLabel  By: ACRM
- 09.01.17 Now includes nocolourbutton class, checked changed to active, label now taken from options.toggleNocolourlabel  By: JH
*/
function JSAV_printToggleNocolour(divId, options) 
{
    var html = "";
    var active = "";
    if(options.nocolour) { active = " active"; };
    var id = divId + "_toggleNocolour";
    var idText = " id='" + id + "'";
	var label = options.toggleNocolourLabel;
    var onclick = " onclick='JSAV_toggleOption(\"" + divId + "\", \"" + id + "\", \"nocolour\")'";
    var tooltip = "Do not colour repeated residues";

    html += "<button type='button' class='nocolourbutton" + active + "' " + idText + " data-toggle='tooltip' title='"+tooltip+ "' "  + onclick + ">"+label+"</button>";
    var parrenttag = '#' + divId + '_controls';
    $(parrenttag).append(html);
}

// ---------------------------------------------------------------------
/** 
Print a checkbox for toggling transposed sequence view

@param {string}  divId    The div that we are working in
@param {object}  options  The options

@author 
- 03.01.17 Original   By: JH

*/
function JSAV_printToggleTranspose(divId, options) 
{
    var options = gOptions[divId];
    var html = "";
    var activeText = "fa fa-reply";
    var inactiveText = "fa fa-share";
    var active = "";
    if(options.transpose) 
      { 
        active = activeText; 
      } 
    else 
      { 
        active = inactiveText; 
      } ;
    var id = divId + "_toggleTranspose";
    var idText = " id='" + id + "'";
    var label = options.toggleTransposeLabel;
    var onclick = " onclick='JSAV_toggleTranspose(\"" + divId + "\", \"" + id + "\", \"transpose\", \"" +activeText+"\",  \"" +inactiveText+"\")'";
    var tooltip = "Transpose sequence view";

    html += "<button type='button' class='transposebutton " + active + "' " + idText + " data-toggle='tooltip' title='"+tooltip+ "' "  + onclick + ">"+label+"</button>";
    var parrenttag = '#' + divId + '_controls';
    $(parrenttag).append(html);
}

function JSAV_toggleTranspose(divId, theButton, theOption, activeText, inactiveText) {

    var div_sortable = $('#' + divId + '_sortable');
    var options = gOptions[divId];
    if(options[theOption]) 
      { 
        div_sortable.css('overflow-y', 'scroll');
        div_sortable.css('overflow-x', 'hidden'); 
      } 
    else 
      { 
        div_sortable.css('overflow-x', 'scroll');
        div_sortable.css('overflow-y', 'hidden'); 
      } ;

JSAV_toggleOptionIcon(divId, theButton, theOption, activeText, inactiveText);
}

// ---------------------------------------------------------------------
/**
Read a button and toggle the button class between the two options activeText 
and inactiveText, refreshing the display


@param {string}  divId     		The div that we are working in
@param {string}  theButton 		The ID of the checkbox we are looking at
@param {string}  theOption 		The name of the option we are toggling
@param {string}  activeText		Class for active button
@param {string}  inactiveText	Class for inactive button

@author 
- 11.01.17 Original	By: JH 
*/

function JSAV_toggleOptionIcon(divId, theButton, theOption, activeText, inactiveText)
{
    var tag     = "#" + theButton;
    var options = gOptions[divId];
    options[theOption] = !options[theOption];
	if (options[theOption]) {
		$(tag).removeClass(inactiveText);
		$(tag).addClass(activeText);
	} else {
		$(tag).removeClass(activeText);
		$(tag).addClass(inactiveText);
	}

    if(options.sorted)
    {

        JSAV_sortAndRefreshSequences(divId)
    }
    else
    { 
        JSAV_refresh(divId, gSequences[divId], gStartPos[divId]-1, gStopPos[divId]-1);
    }
}

// ---------------------------------------------------------------------
/** 
Read a button and toggle the associated option, refreshing the display

@param {string}  divId     The div that we are working in
@param {string}  theButton The ID of the checkbox we are looking at
@param {string}  theOption The name of the option we are toggling

@author 
- 16.06.14 Original   By: ACRM
- 17.06.14 Added consensus
- 22.12.15 Added labels
- 09.01.17 Toggles options[theOption] and now uses class instead of checked
           options.transpose added to JSAV_refresh parameter list By: JH
*/
function JSAV_toggleOption(divId, theButton, theOption)
{
    var tag     = "#" + theButton;
    var options = gOptions[divId];
    options[theOption] = !options[theOption];
	if (options[theOption])
		$(tag).addClass("active");
	else
		$(tag).removeClass("active");
    if(options.sorted)
    {
        JSAV_sortAndRefreshSequences(divId)
    }
    else
    {
        JSAV_refresh(divId, gSequences[divId], gStartPos[divId]-1, gStopPos[divId]-1);
    }
}

// ---------------------------------------------------------------------
/**
Builds HTML for table rows that highlight a region in the alignment as
being important (e.g. CDRs of antibodies). Note that ranges for highlighting
count from zero.

@param   {string}  divId      - The div we are working in
@param   {int}     seqLen     - The length of the alignment
@param   {bool}    selectable - Are there sequences selection boxes
@param   {int[]}   highlight  - Array of residue ranges to highlight
@returns {string}             - HTML

@author 
- 13.06.14   Original   By: ACRM
- 09.01.17	 Now calls printHighlightCell to display each cell based on highlight  By: JH
*/
function JSAV_buildHighlightHTML(divId, seqLen, selectable, highlight)
{
    var html = "";

    html += "<tr class='highlightrow'><td class='leftCol'></td>";

    for(var i=0; i<seqLen; i++)
    {
		html += printHighlightCell(highlight, i, '');
    }
    html += "</tr>\n";
    return(html);
}

// ---------------------------------------------------------------------
/**
Prints the delete button

@param {string}  divId   - The ID of the div to print in
@param {string}  label   - The label to print in the delete button

@author 
- 12.06.14 Original   By: ACRM
- 18.06.14 Added tooltip
- 02.09.14 Modifies the DOM rather than printing to the document By: JHN
- 23.09.15 Added label parameter and use of this label  By: ACRM
- 25.02.16 Corrected class from delete to deletebutton
*/
function JSAV_printDelete(divId, label)
{
   var parrenttag = '#' + divId + '_controls';
   var html = "<button type='button' class='deletebutton' data-toggle='tooltip' title='Delete the selected sequences' onclick='JSAV_deleteSelectedSequences(\"" + divId + "\")'>" + label + "</button>";
   $(parrenttag).append(html);
}

// ---------------------------------------------------------------------
/**
Prints the hide button

@param {string}  divId   - The ID of the div to print in
@param {string}  label   - The label to print in the show all button

@author 
- 13.10.16 Original   By: JH
*/

function JSAV_printHide(divId, label)
{
   var parrenttag = '#' + divId + '_controls';
   var html = "<button type='button' class='hidebutton' data-toggle='tooltip' title='Hide the selected sequences' onclick='JSAV_hideSelectedSequences(\"" + divId + "\")'>" + label + "</button>";
   $(parrenttag).append(html);
}


// ---------------------------------------------------------------------
/**
Prints the show all button

@param {string}  divId   - The ID of the div to print in
@param {string}  label   - The label to print in the show all button

@author 
- 13.10.16 Original   By: JH
*/
function JSAV_printShowAll(divId, label)
{
   var parrenttag = '#' + divId + '_controls';
   var html = "<button type='button' class='showallbutton' data-toggle='tooltip' title='Show hidden sequences' onclick='resetDisplayrow(\"" + divId + "\")'>" + label + "</button>";
   $(parrenttag).append(html);
}

// ---------------------------------------------------------------------
/**
Prints the submit button

@param {string}  divId   - The ID of the div to print in
@param {string}  url     - URL to which we are submitting
@param {string}  label   - Label for submit button

@author 
- 12.06.14 Original   By: ACRM
- 18.06.14 Added tooltip
- 02.09.14 Modifies the DOM rather than printing to the document By: JHN
*/
function JSAV_printSubmit(divId, url, label)
{
   var parrenttag = '#' + divId + '_controls';
   var html = "<button type='button' class='submitbutton' data-toggle='tooltip' title='Submit the selected sequences, or all sequences if none selected' onclick='JSAV_submitSequences(\"" + divId + "\")'>" + label + "</button>";
   $(parrenttag).append(html);

   // Build a hidden sequences text box in the form to contain
   var formId = divId + "_form"; 
   var html = "<div style='display:none'><form id='" + formId + "' action='" + url + "' method='post'>";
   var textId = divId + "_submit";
   html += "<textarea id='" + textId + "' name='sequences'></textarea>";
   html += "</form></div>";
   $(parrenttag).append(html);
}

// ---------------------------------------------------------------------
/**
Prints the action button

@param {string}  divId   - The ID of the div to print in
@param {string}  action  - Function to call
@param {string}  label   - Label for action button

@author 
- 13.06.14 Original   By: ACRM
- 18.06.14 Added tooltip
*/
function JSAV_printAction(divId, action, label)
{
   var parrenttag = '#' + divId + '_controls';
   var html = "<button type='button' class='actionbutton' data-toggle='tooltip' title='Process the selected sequences, or all sequences if none selected' onclick='JSAV_wrapAction(\"" + divId + "\", \"" + action + "\")'>" + label + "</button>";
   $(parrenttag).append(html);
}

// ---------------------------------------------------------------------
/**
Wrap the action function. When the action button is clicked, this function
is called to extract the relevant sequence data and call the user specified
function, passing the divId and an array of sequence objects

@param {string}  divId   - The ID of the div to work in
@param {string}  action  - The name of the user function

@author 
- 13.06.14  Original   By: ACRM
- 11.02.16  Modified the push so that it pushes the whole object rather than
            just the selected fields. This allows additional information fields
            to be passed around associated with a sequence but not displayed
- 09.01.17  Removed 'input' frm tag as this is not required By : JH
*/
function JSAV_wrapAction(divId, action)
{
   var selectedSequences = Array();

   // See if any checkboxes are set
   var count = 0;
   var toSubmit = Array();
   // Find the selected sequences
   var tag = "#" + divId + " .selectBox";
   $(tag).each(function(index) {
       if($(this).prop('checked'))
       {
           var id = $(this).parent().parent().attr('id');
           toSubmit[id] = 1;
           count++;
       }
   });

   var textTag = "textarea#" + divId + "_submit";
   var sequenceText = "";
   var sequences = gSequences[divId];
   for(var i=0; i<sequences.length; i++)
   {
      if((count == 0) || (count == sequences.length) || (toSubmit[sequences[i].id] == 1))
      {
         selectedSequences.push(sequences[i]);
      }
   }

   window[action](divId, selectedSequences);
}

// ---------------------------------------------------------------------
/**
Handles the user clicking the submit button. Build a FASTA version of the
sequences that have been selected, fills them into a textarea in a form
and then submits the form.

@param {string} divId  - The ID of the div we are working in

@author 
- 13.06.14  Original   By: ACRM
- 17.06.14  Split out the JSAV_buildFASTA() section
*/
function JSAV_submitSequences(divId)
{
   var sequenceText = JSAV_buildFASTA(divId);

   var textTag = "textarea#" + divId + "_submit";
   $(textTag).text(sequenceText);

   var formTag = "#" + divId + "_form";
   $(formTag).submit();
}

// ---------------------------------------------------------------------
/**
Builds a FASTA version of the sequences that are currently selected, or all
sequences if none are selected

@param   {string} divId   - The ID of the div we are printing in
@returns {string}         - FASTA sequence

@author 
- 17.06.14 Split out from JSAV_submitSequences()  By: ACRM
- 09.01.17 Removed 'input' from tag as this is not required By: JH
*/
function JSAV_buildFASTA(divId)
{
   // See if any checkboxes are set
   var count = 0;
   var toFASTA = Array();
   // Find the selected sequences
   var tag = "#" + divId + " .selectBox";
   $(tag).each(function(index) {
       if($(this).prop('checked'))
       {
           var id = $(this).parent().parent().attr('id');
           toFASTA[id] = 1;
           count++;
       }
   });

   var sequenceText = "";
   var sequences = gSequences[divId];
   for(var i=0; i<sequences.length; i++)
   {
       if((count == 0) || (count == sequences.length) || (toFASTA[sequences[i].id] == 1))
       {
           sequenceText += ">" + sequences[i].id + "\n";
           sequenceText += sequences[i].sequence + "\n";
       }
   }

   return(sequenceText);
}

// ---------------------------------------------------------------------
/**
Deletes a set of sequences that have been clicked

@param {string}  divId   - The ID of the div to work in

@author 
- 12.06.14 Original   By: ACRM
- 15.06.14 Changed from alert() to ACRM_alert()
- 16.06.14 Changed from confirm() to ACRM_confirm()
- 17.06.14 Added consensus
- 22.12.15 Added passing of labels
- 09.01.17 Removed 'input' from tag as this is not required By: JH
*/
function JSAV_deleteSelectedSequences(divId)
{
    var count = 0;
    var toDelete = Array();
    // Find the selected sequences
    var tag = "#" + divId + " .selectBox";
    $(tag).each(function(index) {
        if($(this).prop('checked'))
        {
            var id = $(this).parent().parent().attr('id');
            toDelete.push(id);
            count++;
        }
    });

    if(count == 0)
    {
        ACRM_alert("Error!","You must select some sequences!");
    }
    else if(count == gSequences[divId].length)
    {
        ACRM_alert("Error!","You can't delete all the sequences!");
    }
    else
    {
        var message = "Delete " + count + " selected sequences?";
        ACRM_confirm("Confirm", message, function(confirm){
            if(confirm)
            {
                // Run through the global sequence array deleting the selected objects
                for(var i=0; i<toDelete.length; i++)
                {
                    ACRM_deleteItemByLabel('id', toDelete[i], gSequences[divId]);
                }

                var options = gOptions[divId];

                // Update the consensus
                if(options.consensus)
                {
                    gConsensus[divId] = JSAV_buildConsensus(gSequences[divId]);
                }

                // Refresh the display
                JSAV_refresh(divId, gSequences[divId], gStartPos[divId]-1, gStopPos[divId]-1);
                options.sorted = false;
            }
        });
    }
}

// ---------------------------------------------------------------------
/**
Hides a set of sequences that have been clicked

@param {string}  divId   - The ID of the div to work in

@author 
- 04.11.16 Original based on JSAV_deleteSelectedSequences By: JH
*/
function JSAV_hideSelectedSequences(divId)
{
    var count = 0;
    var toHide = Array();
    // Find the selected sequences
    var tag = "#" + divId + " .selectBox";
    $(tag).each(function(index) {
        if($(this).prop('checked'))
        {
			var id = $(this).attr('name').substr(7);
		    toHide.push(id);
            count++;
        }
    });

    if(count == 0)
    {
        ACRM_alert("Error!","You must select some sequences!");
    }
    else
    {
		// Run through the global sequence array undisplaying the selected objects
        for(var i=0; i<toHide.length; i++)
           {
           unsetDisplayrow('id', toHide[i], gSequences[divId]);
           }
        var options = gOptions[divId];

        // Update the consensus
        if(options.consensus)
            {
            gConsensus[divId] = JSAV_buildConsensus(gSequences[divId]);
            }

        // Refresh the display
        JSAV_refresh(divId, gSequences[divId], gStartPos[divId]-1, gStopPos[divId]-1);
        options.sorted = false;
    }
}

// ---------------------------------------------------------------------
/**
Sets displayrow to false for each sequence row

@param {string}   key   - The key (item in an object or hash key) 
                          to check
@param {string}   value - The value to check
@param {object[]} array - The array of objects to manipulate

@author
- 09.01.17 Original -  - based on ACRM_deleteItemByLabel
*/

function unsetDisplayrow(key, value, array)

{
    for(var i=0; i<array.length; i++)
    {
       if(array[i][key] == value)
       {
           array[i].displayrow = false;
	   }
    }
}

// ---------------------------------------------------------------------
/**
Reinitialises displayrow for all sequences  to true. Recalculates consensus sequences and refreshes

@param {string} divId	- the divId we're dealing with

@author
- 09.01.17 Original By: JH
*/

function resetDisplayrow(divId)
{
	initDisplayrow(gSequences[divId]);
    // Update the consensus
    var options = gOptions[divId];

    if(options.consensus)
        {
        gConsensus[divId] = JSAV_buildConsensus(gSequences[divId]);
        }

    // Refresh the display
    JSAV_refresh(divId, gSequences[divId], gStartPos[divId]-1, gStopPos[divId]-1);
    options.sorted = false;
}

// ---------------------------------------------------------------------
/**
Toggle selection of all sequence selection buttons

@param {string}  divId   - The ID of the div to work in

@author 
- 09.06.14 Original   By: ACRM
*/
function JSAV_selectAllOrNone(divId)
{
   var tag = "#" + divId + "_AllNone";

   if($(tag).prop('checked'))
   {
       JSAV_selectAll(divId);
   }
   else
   {
       JSAV_unselectAll(divId);
   }
}


// ---------------------------------------------------------------------
/**
Select all sequence selection buttons

@param {string}  divId   - The ID of the div to work in

@author 
- 09.06.14 Original   By: ACRM
- 09.01.17 Removed 'input' from tag as this is not required By: JH
*/
function JSAV_selectAll(divId)
{
   var tag = "#" + divId + " .selectBox";
   $(tag).prop('checked', true);
}

// ---------------------------------------------------------------------
/**
Unselect all sequence selection buttons

@param {string}  divId   - The ID of the div to work in

@author 
- 09.06.14 Original   By: ACRM
- 09.01.17 Removed 'input' from tag as this is not required By: JH
*/
function JSAV_unselectAll(divId)
{
   var tag = "#" + divId + " .selectBox";
   $(tag).prop('checked', false);
}

// ---------------------------------------------------------------------
/**
Change the <td> elements to have a white border

@param {string}  divId   - The ID of the div to work in

@author 
- 12.06.14 Original   By: ACRM
*/
function JSAV_modifyCSS(divId)
{
    var selector = "#" + divId + " .JSAV td";
    $(selector).css("border", "1px solid white");
}

// ----------------------------------------------------------------
/**
Prints a single resudue cell based on previous cell, colourscheme, consensuscell, etc.

@param {string} divId			- the divId we're dealing with
@param {string} aa				- the residue code to print
@param {string} prevAa			- the previous residue code
param {string} consensusClass	- consensus class
@param {bool} isConsensus		- status of global isConsensus property
@returns {string} html			- HTML

@author
- 09.01.17 Original taken from JSAV_buildASequenceHTML By: JH
*/

function printResidueCell(aa, prevAa, consensusClass, isConsensus, nocolour, dotify, colourScheme, pref) {
	
var colourClass = colourScheme + aa.toUpperCase();

if((dotify || nocolour) && !isConsensus)
	{
	if(nocolour)
		{
		if(aa == "-") 
			{ 
			colourClass = "aaDel"; 
			}
		}
	if(aa == prevAa)
		{
		if(nocolour)
			{
			if(aa == '-')
				{
				colourClass = "aaDel";	
				}
			else
				{
				colourClass = "aaDot";	
				}
			}
		if(dotify)
			if(aa != '-') {aa = '.';}
		}
	var html = "<td class='"+pref+"seqCell " + colourClass + "'>" + aa + "</td>";
	}
else 
	{

	var html = "<td class='"+pref+"seqCell " + colourClass + consensusClass + "'>" + aa + "</td>";
	}
return(html);
}
 
// ---------------------------------------------------------------------
/**
Builds the HTML for printing a sequence as a table row. The row 
starts with the identifier and is followed by each amino acid in a 
separate <td> tag with a class to indicate the amino acid type 
(e.g. taylorW for a tryptophan in Willie Taylor scheme). 

@param {string}   divId         The divId we're dealing with
@param {string}   id            The identifier
@param {string}   sequence      A string containing the sequence
@param {string}   prevSequence  A string containing the previous sequence
@param {bool}     isConsensus   This is the consensus sequence
@param {string}   idSubmit      URL to visit when sequence label clicked
@returns {string} tableline     HTML snippet

@author 
- 30.05.14 Original  By: ACRM
- 16.06.14 Added dotify and nocolour - now takes prevSequence parameter
- 17.06.14 Added isConsensus and colourScheme
- 18.06.14 Added tooltip
- 23.09.15 Added idSubmit/idSubmitClean
- 11.02.16 Added idSubmitAttribute, now takes a sequence object rather than
           the sequence and the id
- 09.01.17 Changed first if statement to allow independent dotify or nocolour display
		   Individual cell display now carried out by printResidueCell By: JH
*/
function JSAV_buildASequenceHTML(divId, sequenceObject, id, sequence, prevSequence, isConsensus, idSubmit)
{
	var options = gOptions[divId];
	var seqArray     = sequence.split("");
    var prevSeqArray = undefined;

    if((options.dotify || options.nocolour) && (prevSequence != undefined))
    {
        prevSeqArray = prevSequence.split("");
    }

    var tableLine = "";

    var consensusClass = "";
    if(isConsensus)
    {
        consensusClass = " consensusCell";
    }

    var nResidues = seqArray.length;
    for(var i=0; i<nResidues; i++) {
	var prevAa = (prevSeqArray != undefined) ? prevSeqArray[i] : '#';   
        tableLine += printResidueCell(seqArray[i], prevAa, consensusClass, isConsensus, options.nocolour, options.dotify, options.colourScheme, '');
	}
  
    tableLine += "</tr>";
    return(tableLine);
}

// --------------------------------------------------------------------
/**
Displays thin row coloured by the label type (heavy or light)

@param {array}		labels		The label array
@retuen {text}		tableLine	HTML

@author
- 21.03.17  Original	By: JH
*/

function JSAV_buildTypeLabel(labels) {

var tableLine = "";
tableLine += "<tr class='typeLabelRow'><td class='leftCol'></td>";
for (var l=0; l<labels.length; l++) {
    var cellCol = (labels[l].substring(0,1) == 'L') ? "light-col" : "heavy-col";
    tableLine += "<td class='" + cellCol + "'></td>";
}
tableLine += "</tr>";
return(tableLine);
}

// ---------------------------------------------------------------------
/**
Displays the currently selected range as text and calls the routine		
to higlight that range in the alignment view.

Called as JSAV_showRange(divID)

@param {text}      divId    Identifier of the display div

@author 
- 06.06.14  Original   By: ACRM
- 10.06.14  Removed redundant .closest() from finding parent
- 23.09.15  Changed "Sort from: xx to: xx" to "Region: positions xx to yy"
- 24.09.15  Changed to using .html() instead of .text()
- 09.01.17	Now uses global start and stop instead of slider positions By: JH
*/
function JSAV_showRange(divId)
{
    
    // Display the range currently selected
   var parenttag = '#' + divId + '_controls';
   var span_showrange = $("<span id='" + divId + "_showrange'></span>").appendTo(parenttag);
   var tag = "#" + divId + "_showrange";
   if (gOptions[divId].transpose) {
      $(tag).html('');
   } else {
      var html = "<p>Region: positions " + gStartPos[divId] + " to " + gStopPos[divId] + "</p>";
      $(tag).html(html);
      JSAV_markRange(divId, gSequenceLengths[divId], gStartPos[divId]-1, gStopPos[divId]-1);
   }
}

// ---------------------------------------------------------------------
/**
Simple wrapper function to obtain the currently selected range

@param   {string}   divId    Identifier for display div
@returns {int[]}             Start and stop of range

@author 
- 06.06.14  Original   By: ACRM
*/

function JSAV_getRange(divId)
{
   var start = gStartPos[divId]-1;
   var stop  = gStopPos[divId]-1;
   return([start, stop]);
}

// -------------------------------------------------------------------------
/**
Prints a single highlight cell base on the highlight array

@param {int[]} highlight	- the highlight array
@param {int} i				- the element id of the cell
@param {string} pref		- class for display (different for transposed view)
@returns {string}			- text for td tag and class

@author
- 09.01.17 Original By: JH (based on original section of JSAV_buildHighlightHTML)
*/

function printHighlightCell(highlight, i, pref) {

var displayClass = 'unhighlighted';
for(var j=0; j<highlight.length; j+=2)
	{
	var start = highlight[j];
	var stop  = highlight[j+1];
	if((i >= start) && (i <= stop))
		{
		displayClass = 'highlighted';
		break;
		}
	}
	return("<td class='"+displayClass+" "+pref+"' /></td>");
}

// ---------------------------------------------------------------------
/**
Takes an array of sequence objects and builds the HTML to display
them as a coloured table in transposed (vertical) orientation

@param   {string}     divId       ID of div in which to print
@param   {object[]}   sequences   Array of sequence objects
@returns {string}    		      HTML

@author 
- 02.12.16 Original  By: JH (based on original JSAV_buildSequencesHTML)
*/

function JSAV_transposeSequencesHTML(divId, sequences)

{
	var dispOrder = gDisplayOrder[divId];
	var options = gOptions[divId]
	var html = "";
	html += "<div class='JSAV'>\n";
        
        // Create id line

	html += "<div class='tr_seqids'><table border='0'>\n";
	html += "<tr><th class='tr_labels idCell rotate'><div>All/None</div></th>";
	if (options.selectable) html += "<td class='tr_highlightrow'></td>";
	for (var i=0;i<sequences.length;i++) 
		if (sequences[dispOrder[i]].displayrow)
			{
			var id = sequences[dispOrder[i]].id;
			if(options.idSubmit == null)
				{
				html += "<th class='tr_seqCell idCell rotate'><div>" + id + "</div></th>";
				}
			else
				{
             			var idSubmitAttribute = options.idSubmitAttribute;
				var url         = options.idSubmit;
				var submitParam = sequences[dispOrder[i]][idSubmitAttribute];
				if(options.idSubmitClean)
					{
					submitParam = submitParam.replace(/[^A-Za-z0-9]/g, '');
					}
       			url += submitParam;
				html += "<th class='tr_seqCell idCell rotate'><div><a href='" + url + "'>" + id + "</a></div></th>";
				}
			}
	if(options.consensus != undefined)
		html += "<th class='idCell rotate tr_consensusCell'><div>Consensus</div></th>";
	if (options.selectable) html += "<td class='tr_highlightrow'></td>";
	html += '</tr>';
        html += "</table></div>";


	// Create the selection button line
	if (options.selectable) {
                html += "<div class='tr_seltable'><table border='0'>";
                html += "<td class='tr_labels'>";
		html += JSAV_buildSelectAllHTML(divId, options.selectable, 'tr_');
		if (options.selectable) html += "<td class='tr_highlightrow'></td>";
		for (var i=0;i<sequences.length;i++) 
			if (sequences[dispOrder[i]].displayrow)
				{
				var name = "select_" + sequences[dispOrder[i]].id;
				html += "<td class='tr_seqCell tr_selectCell'><input class='selectBox' type='checkbox' name='" + name + "' /></td>";
				}
		if(options.consensus != undefined)
			html += "<td class='tr_seqCell tr_consensusCell'></td>";
		if (options.selectable) html += "<td class='tr_highlightrow'></td>";
		html += '</tr>';
                html += "</table></div>";
	}
	
	// Create transposed sequences
        html += "<div class='tr_seqtable'><table border='0'>";
        html += "<tr class='topline'><td></td></tr>";
        for (var i=0;i<gSequenceLengths[divId];i++)
		{
                var toplineStr = (i==0) ? "topborder" : "";
		html += "<tr><th class='tr_labels idCell "+toplineStr+"'>"+options.labels[i]+"</th>";
		if (options.selectable) {
			html += printHighlightCell(options.highlight, i, 'tr_highlightrow');
			}
		for (var s=0; s<sequences.length; s++) 
			if (sequences[dispOrder[s]].displayrow) 
			{
			var prevAa = (s!=0) ? sequences[dispOrder[s-1]].sequence[i] : '#';
			var aa = sequences[dispOrder[s]].sequence[i];
			html += printResidueCell(aa, prevAa, "", false, options.nocolour, options.dotify, options.colourScheme, 'tr_');
			}
		if(options.consensus != undefined) {
			var aa = gConsensus[divId][i];
			var prevAa = '#';
			html += printResidueCell(aa, prevAa, " tr_consensusCell", true, options.nocolour, options.dotify, options.colourScheme, 'tr_');
			}
		if (options.selectable) {
			html += printHighlightCell(options.highlight, i, 'tr_highlightrow');
			}
		
		html += "</tr>";
		}
	html += "</table>\n";
        html += "</div>\n";
	html += "</div>\n";
	return(html);
}
// ----------------------------------------------------------------
/**
Builds the label for the sequence row

@param 		{string}	divId		ID of the div we're dealing with
@param 		{string}	attributeValue 	value of idSubmitAttribute for the id
@param 		{string}	id		sequence's id
@param 		{string}	idSubmit	text for label link	
@returns	{string}	tableLine	HTML for the label

@author
- 23.03.17 Original By: JH
*/

function JSAV_buildId(divId, attributeValue, id, idSubmit) {

    var options = gOptions[divId];
    var tableLine = "<tr class='seqrow' id='" + id + "'>";

    if (idSubmit == null)
    {
       tableLine += "<th class='idCell'>" + id + "</th>";
    }
    else
    {
       var url         = idSubmit;
       var submitParam = attributeValue;
       if(options.idSubmitClean)
       {
          // This would only normally be done in the default case where idSubmitAttribute is 'sequence'
          // It probably wouldn't make sense for IDs etc
          submitParam = submitParam.replace(/[^A-Za-z0-9]/g, '');
       }
       
       url += submitParam;
       tableLine += "<th class='idCell'><a href='" + url + "'>" + id + "</a></th>";
    }


    tableLine += "</tr>";
return(tableLine);
}

// ---------------------------------------------------------------------
/**
Takes an array of sequence objects and builds the HTML to display
them as a coloured table

@param   {string}     divId       ID of div in which to print
@param   {object[]}   sequences   Array of sequence objects
@returns {string}                 HTML

@author 
- 30.05.14 Original  By: ACRM
- 06.06.14 Added call to build the marker row of selected residues
- 10.06.14 Added sortable and selectable parameters
- 13.06.14 Added highlight
- 16.06.14 Added dotify
- 17.06.14 Added consensus
- 22.12.15 Added labels
- 09.01.17 Added empty string format parameter to JSAV_buildSelectAllHTML (uses 'tr_' in transposed version) 
		   Uses displayOrder to display sequences in sorted order	By: JH
*/

function JSAV_buildSequencesHTML(divId, sequences)
{
   var options = gOptions[divId];
   var dispOrder = gDisplayOrder[divId];
   $('#' + divId + '_sortable').css('height', calculateTableHeight(sequences, options.consensus, options.highlight, options.sortable, options.scrollY));
   var html = "";
   html += "<div class='JSAV'>\n";
   html += "<div class='seqids'><table border='0'>\n";

   // Create the toggle all/none selection button		
   if (options.selectable)
	{ html += "<tr class='labelrow'><th class='idCell'>All/None&nbsp;</th></tr>"; }
   else
        { html += "<tr class='labelrow'><th>&nbsp;</th></tr>"; }
   html += "<tr class='labelrow'><td>&nbsp;</td></tr>";

   html += "<tr class='typeLabelRow'><td></td></tr>";

  if(options.highlight != undefined)
    html += "<tr class='highlightrow'><th class='idCell'>CDRs</th></tr>";

   for(var i=0; i<sequences.length; i++) 
	if (sequences[dispOrder[i]].displayrow)					
  	 {
     	 html += JSAV_buildId(divId, sequences[dispOrder[i]][options.idSubmitAttribute], sequences[dispOrder[i]].id, options.idSubmit) + "\n";
   	 }
   if(options.consensus != undefined)
       {
       html += "<tr class='seqrow'><th class='idCell'>Consensus</th></tr>";
       }
  if(options.highlight != undefined)
      html += "<tr class='highlightrow'><th class='idCell'>CDRs</th></tr>";

   html += "<tr class='typeLabelRow'><td></td></tr>";

   if(options.sortable) {
       html += "<tr class='markerrow' data-toggle='tooltip' title='Select region for sorting'><th class='idCell'>Sort Region</th></tr>";
   }
   html += "</table></div>";
   // ----------------------------------------------------
   if (options.selectable)  {
      html += "<div class='seltable'><table border='0'>";
      html += JSAV_buildSelectAllHTML(divId, options.selectable, '');
      html += "<tr class='labelrow'><td>&nbsp;</td><tr>";
      html += "<tr class='typeLabelRow'><td></td></tr>";
      if(options.highlight != undefined)
         html += "<tr class='highlightrow'><th></th></tr>";
      for(var i=0; i<sequences.length; i++) 
	if (sequences[dispOrder[i]].displayrow)	
          {				
  	  var name = "select_" + sequences[dispOrder[i]].id;
          html += "<tr class='seqrow'><th class='selectCell'><input class='selectBox' type='checkbox' name='" + name + "' /></th></tr>";
          }
      if(options.consensus != undefined)
         html += "<tr class='seqrow'><td></td></tr>";
      if(options.highlight != undefined)
         html += "<tr class='highlightrow'><th></th></tr>";
      html += "<tr class='typeLabelRow'><td></td></tr>";
      if(options.sortable) {
         html += "<tr class='markerrow' data-toggle='tooltip' title='Select region for sorting'><th></th></tr>";
      }
      html += "</table></div>";
      
   }
   // -----------------------------------------------------
   html += "<div class='seqtable'><table border='0'>\n";


  if(options.labels != undefined)
   {
       html += "<tr class='labelrow'><td class='leftCol'></td>";
       html += JSAV_buildLabelsHTML(divId,  gSequenceLengths[divId], options.labels);
   }
   html += '</tr>';											
  if(options.labels != undefined)
    html += JSAV_buildTypeLabel(options.labels);

  if(options.highlight != undefined)
   {
       html += JSAV_buildHighlightHTML(divId, gSequenceLengths[divId], options.selectable, options.highlight);
   }						
   // Build the actual sequence entries
   for(var i=0; i<sequences.length; i++) 
      if (sequences[dispOrder[i]].displayrow)					
        {
        html += "<tr class='seqrow' id='" + sequences[dispOrder[i]].id + "'><td class='leftCol'></td>";
        var prevSequence = undefined;
        if(i>0) { prevSequence = sequences[dispOrder[i-1]].sequence; }
        html += JSAV_buildASequenceHTML(divId, sequences[dispOrder[i]], sequences[dispOrder[i]].id, sequences[dispOrder[i]].sequence, prevSequence, false, options.idSubmit) + "\n";
        }
   if(options.consensus != undefined)
      {
      html += "<tr class='consensusCell seqrow' data-toggle='tooltip' title='The consensus shows the most frequent amino acid. This is lower case if &le;50% of the  sequences have that residue.'><td class='leftCol'></td>";
      html += JSAV_buildASequenceHTML(divId, null, 'Consensus', gConsensus[divId], undefined, true, null) + "\n";
      }

   if(options.highlight != undefined)
   {
       // If we are highlighting regions in the sequence, do so again at the bottom of the table
       html += JSAV_buildHighlightHTML(divId, gSequenceLengths[divId], options.selectable, options.highlight);
   }
  if(options.labels != undefined)
    html += JSAV_buildTypeLabel(options.labels);
   if(options.sortable)
   {
      // The marker section which shows the range selected for sorting
      html += JSAV_buildMarkerHTML(divId, gSequenceLengths[divId], options.selectable);
   }

   html += "</table></div></div>\n";
   return(html);
}

// ---------------------------------------------------------------------
/**
Build the HTML for creating a row in the table that contains a checkbox
for selecting/deselecting all sequences

@param   {string}  divId  - ID of the div we are working in
@param   {int}     seqLen - sequence length
@param	 {string}  pref   - prefix for display class - uses 'tr_' for transposed cells
@returns {string}         - HTML

@author 
- 09.06.14 Original   By: ACRM
- 18.06.14 Added tooltip
- 09.01.17 Changes made to allow for reformatting of labels By: JH
*/
function JSAV_buildSelectAllHTML(divId, selectable, pref)
{
   var html;
   var id = divId + "_AllNone";

   if (selectable) {
	   html = "<tr class='labelrow'></th><th class='"+pref+"selectCell'><input class='selectBox' data-toggle='tooltip' title='Select or deselect all sequences' id='" + id + "' type='checkbox' onclick='JSAV_selectAllOrNone(\"" + divId + "\");' /></th>";
   } else {
	   html = "<tr class='labelrow'>"
   }   
   return(html);
}

// ---------------------------------------------------------------------
/**
Creates the HTML to display the marker row that indicates the selected
residues to be used for sorting

@param   {string}   divId      - Identifier of display div
@param   {int}      seqLen     - Length of sequences alignement
@param   {int}      selectable - Do we have select boxes?
@returns {string}              - HTML

@author 
- 06.06.14  Original   By: ACRM
- 10.06.14  Added 'selectable'
- 23.09.15  Added &nbsp; into 'Sort Region' to stop it breaking the line
- 09.01.17  Markers are now used for selecting start and stop for sort By: JH
*/
function JSAV_buildMarkerHTML(divId, seqLen, selectable)
{
    var html = "";

    html += "<tr class='markerrow' data-toggle='tooltip' title='Select region for sorting'><td class='leftCol'>";

    for(var i=0; i<seqLen; i++)
    {
        var id = divId + "_JSAVMarker" + i;
		var onmousedown = "setSortStart(\""+divId+"\", "+(i)+");";
		var onmouseover = "setSortRange(\""+divId+"\", "+i+");";
        html += "<td id='" + id + "' onmousedown='"+onmousedown+"' onmouseover='"+onmouseover+"'>&nbsp;</td>";
    }
    html += "</tr>\n";
    return(html);
}

// ---------------------------------------------------------------------	
/**
Sets the start (and stop) position when mouse is depressed

@param {string} divId 	- the divId we're dealing with
@param {int} i 			- the sort region position

@author
- 09.01.17 Original By: JH
*/

function setSortStart(divId, i) {
	
gStartPos[divId] = i+1;
gStopPos[divId] = i+1;
mouseState = "down";
JSAV_showRange(divId);
}

// -----------------------------------------------------------------------
/**
Adjusts the stop position to current cell if mouse is depressed

@param {string} divId 	- the divId we're dealing with
@param {int} i 			- the sort region position

@author
- 09.01.17 Original By: JH
*/

function setSortRange(divId, i) {
if (mouseState=="down") {
	gStopPos[divId] = i+1;
	JSAV_showRange(divId);
	}

}

// ---------------------------------------------------------------------
/**
Initialises the global mouseState

@author
- 09.01.17 Original By: JH
*/

function mouseUpHandler() {
mouseState = "up";
}

// ---------------------------------------------------------------------
/**
Finds the real ends of a sequence stored in an array by skipping over
'-' characters. Returns the offsets of the actual ends. 
NOTE: Consequently to loop over the sequence you now need to do 
   for(var i=seqEnds[0]; i<=seqEnds[1]; i++)
i.e. <= rather than < the last position

@param   {char[]}   seqArray   Sequence stored in an array
@returns {int[]}               Offsets of first and last real
                               amino acid

@author 
- 04.06.14 Original   By: ACRM
*/
function JSAV_FindRealSequenceEnds(seqArray)
{
   var seqEnds = [];

   // Find the real start - just increment the counter while there is a - in the sequence
   seqEnds[0] = 0;
   while((seqArray[seqEnds[0]] == '-') || (seqArray[seqEnds[0]] == ' '))
   {
      seqEnds[0]++;
   }

   // Find the real end - just decrement the counter while there is a - in the sequence
   seqEnds[1] = seqArray.length - 1;
   while((seqArray[seqEnds[1]] == '-') || (seqArray[seqEnds[1]] == ' '))
   {
      seqEnds[1]--;
   }

   return(seqEnds);
}

// ---------------------------------------------------------------------
/**
Choose a representative from a difference matrix. The difference
matrix contains the number of differences between each pair of 
sequences. This routine simply totals up the number of differences
for each sequence compared with all the other sequences and then
chooses the one with fewest differences

@param   {int-2DArray}  differenceMatrix  - Differences between each pair
                                            of sequences
@returns {int}                            - Index of the representative
                                            sequence

@author 
- 29.05.14 Original   By: ACRM
*/
function JSAV_chooseRepresentative(differenceMatrix)
{
   var totalDiffs = [];
   var nSeqs = differenceMatrix.length;

   // For each sequence, find its total differences from all other 
   // sequences
   for(var i=0; i<nSeqs; i++)
   {
      totalDiffs[i] = 0;
      for(var j=0; j<differenceMatrix[i].length; j++)
      {
         totalDiffs[i] += differenceMatrix[i][j];
      }
   }

   // Find which sequence is most similar to all the other sequences
   var lowestDiff = 1000000;
   var representative = -1;
   for(var i=0; i<nSeqs; i++)
   {
      if(totalDiffs[i] < lowestDiff)
      {
         lowestDiff = totalDiffs[i];
         representative = i;
      }
   }

   return(representative);
}

// ---------------------------------------------------------------------
/**
Takes an array of sequence indexes, the index of a reference sequence
and the difference matrix between all sequences. It then returns an
array of sequence indexes for all the sequences most similar to the
reference sequence

@param  {int[]}       sequenceIndexes   Indexes of a set of sequences to search
@param  {int}         refSeq            Index of the sequence to compare with
@param  {int-2DArray} differenceMatrix  differences between sequences
@returns {int[]}                        Indexes of the sequences closest to
                                        the reference sequence

@author 
- 04.06.14 Original    By: ACRM
*/
function JSAV_findClosestSequences(sequenceIndexes, refSeq, differenceMatrix)
{
   var closestSequences = [];
   var smallestDifference = 1000000;

   for(var i=0; i<sequenceIndexes.length; i++)
   {
      // Find the difference between the specified reference sequence
      var thisDifference =
         differenceMatrix[sequenceIndexes[i]][refSeq]; 
      if(thisDifference < smallestDifference)
      {
         smallestDifference = thisDifference;
         closestSequences = [];
         closestSequences.push(sequenceIndexes[i]);
      }
      else if(thisDifference == smallestDifference)
      {
         closestSequences.push(sequenceIndexes[i]);
      }
   }
   
   return(closestSequences);
}


// ---------------------------------------------------------------------
/**
Sorts an array of sequence objects to group similar sequences together.
The sorting method chooses a representative sequence (one
which is most similar to all the other sequences) placing that first
in the list. To add to the sorted list, it iteratively chooses the
sequences that are most similar to the last one in the list and, of
those chooses the sequence most similar to the representative
sequence

@param   {object[]}   sequences   Array of sequence objects
@param   {int}        start       Offset of start of region to sort
@param   {int}        stop        Offset of end of region to sort
@returns {object[]}               Sorted array of sequence objects

@author 
- 29.05.14 Original   By: ACRM
- 04.06.14 Added ignoreEnds (true) to JSAV_calcDifferenceMatrix() call
         Range version
*/
function JSAV_sortSequences(sequences, start, stop)
{
   var sortedSequences = [];
   var sortedIndexes   = [];
   var nSeqs           = sequences.length;
   var ignoreEnds      = false;

   // If the start or stop is specified as -1, or we are looking at the
   // whole sequence, then ignore missing residues at the ends during 
   // the sort

   if((start < 0) || (stop < 0) ||
      ((start == 0) && (stop == (sequences[0].sequence.length - 1))))
   {
      ignoreEnds = true;
   }

   // Initialize array of sequences that have been used in the sorted 
   // output
   var used = [];
   for(var i=0; i<nSeqs; i++)
   {
      used[i] = 0;
   }

   // Choose a representative sequence for the top of the list
   var differenceMatrix = JSAV_calcDifferenceMatrix(sequences, start, stop, ignoreEnds);
   var representative   = JSAV_chooseRepresentative(differenceMatrix);
   sortedIndexes[0]     = representative;
   used[representative] = 1;
   var nSortedSeqs      = 1;

   while(nSortedSeqs < nSeqs)
   {
      // Initialize array of sequence IDs to contain all unused sequences
      var unusedSequences = [];
      for(var i=0; i<nSeqs; i++)
      {
         if(!used[i])
         {
            unusedSequences.push(i);
         }
      }
      
      // Find the sequences which are closest to the last sequence in the
      // sorted list
      var closestSequencesToLast = 
         JSAV_findClosestSequences(unusedSequences, sortedIndexes[nSortedSeqs-1], differenceMatrix);

      // Of the sequences most similar to the last one in the sorted
      // list, find the ones most similar to the representative sequence
      var closestSequencesToReference = 
         JSAV_findClosestSequences(closestSequencesToLast, sortedIndexes[0], differenceMatrix);

      // Take the first of these as the next sequence in the sorted list
      var mostSimilar = closestSequencesToReference[0];
      sortedIndexes[nSortedSeqs++] = mostSimilar;
      used[mostSimilar] = 1;
   }

   // Finally copy across the sequences in sorted order
   for(var i=0; i<nSeqs; i++)
   {
      sortedSequences[i] = sequences[sortedIndexes[i]];
   }

   return(sortedSequences);
}


// ---------------------------------------------------------------------
/**
Takes an array of sequence objects and generates a 2D difference
matrix. This contains the number of differences between each pair
of sequences

@param  {object[]}  sequences    Array of sequence objects
@param  {int}       start        Offset of start of region to sort
@param  {int}       stop         Offset of end of region to sort
@param  {BOOL}      ignoreEnds   Ignore insert characters at
                                 ends of sequences
@returns {int-2DArray}           Differences between each pair
                                 of sequences

@author 
- 29.05.14 Original   By: ACRM
- 04.06.14 Added ignoreEnds handling
         Range version
*/
function JSAV_calcDifferenceMatrix(sequences, start, stop, ignoreEnds)
{
   var nSeq = sequences.length;

   var differenceMatrix = ACRM_array(nSeq, nSeq);
   for(var i=0; i<nSeq; i++)
   {
      for(var j=0; j<nSeq; j++)
      {
         differenceMatrix[i][j] =
         JSAV_calcDifference(sequences[i].sequence, sequences[j].sequence, start, stop, ignoreEnds);
      }
   }
   return(differenceMatrix);
}


// ---------------------------------------------------------------------
/**
Takes two sequences as strings and calculates the number of 
differences between them (effectively the Hamming distance).
If ignoreEnds is specified then don't include gap characters at 
the ends of the sequences

@param   {string} seq1        Sequence string
@param   {string} seq2        Sequence string
@param   {int}    regionStart Offset of start of region to sort
@param   {int}    regionStop  Offset of end of region to sort
@param   {BOOL}   ignoreEnds  Ignore gaps at the end of the sequences
                              in calculating differences
@returns {int}                Number of differences between the sequences

@author 
- 29.05.14 Original  By: ACRM
- 04.06.14 Added ignoreEnds handling
         Created this Range version
*/
function JSAV_calcDifference(seq1, seq2, regionStart, regionStop, ignoreEnds)
{
   var seqArray1   = [];
   var seqArray2   = [];
// seq1.substring(regionStart, regionStop+1).split("");

   if((regionStart < 0) || (regionStop < 0))
   {
      seqArray1 = seq1.split("");
      seqArray2 = seq2.split("");
   }
   else
   {
      seqArray1 = seq1.substring(regionStart, regionStop+1).split("");
      seqArray2 = seq2.substring(regionStart, regionStop+1).split("");
   }

   var differences = 0;

   var seqLen = Math.max(seqArray1.length, seqArray2.length);

   var start = 0;
   var stop  = seqLen - 1;
   
   if(ignoreEnds)
   {
      // Find the offsets of the first and last real residue in the sequences
      var seq1Ends = JSAV_FindRealSequenceEnds(seqArray1);
      var seq2Ends = JSAV_FindRealSequenceEnds(seqArray2);

      start = Math.max(seq1Ends[0], seq2Ends[0]);
      stop  = Math.min(seq1Ends[1], seq2Ends[1]);
   }

   for(var i=start; i<=stop; i++)
   {
      if(seqArray1[i] != seqArray2[i])
      {
         differences++;
      }
   }
   return(differences);
}


// ---------------------------------------------------------------------
/**
Sorts a set of sequences and refreshes the display in a div with
the specified ID - the idea is that the unsorted sequences would
be displayed here and then this is tied to the action on a button
that sorts and refreshes the display.

@param {char}  divId        ID of an HTML <div>
@returns {bool}             FALSE - (not sure why!)

@author 
- 29.05.14 Original   By: ACRM
- 11.06.14 sequences is now global
- 12.06.14 split out the JSAV_refresh() part
- 16.06.14 Added dotify and nocolour options to refresh call
- 17.06.14 Added consensus
- 22.12.15 Added passing of labels
- 09.01.17 Calls resetDisplayColumn to reset display status of datatabe columns after sequence sort By: JH
*/
function JSAV_sortAndRefreshSequences(divId)
{
   var id = divId + "_JSAVStart";

   var range=JSAV_getRange(divId);
   var sortedSequences = JSAV_sortSequences(gSequences[divId], range[0], range[1]);
   resetDisplayColumn(gDisplayColumn[divId], gSequences[divId]);
   
   JSAV_refresh(divId, sortedSequences, range[0], range[1]);

   // Record the fact that the display has been sorted
   gOptions[divId].sorted = true;

   return(false);
}


// ---------------------------------------------------------------------
/**
Refreshes the content of the divId_sortable div with the new sequence table
Also updates the marked range and the CSS if the border option is set

@param {char}     divId        ID of an HTML <div>
@param {object[]} sequences    Array of sequence objects
@param {int}      start        start of selected region
@param {int}      stop         end of selected region

@author 
- 12.06.14  Original split out from JSAV_sortAndRefreshSequences() By: ACRM
- 16.06.14  Added dotify and nocolour
- 17.06.14  Added consensus
- 19.06.14  Added callback
- 22.12.15  Added labels
- 09.01.17  Choice of display (transposed or standard) based on transpose parameter
		JSAV_MarkRange only called if options.sortable is true
		Also calls printDataTable		By: JH
*/
function JSAV_refresh(divId, sequences, start, stop)
{
	var options = gOptions[divId];
	if (options.transpose) {
		var html = JSAV_transposeSequencesHTML(divId, sequences);
	} else {
		var html = JSAV_buildSequencesHTML(divId, sequences);
	}
									  
   var element = document.getElementById(divId + "_sortable");
   element.innerHTML = html;
   if(options.border)
   {
       JSAV_modifyCSS(divId);
   }

   if (options.sortable)
   {	  
	   JSAV_showRange(divId);
   }
   
   printDataTable(divId, sequences);						

   if(options.callback != undefined)
    {
        window[options.callback](divId);
    }

}

// ---------------------------------------------------------------------
/**
Marks a range of residues in the main sequence display table.
The special marker row is used for this and we simply alter the
class to pick up the appropriate colour for the cells from CSS

@param {string}    divId   Identifier for the display div
@param {int}       seqLen  Length of the alignment
@param {int}       start   Offset of first residue to be
                           marked (0-based)
@param {int}       stop    Offset of last residue to be
                           marked (0-based)

@author 
- 06.06.14  Original   By: ACRM
- 13.06.14  Changed from highlighted to marked
*/
function JSAV_markRange(divId, seqLen, start, stop)
{
   for(var i=0; i<seqLen; i++)
   {
       var id = divId + "_JSAVMarker" + i;
       document.getElementById(id).className = 'unmarked';
   }
  
   if((start >= 0) && (stop >= 0))
   {
      for(var i=start; i<=stop; i++)
      {
          var id = divId + "_JSAVMarker" + i;
          document.getElementById(id).className = 'marked';
      }
   }
}

// ---------------------------------------------------------------------
/**
Initializes global arrays

@author 
- 09.06.14 Original   By: ACRM
- 12.06.14 Added more arrays
- 17.06.14 Added gConsensus array
- 01.09.17 Added gDisplayOrder and gDisplayColumn  By: JH
*/
function JSAV_init()
{
   // Indexed by divId and used to store the values
   try
   {
       if(gSequences == undefined)
       {
           ;
       }
   }
   catch(err)
   {
       gSequences       = Array();
       gOptions         = Array();
       gStartPos        = Array();
       gStopPos         = Array();
       gConsensus       = Array();
       gSequenceLengths = Array();
       gDisplayOrder 	= {};
       gDisplayColumn 	= {};
   }
}


// ---------------------------------------------------------------------
/**
Simply returns an array of the available colouring schemes in the CSS
file

@returns {string[]}   - Colour schemes

@author 
- 17.06.14   Original   By: ACRM
*/
function JSAV_initColourChoices()
{
    return(['Taylor', 'Clustal', 'Zappo', 'HPhob', 'Helix', 'Strand',
            'Turn', 'Buried']);
}

// ---------------------------------------------------------------------
/**
Calculates a consensus sequence

@param   {object[]}  sequences  - Array of sequence objects
@returns {string}               - Consensus sequence

@author 
- 17.06.14  Original   By: ACRM
- 01.09.17  Added displayrow condition - consensus calculated on non-hidden sequences only
*/
function JSAV_buildConsensus(sequences)
{
    var nSeqs    = sequences.length;
    var seqLen   = sequences[0].sequence.length;
    // Initialize array
    var aaCounts = Array(seqLen);
    for(var i=0; i<seqLen; i++)
    {
        aaCounts[i] = Array();
    }

    // Step through the sequences
    for(var seq=0; seq<nSeqs; seq++)
	if (sequences[seq].displayrow)					
    {
        var seqArray = sequences[seq].sequence.split('');

        // Step through the positions
        for(var pos=0; pos<seqLen; pos++)
        {
            if(aaCounts[pos][seqArray[pos]] == undefined)
            {
                aaCounts[pos][seqArray[pos]] = 1;
            }
            else
            {
                aaCounts[pos][seqArray[pos]]++;
            }
        }
    }

    // Step through the positions to determine the most common residue
    var consensus = "";
    var validAAs = "ACDEFGHIKLMNPQRSTVWY-".split('');
    for(var pos=0; pos<seqLen; pos++)
    {
        var mostCommon = undefined;
        var maxAA      = 0;
        for(var aaCount=0; aaCount<validAAs.length; aaCount++)
        {
            if((aaCounts[pos][validAAs[aaCount]] != undefined) &&
               (aaCounts[pos][validAAs[aaCount]] >  maxAA))
            {
                mostCommon = validAAs[aaCount];
                maxAA = aaCounts[pos][validAAs[aaCount]];
            }
        }
        if(maxAA <= (nSeqs / 2))
        {
            mostCommon = mostCommon.toLowerCase();
        }
        consensus += mostCommon;
    }
    return(consensus);
}


// ---------------------------------------------------------------------
/** 
General purpose routine to delete an object from an array of objects
where the object contains the specified key:value pair.

@param {string}   key   - The key (item in an object or hash key) 
                          to check
@param {string}   value - The value to check
@param {object[]} array - The array of objects to manipulate

@author 
- 12.06.14 Original   By: ACRM
*/
function ACRM_deleteItemByLabel(key, value, array)
{
    for(var i=0; i<array.length; i++)
    {
       if(array[i][key] == value)
       {
           array.splice(i,1);
           break;
       }
    }
}

// ---------------------------------------------------------------------
/**
General purpose function to create a multi-dimensional array

@param   {int/int[]}  length   Size of each dimension
@returns {array}               (multi-dimensional) Array

Usage:
ACRM_array();     // [] or new Array()
ACRM_array(2);    // new Array(2)
ACRM_array(3, 2); // [new Array(2),
                  //  new Array(2),
                  //  new Array(2)]

@author 
- 29.05.14 Taken from http://stackoverflow.com/questions/966225/
           how-can-i-create-a-two-dimensional-array-in-javascript
*/
function ACRM_array(length) 
{
    var arr = new Array(length || 0),
        i   = length;

    if (arguments.length > 1) 
    {
        var args = Array.prototype.slice.call(arguments, 1);
        while(i--) arr[length-1 - i] = ACRM_array.apply(this, args);
    }

    return arr;
}


// ---------------------------------------------------------------------
/**
General purpose confirm() dialogue using JQueryUI dialog rather than the
simple JavaScript confirm() method

@param {string}   title    - title for the confirm box
@param {string}   msg      - the message to be displayed
@param {function} callback - function to be called after the OK or cancel
                             button is called. A boolean parameter is
                             passed to the function - true for OK, false
                             for cancel

@author 
- 15.06.14 Original   By: ACRM
*/
function ACRM_confirm(title, msg, callback) 
{
    var dialogObj = $("<div style='display:none' title='" + title + "'>"+msg+"</div>");
    $('body').append(dialogObj);
    $(dialogObj).dialog({
        resizable: false,
        modal: true,
        buttons: {
            Cancel: function() {
                callback(false);
                $( this ).dialog( "close" );
                $( this ).remove();
            },
            "OK": function() {
                callback(true);
                $( this ).dialog( "close" );
                $( this ).remove();
            }
        }
    });
};

// ---------------------------------------------------------------------
/**
General purpose alert() dialogue using JQueryUI dialog rather than the
simple JavaScript alert() method

@param {string}   title    - title for the confirm box
@param {string}   msg      - the message to be displayed

@author 
- 15.06.14 Original   By: ACRM
*/
function ACRM_alert(title, msg) 
{
    var dialogObj = $("<div style='display:none' title='" + title + "'>"+msg+"</div>");
    $('body').append(dialogObj);
    $(dialogObj).dialog({
        resizable: false,
        modal: true,
        buttons: {
            "OK": function() {
                $( this ).dialog( "close" );
                $( this ).remove();
            }
        }
    });
};

// ---------------------------------------------------------------------
/**
General purpose dialogue using JQueryUI dialog

@param {string}   title    - title for the confirm box
@param {string}   msg      - the message to be displayed
@param {string}   width    - the width of the window (e.g. '600px')
@param {bool}     pre      - wrap the displayed text in <pre> tags

@author 
- 17.06.14 Original   By: ACRM
*/
function ACRM_dialog(title, msg, width, pre) 
{
    var dialogObj;
    if(pre)
    {
        dialogObj = $("<div style='display:none' title='" + title + "'><pre>"+msg+"</pre></div>");
    }
    else
    {
        dialogObj = $("<div style='display:none' title='" + title + "'>"+msg+"</div>");
    }
    $('body').append(dialogObj);
    $(dialogObj).dialog({
        resizable: false,
        width: width,
        modal: true,
        buttons: {
            "Dismiss": function() {
                $( this ).dialog( "close" );
                $( this ).remove();
            }
        }
    });
};


// ---------------------------------------------------------------------
/**
Create the HTML for a label row in the sequence display

@param   {string}   divId      - The div we are working in
@param   {int}      seqLen     - The length of the alignment
@param   {bool}     selectable - Are there sequences selection boxes
@param   {string[]} labels     - Array of labels
@returns {string}              - HTML

@author 
- 22.12.15 Original   By: ACRM
- 09.01.17 Modified considerably for new label format	By: JH
*/
function JSAV_buildLabelsHTML(divId,  seqLen, labels)
{
    var html = "";
    var labelNumbers = "";
    for(var i=0; i<labels.length; i++)
    {
        // Make a copy of the label and remove the chain label
        var cellCol = (labels[i].substring(0,1) == 'l') ? "light-txt" : "heavy-txt";
        var labelText = labels[i].replace(/^[A-Za-z]/g, '');
        var lastChar = labelText.substring(labelText.length-1,labelText.length);
		html += "<td class='"+cellCol+"'>";
 		if (lastChar == "0") {
			labelNumbers = labels[i].replace(/[A-Za-z]/g, '');
			}
		if (labelNumbers.length > 0) {
			html += labelNumbers[0];
			labelNumbers = labelNumbers.substring(1,labelNumbers.length)
			}
		
		html += "</td>";
	}
   html += "</tr><tr class='labelrow'><td class='leftCol'></td>";
   for(var i=0; i<labels.length; i++)
    {
        var cellCol = (labels[i].substring(0,1) == 'l') ? "light-txt" : "heavy-txt";
        var labelText = labels[i].replace(/^[A-Za-z]/g, '');

        // Find the last character
        var lastChar = labelText.substring(labelText.length-1,labelText.length);

        // Open a table cell with the label as a tooltip
        html += "<td class='"+cellCol+"' data-toggle='tooltip' title='" + labels[i] + "'>";

        // Insert the appropriate character
        if(lastChar == "0")                   // 0 - do a '|'
        {
			html += "|";
        }
        else if (lastChar.match(/[A-Za-z]/))  // Insert code - show the code
        {
            html += lastChar;
        }
        else                                  // Otherwise do a '.'
        {
            html += ".";
        }

        // And finish the table cell
        html += "</td>";
    }

    return html;
}


// ---------------------------------------------------------------------
/**
Create an array of labels

@param   {object[]} sequences  - Array of sequence objects
@returns {string[]}            - Array of labels

@author 
- 22.12.15 Original   By: ACRM
*/
function JSAV_autoLabels(sequences)
{
    var seqLen = sequences[0].sequence.length;
    var labels = Array();
    for(var i=1; i<=seqLen; i++)
    {
        labels.push(i.toString());
    }
    return labels;
}

// -----------------------------------------------------------------
// ------------------ Data Table Functions -------------------------
// -----------------------------------------------------------------
/**
Initialises dispOrder to initial sequence ordering

@param {object[]} sequences 	- array of sequence objects
@returns {int[]} dispOrder	- array of sequence elements in order of display

@author
- 09.01.17 Original By: JH
*/

function initDisplayOrder(sequences) {

var dispOrder = [];
for (var r=0; r<sequences.length; r++) {
	dispOrder[r] = r;
	}
return(dispOrder);
}

// -----------------------------------------------------------------
/**
Initialises dispColumn to default code 1 (unsorted) for each data table column (except sequence and displayrow)

@param {object[]} sequences 	- array of sequence objects
@returns {int[]} dispColumn		- array of codes for indicating column sort status

@author
- 09.01.17 Original By: JH
*/

function initDisplayColumn(divId, sequences) {
	
var dispColumn = {};
for (var key in sequences[0]) {
	if ((key != 'sequence') && (key != 'displayrow') && (key != 'id')) {
		if (gOptions[divId].defaultColumns.indexOf(key.substring(6)) >= 0)
		{ 
		  dispColumn[key] = 1; 
		} else {
                  dispColumn[key] = 0;
                }
	}
}   
return(dispColumn);
}

// -----------------------------------------------------------------
/**
resets displayColumn to default code 1 (unsorted) for each data table column (except sequence)

@param {object[]} sequences 		- array of sequence objects
@param {int[]} displayColumn		- array of codes for indicating column sort status

@author
- 09.01.17 Original By: JH
*/

function resetDisplayColumn(displayColumn, sequences) {
for (var key in displayColumn) 
	if ((key != 'sequence') && (key != 'id'))
		if (displayColumn[key] >0)
			displayColumn[key] = 1;
}

// -----------------------------------------------------------------
/**
Calculates optimum table height based on number of sequences

@param {object[]} sequences		- array of sequence objects
@param {int} scrollY			- default scrollY value
@returns {string} dispht		- text for height css

@author
- 09.01.17 Original By: JH
*/

function DT_calculateTableHeight(sequences, scrollY) {
	var rowcount = 0;
	var rowheight = 20;
	var headerheight = 100;

	for (var s=0; s<sequences.length; s++)
		if (sequences[s].displayrow) rowcount++;
	var height = (headerheight + (rowcount * rowheight));

	if (height < scrollY ) 
		{ var dispht = height + 'px'; }
	else
		{ var dispht = scrollY + 'px'; }
        return(dispht);
}

// -----------------------------------------------------------------
/**
Sorts the table based on the column values and the sort direction
Final ordering is set in gDisplayOrder[divId]
Calls JSAV_refresh to redraw the sequences and table

@param {string} divId 		- the divId we're dealing with
@param {string} direction	- the sort direction
@param {string} colName		- name of the column on which the sort is based

@author
- 09.01.17 Original By: JH
*/

function compareVals(colVal, hiVal, numeric) {

if (numeric) {
    if (Number(colVal) > Number(hiVal))
       return 1;
    else if (Number(colVal) < Number(hiVal))
       return -1;
    else return 0;
} else {
     if (colVal > hiVal)
       return 1; 
     else if (colVal < hiVal)
       return -1;
     else return 0;
}
}

function DT_sortColumn(divId, direction, colName) {
	
var options = gOptions[divId];
var sequence = gSequences[divId];
var numeric = true;	
var idxFree = [];
var hV = -1;
gStartPos[divId] = 1;
gStopPos[divId] = gSequenceLengths[divId];

for (var r1=0; r1<sequence.length; r1++) {
	idxFree[r1] = true;
	if (isNaN(sequence[r1][colName])) {
		hV = ''; 
		numeric = false;
		}
	}
if (direction == 'asc') {
	for (var r1=sequence.length-1; r1>=0; r1--) 
		{
		var hiVal = hV;
		var idx = 0;
		for (var r2=0; r2<sequence.length; r2++)
			if (idxFree[r2]) {
				if (compareVals(sequence[r2][colName], hiVal, numeric) >=0 ) {
					hiVal = sequence[r2][colName];
					idx = r2;
					}
			}
		idxFree[idx] = false;
		gDisplayOrder[divId][r1] = idx;
		}
	gDisplayColumn[divId][colName] = 2;
} else {
	for (var r1=0; r1<sequence.length; r1++) 
		{
		var hiVal = hV;
		var idx = 0;
		for (var r2=0; r2<sequence.length; r2++)
			if (idxFree[r2]) {
				if (compareVals(sequence[r2][colName], hiVal, numeric) >0) {
					hiVal = sequence[r2][colName];
					idx = r2;
					}
			}
		idxFree[idx] = false;
		gDisplayOrder[divId][r1] = idx;
		}
	gDisplayColumn[divId][colName] = 3;
}
for (var key in gDisplayColumn[divId])
	if ((key != colName) && (gDisplayColumn[divId][key] != 0))
		gDisplayColumn[divId][key] = 1;

JSAV_refresh(divId, gSequences[divId], 0, gSequences[divId][0].sequence.length-1);

} 
 
// -----------------------------------------------------------------
/**
Toggles display of the column then recalls printDataTable
@param {string} divId	- divId we're dealing with
@param {string} colName - name of column to display/undisplay

@author
- 09.01.17 Original By: JH
*/

function DT_toggleColumn(divId, colName) {
		
        if (gDisplayColumn[divId][colName]) {
		gDisplayColumn[divId][colName] = 0;
	}
	else {
		gDisplayColumn[divId][colName] = 1;
	}
        printDataTable(divId, gSequences[divId]);
		
}

// -----------------------------------------------------------------
/**
Main function for printing the data table

@param {string} divId		- divId we're dealing with
@param {object[]} sequences - array of sequence objects

@author
- 09.01.17 Original By: JH
*/

function printDataTable(divId, sequences) {
//alert(sequences[9]["Light_Chain id"]);
var options = gOptions[divId];
$('#' + divId + '_Table').css('height', DT_calculateTableHeight(sequences, options.scrollY));
var html = '';
var dispOrder = gDisplayOrder[divId];
var tableDiv = divId + '_Table';
var tableTag = "#" + tableDiv;
html += printToggleList(divId);
html += printTableHeader(divId);
html += "<tbody id='" + divId + "_table'>";
for (var s=0;s<sequences.length;s++)
	html += printDataRow(divId, sequences[dispOrder[s]]);
html += '</tbody></table>';
$("#" + tableDiv).html(html);
}

// -----------------------------------------------------------------
/**
Prints the toggle list - the buttons for redisplaying columns where display is toggled off

@param {string} divId 		- divId we're dealing with
@returns {string} html		- HTML

@author
- 09.01.17 Original By: JH
*/

function printToggleList(divId) {

var html = "<div class='toggle-col-list'><span class='toggle-col-text'>Show hidden columns: </span><br />";
for (var key in gDisplayColumn[divId]) {
	var onclick = "DT_toggleColumn(\"" + divId + "\", \"" + key + "\");"; 
 	if (gDisplayColumn[divId][key] == false) {
        	var seqtype = key.substring(0,5);
		html += "<button class='"+seqtype+"-col toggle-col' onclick='"+onclick+"'>"+key.substring(6)+"</button>";
        }
} 
html += '</div>';
return(html);
}

// -----------------------------------------------------------------
/**
Prints the header for the table columns. Top line is the 'hide' icon, to toggle the column display to off.
Second line is the Name and the sort icon, based on the respective field in gDisplayColumn.

@param {string} divId 		- divId we're dealing with
@returns {string} html		- HTML

@author
- 09.01.17 Original By: JH
*/

function printTableHeader(divId) {
	
var html = "<table class='results' border='1' id='" + divId + "_table'><thead>";

var maxrows = 0;
for (var key in gDisplayColumn[divId]) 
  if (gDisplayColumn[divId][key]) {		
	var numrows = key.split('_');
        if (numrows.length > maxrows) maxrows = numrows.length;
	}

for (var row=0; row<maxrows; row++) {
  html += "<tr>";
  var colspan = 3;
  var rowstart = true;
  var lastcell = "";
  var lasthtml = "";
  for (var key in gDisplayColumn[divId]) {
	if (gDisplayColumn[divId][key]) {		
              	var colheaders = key.split('_');
		var colheader = "";
		var colClass = colheaders[0]+"-col";
		for (var r=0;r<=row;r++)
			colheader += colheaders[r];
                var htmlcell = "";
		if (colheader == lastcell) {
			colspan +=3;
		} else {
			colspan = 3;
		}
                if (row==0) {
                  var seqtype = colheaders[0];
                  }
                else if (row==colheaders.length-1) {
		  switch (gDisplayColumn[divId][key]) { 
			case 2: var clist='headerSortDown'; 
					var direction = "desc";
					break;
			case 3: var clist='headerSortUp'; 
					var direction = "asc";
					break;
			default: var clist='headerSortBoth'; 
					var direction = "asc";
			}
		  var toggleclick = "DT_toggleColumn(\"" + divId + "\", \"" + key + "\");";
		  var sortclick = "DT_sortColumn(\"" + divId + "\", \"" + direction + "\", \"" + key + "\");";
	 	  htmlcell += "<th class='header"+colheaders[0]+"Hide "+colClass+"' data-toggle='tooltip' title='Hide Column "+key+"' onclick='"+toggleclick+"'></th>";
                  htmlcell += "<th class='header "+colClass+"'>"+colheaders[row]+"</th>";
		  htmlcell += "<th class='"+clist+" "+colClass+"' data-toggle='tooltip' title='Sort Column "+key+"' onclick='"+sortclick+"'></th>";
		} else {
                  htmlcell += "<th class='"+colClass+"' colspan="+colspan+">";
                  if (row < colheaders.length) htmlcell += colheaders[row]; 
                  htmlcell += "</th>";
                }
                if (rowstart) {
                     	rowstart = false;
		} else if (colheader != lastcell) {
                   	html += lasthtml;
                }
		lasthtml = htmlcell;
		lastcell = colheader;
	}
  }
  html += lasthtml + "</tr>";
  }

html += "</thead>";
return(html);
}

// -----------------------------------------------------------------
/**
Displays a single row of the data table, where displayrow is true

@param {string} divId 		- the divId we're dealing with
@param {object} sequence	- the sequence to display
@returns {string} html		- HTML

@author
- 09.01.17 Original By: JH
*/

function printDataRow(divId, sequence) {

var html = "";
if (sequence.displayrow) {
	html += "<tr id = 'table_" + sequence.id + "'>";
	for (var key in gDisplayColumn[divId])
		if (gDisplayColumn[divId][key])
		{
			if (typeof(sequence[key]) == 'undefined') {
                           	html += "<td colspan=3></td>";
 			} else {
				html += "<td colspan=3>" + sequence[key] + "</td>";
			}
		}
	html += "</tr>";
	}
return(html);
}

// --------------------- END OF FILE ------------------------------------
