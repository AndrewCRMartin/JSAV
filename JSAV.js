/** @preserve 
    @file
    JSAV V2.0 13.05.19
    Copyright:  (c) Dr. Andrew C.R. Martin, UCL, 2014-2016
    This program is distributed under the Gnu Public Licence (GPLv2)
*/
/** ***********************************************************************
   Program:    JSAV  
   File:       JSAV.js
   
   Version:    V2.0
   Date:       13.05.19
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
   V2.0	   13.05.19   New functiionality includes greatly modified JSAV sequence viewer and datatable viewer.
                      Functionality includes:
                      - Datatable viewer included, with hiding of columns, sorting on column value, 
                        hiding table rows.
                      - Communication between sequence view and datatable view: sorting and row hiding will
                        be duplicated for both views.
                      - Modified sequence sorting routines.
                      - Export to CSV and Excel.

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
@property {bool}      options.selectable          - Should selection checkboxes be displayed
                                                    for each sequence
@property {bool}      options.deletable           - Makes it possible to delete sequences
@property {bool}      options.hideable	          - Makes it possible to hide sequences and respective
						    datatable rows
@property {bool}      options.hideLabel	       	  - Label for hide button.
@property {bool}      options.showallLabel        - Label for Show All button.
@property {string}    options.deleteLabel         - Label for delete button
@property {int[]}     options.highlight           - Array of ranges to highlight
@property {string}    options.submit              - URL for submitting selected sequences
@property {string}    options.submitLabel         - Label for submit button
@property {bool}      options.idSubmitClean       - Remove non-alpha characters from sequence
                                                    before submitting
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
@property {string}    options.sortLabel           - Label for sort button
@property {string}    options.exportLabel         - Label for export buttons
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
@property {string}    options.idSubmit            - URL for submitting a single sequence where its
                                                    id/label has been clicked. 
                                                    See also options.idSubmitAttribute and options.idSubmitKey
@property {string}    options.idSubmitAttribute   - Specifies a colon-separated list of attribute values of the 
                                                    sequence object which should be passed to a URL specified 
                                                    with options.idSubmit. Default is 'sequence'.
@property {string}    options.idSubmitKey         - Specifies a colon-separated list of attribute keys which 
                                                    should be passed to the URL specified with options.idSubmit.
@property {string}    options.sortColumn	  - Column to be used for initial sort (optional).
@property {string}    options.sortDirection       - Specifies direction of sort when sortColumn is used.
 
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
- 05.09.17 Removed scrollX - now 100% by default
- 12.08.19 Added sortColumn and sortDirection for initilial sorting of columns 

*/
function printJSAV(divId, sequences, options)
{
   // Deal with options
   if(options                     == undefined) { options                     = Array();                   }
   if(options.width               == undefined) { options.width               = "400px";                   }
   if(options.height              == undefined) { options.height              = "6pt";                     }
   if(options.nocolor)                          { options.nocolour            = true;                      }
   if(options.toggleNocolor)                    { options.toggleNocolour      = true;                      }
   if(options.transpose           == undefined) { options.transpose           = false;                     }
   if(options.colorScheme)                      { options.colourScheme        = options.colorScheme;       }
   if(options.colourScheme        == undefined) { options.colourScheme        = "taylor";                  }
   if(options.selectColor)                      { options.selectColour        = true;                      }
   if(options.colourChoices       == undefined) { options.colourChoices       = JSAV_initColourChoices();  }
   if(options.colorChoices        != undefined) { options.colourChoices       = options.colorChoices;      }
   if(options.deletable)                        { options.selectable          = true;                      }
   if(options.hideable)                         { options.selectable          = true;                      }	
   if(options.exportable)                       { options.selectable          = true;                      }	
   if(options.submit 		  != undefined) { options.selectable          = true;                      }	
   if(options.idSubmitAttribute   == undefined) { options.idSubmitAttribute   = "sequence";                }
   if(options.idSubmitKey         == undefined) { options.idSubmitKey         = "";                        }
   if(options.autoLabels)                       { options.labels              = JSAV_autoLabels(sequences);} 
   if(options.chainType           == undefined) { options.chainType           = "heavy";                   }
   if(options.iconButtons) 
   {
      if(options.submitLabel         == undefined) { options.submitLabel 	 = 'far fa-check-square';  }
      if(options.actionLabel         == undefined) { options.actionLabel 	 = 'fa fa-cogs';       	   }
      if(options.exportLabel         == undefined) { options.exportLabel 	 = 'fas fa-share-square';  }
      if(options.sortLabel           == undefined) { options.sortLabel 	         = 'fa fa-sort-down';	   }  
      if(options.sortUpLabel         == undefined) { options.sortUpLabel         = 'fas fa-sort-up';       } 
      if(options.sortDownLabel       == undefined) { options.sortDownLabel       = 'fas fa-sort-down';     }
      if(options.sortBothLabel       == undefined) { options.sortBothLabel       = 'fas fa-sort';          }
      if(options.toggleDotifyLabel   == undefined) { options.toggleDotifyLabel   = 'fa fa-ellipsis-h';     }
      if(options.toggleNocolourLabel == undefined) { options.toggleNocolourLabel = 'fa fa-th'; 		   }
      if(options.hideLabel           == undefined) { options.hideLabel 	         = 'fa fa-eye-slash';	   }
      if(options.showallLabel        == undefined) { options.showallLabel	 = 'fa fa-eye';		   }
      if(options.deleteLabel         == undefined) { options.deleteLabel         = 'fa fa-window-close';   }   
      options.sortUpText = '';
      options.sortDownText = '';
      options.sortBothText = '';
      options.hideText = ''
   }
   else 
   {
      options.sortUpText = '&#9650;';
      options.sortDownText = '&#9660;';
      options.sortBothText = '&#9670;';
      options.hideText = '&#9747';
   }
   // Initialize globals if not yet done
   JSAV_init();
   mouseUpHandler();
   document.onmouseup                = mouseUpHandler;
   gOptions[divId]                   = options;
   tidySequences(divId, sequences);
   gSequences[divId]                 = sequences;
   initDisplayrow(gSequences[divId]);
   gDisplayColumn[options.chainType] = initDisplayColumn(divId, sequences, gDisplayColumn[options.chainType]);
   gDisplayOrder[divId]              = initDisplayOrder(sequences);
   gSorted[divId] 		     = false;

   // Sequence View
   if (sequences.length > 0) 
   {
      gSequenceLengths[divId] = sequences[0].sequence.length;
      if (gSequenceLengths[divId] > 0) 
      {
         if(options.consensus)
         {
            gConsensus[divId] = JSAV_buildConsensus(sequences);
         }
         var div = '';
         if($("#" + divId).length == 0) 
         {
            div = $('<div />').appendTo($('body'));
            div.attr('id', divId);
         }
         else
         {
            div = $("#" + divId);
         }
         var div_sortable = $('<div />').appendTo(div);
         div_sortable.attr('id', divId + '_sortable');
         div_sortable.css('margin-left', '0.5em');
         div_sortable.css('overflow-x', 'auto');
         div_sortable.css('white-space', 'nowrap');
   
         if(options.scrollY != null)
         {
            div_sortable.css('overflow-y', 'hidden');
            div_sortable.css('white-space', 'nowrap');
         }
   
         if (options.transpose) 
         {
 	    var html = JSAV_transposeSequencesHTML(divId, sequences);
   	 } 
         else 
         {
	    var html = JSAV_buildSequencesHTML(divId, sequences);
	 }

         div_sortable.append(html);
         $('#' + divId + ' .seqtable').css('width', seqtabWidth);
         $('#' + divId + ' .outerseqtable').css('width', seqtabWidth);
         $('#' + divId + ' .header').css('width', seqtabWidth);
         $('#' + divId + ' .footer').css('width', seqtabWidth);

         var div_controls = $('<div />').appendTo(div);
         div_controls.attr('id', divId + '_controls');
         div_controls.attr('class', 'JSAVControls');
         div_controls.css('margin-left', '0.5em');
 
         if(options.sortable)
         {
            resetSortRegion(divId);
	    JSAV_ControlButton(divId, divId + '_controls', 'Sort the sequences based on the range specified in the Sort Region', 
                              options.sortLabel, '', 'Sort Sequences', 'JSAV_sortAndRefreshSequences("' + divId + '")');
         }
  
         if(options.hideable)
         {
            JSAV_ControlButton(divId, divId + '_controls', 'Hide selected sequences', 
                               options.hideLabel, '', 'Hide Sequences', 'JSAV_hideSelectedSequences("' + divId + '")');	
            JSAV_ControlButton(divId, divId + '_controls', 'Show hidden sequences', 
                               options.showallLabel, '', 'Show Hidden Sequences', 'JSAV_resetDisplayrow("' + divId + '")');	
         }
    
         if(options.deletable)
         {
	    JSAV_ControlButton(divId, divId + '_controls', 'Delete the selected sequences', 
                               options.deleteLabel, '', 'Delete Sequences', 'JSAV_deleteSelectedSequences("' + divId + '")');
	 }

         if(options.submit != undefined)
         {
            JSAV_printSubmit(divId, options.submit, options.submitLabel);
         }

         if(options.action != undefined)
         {

	    JSAV_ActionButton(divId, divId + '_controls', 'Process the selected sequences, or all sequences if none selected',
                               options.actionLabel, '', 'Process Sequences', options.action);
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

         if(options.fasta)
         {
	    JSAV_ControlButton(divId, divId + '_controls', 'Export the selected sequences, or all sequences if none selected', 
                               options.exportLabel, 'Fasta', 'Export Fasta', 'JSAV_exportFASTA("' + divId + '")');
         }
         
         if (options.exportable)
         {
            JSAV_ControlButton(divId, divId + '_controls', 'Export visible sequences to CSV', 
                               options.exportLabel, 'CSV', 'Export CSV', 'JSON2CSV("'+divId+'")');
            JSAV_ControlButton(divId, divId + '_controls', 'Export visible sequences to XML for Excel - your Excel must support XML import', 
                               options.exportLabel, 'Excel', 'Export Excel', 'JSON2XML("'+divId+'")');
         }

         if (options.frequencies) 
         {
            JSAV_printFrequencyControls(divId, divId + '_controls', options);
         }

         if(options.border)
         {
            JSAV_modifyCSS(divId);
         }
      }
  
      if (options.displaydatatable != undefined)
      {
 	 printDataTable(divId, sequences);
      }

      if (options.sortColumn != undefined)
      {
         DT_sortColumn(divId, options.sortDirection, options.sortColumn);
      }

      // Ensure buttons etc match the data
      window.onload = function(){JSAV_refreshSettings(divId);};

      if(options.callback != undefined)
      {
         window[options.callback](divId);
      }
      $('#' + divId).css('width', '96vw');
   
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
   {
      sequences[s].displayrow = true;
   }
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

    $("#"+divId+"_seqids").scrollLeft(0);
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
- 31.07.20 Added option to display colour based on frequency By: JH
*/
function JSAV_printColourSelector(divId, options)
{

   var id   = divId + "_selectColour";
   var ctype = options.chainType;
   var html = "<div style='float:left'>";
   html += "<select class='tooltip colourselect "+ctype+"button' title='Select colour scheme' id = '" + id + "' onchange='JSAV_setColourScheme(\"" + divId + "\", this)'>";

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
  
   html += "</select></div>";
   var parenttag = '#' + divId + '_controls';

   $(parenttag).append(html);
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
- 09.01.17  Added options.transpose to JSAV+refresh parameter list By: JH
- 31.07.20  Added show/hide for frequency sliders when frequencies selected By: JH
*/
function JSAV_setColourScheme(divId, select)
{
   gOptions[divId].colourScheme = select.value;
   if (gOptions[divId].frequencies) 
   {
      if (select.value == 'frequencies')
      {
         $('#'+divId+'FrequencyControls').show();
      }
      else
      {
         $('#'+divId+'FrequencyControls').hide();
      }
   }

   if(gSorted[divId])
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
Prints a control button with icons, action and tooltip

@param 	{string} divId	- The divId we're dealing with
	{string} tooltip- text for tooltip
	{string} icon	- option item for icon class
	{string} label	- extra text after icon
	{string} textLabel - alternative text label
	{string} action - button onclick action

@author
- 24.09.17 Original	By: JH
*/
function JSAV_ControlButton(divId, localDiv, tooltip, icon, label, textlabel, action)
{
   var parenttag = '#' + localDiv;
   var options = gOptions[divId];
   var ctype = options.chainType;
   var tooltipText = "title='"+tooltip+"'";
   var html = "<div style='float:left'><button type='button' class='tooltip "+ctype+"button' "+tooltipText+"  onclick='"+action+"'>";

   if (options.iconButtons) 
   {
      html += "<i class='"+icon+"' "+tooltipText+"></i> "+ label;
   } 
   else 
   {
      html +=  (icon != undefined) ? icon : textlabel;
   }

   html += "</button></div>";
   $(parenttag).append(html);
}

// ---------------------------------------------------------------------
/**
Calls a user-defined action, passing it the divId and an array of selected
and visible sequences. Called from the button created by JSAV_ActionButton()

@param {string} action - The name of the function to be called
       {string} divId -  The divId we're dealing with

@author 
- 06.07.20 Original   By: ACRM
*/
function JSAV_RunAction(action, divId)
{
   var sequences         = gSequences[divId];
   var selectedSequences = Array();

   // See if any checkboxes are set
   var count     = 0;
   var toFASTA   = Array();
   var dispOrder = gDisplayOrder[divId];

   // Find the selected sequences
   var tag = "#" + divId + " .selectBox";
   $(tag).each(function(index)
               {
                  if($(this).prop('checked'))
                  {
                     var id = $(this).attr('name').substr(7);
                     toFASTA[id] = 1;
                     count++;
                  }
               });
   for(var i=0; i<sequences.length; i++)
   {
      if(sequences[dispOrder[i]] == undefined)
      {
         alert("ERROR!!!! DispOrder[" + i + "] undefined");
      }
      else
      {
         if(sequences[dispOrder[i]].displayrow)
         {
            if((count ==0) || (count == sequences.length) || (toFASTA[sequences[dispOrder[i]].id] == 1))
            {
               selectedSequences.push(sequences[dispOrder[i]]);
            }
         }
      }
   }
   window[action](divId, selectedSequences);
}

// ---------------------------------------------------------------------
/**
Prints an action button with icons, action and tooltip

@param {string} divId     - The divId we're dealing with
       {string} tooltip   - text for tooltip
       {string} icon      - option item for icon class
       {string} label     - extra text after icon
       {string} textlabel - alternative text label
       {string} action    - button onclick action

@author 
- 06.07.20 Original based on JSAV_ControlButton   By: ACRM
*/
function JSAV_ActionButton(divId, localDiv, tooltip, icon, label, textlabel, action)
{
   var parenttag = "#" + localDiv;
   var options = gOptions[divId];
   var ctype = options.chainType == undefined ? 'JSAV' : options.chainType;
   var tooltipText = "title='"+tooltip+"'";
   var html = "<button type='button' class='tooltip " + ctype+"button' " + tooltipText + " onclick='JSAV_RunAction(\"" + action +"\", \"" + divId + "\")'>";

   if (options.iconButtons)
   {
      html += "<i class='"+icon+"' "+tooltipText+"></i> "+ label;
   }
   else
   {
      html += (icon != undefined) ? icon : textlabel;
   }
   
   html += "</button>";

   $(parenttag).append(html);

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
   var active = "";
   var ctype = options.chainType;
   if(options.dotify) { active = " active"; };
   var id = divId + "_toggleDotify";
   var label = options.toggleDotifyLabel;
   var idText = " id='" + id + "'";
   var onclick = " onclick='JSAV_toggleOption(\"" + divId + "\", \"" + id + "\", \"dotify\")'";
   var title = "title='Replace repeated residues with dots'";
   var html = "<div style='float:left'><button type='button' class='tooltip "+ctype+"button" + active + "' " + idText + " " +title+ " "  + onclick + ">";
   if (gOptions[divId].iconButtons) 
   {
      html += "<i class='"+label+"'  "+title+"></i></button>";
   } 
   else 
   {
      html += "Dotify</button></div>";
   }

   var parenttag = '#' + divId + '_controls';
   $(parenttag).append(html);
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
   var active = "";
   var ctype = options.chainType;
   if(options.nocolour) { active = " active"; };
   var id = divId + "_toggleNocolour";
   var idText = " id='" + id + "'";
   var label = options.toggleNocolourLabel;
   var onclick = " onclick='JSAV_toggleOption(\"" + divId + "\", \"" + id + "\", \"nocolour\")'";
   var title = "title='Do not colour repeated residues'";
   var html = "<div style='float:left'><button type='button' class='tooltip "+ctype+"button" + active + "' " + idText + " "+title+ " " + onclick + ">"
   if (gOptions[divId].iconButtons) 
   {
      html += "<i class='"+label+"' "+title+"></i></button>";
   } 
   else 
   {
      html += "No Repeat Colour</button></div>";
   }
   var parenttag = '#' + divId + '_controls';
   $(parenttag).append(html);
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
   var ctype = options.chainType;
   var html = "<div style='float:left'>";
   var activeText = "fas fa-reply";
   var inactiveText = "fas fa-share";
   var active = "";
   if(options.transpose) 
   { 
      active = activeText; 
   } 
   else 
   { 
      active = inactiveText; 
   }

   var id = divId + "_toggleTranspose";
   var idText = " id='" + id + "'";
   var onclick = " onclick='JSAV_toggleTranspose(\"" + divId + "\", \"" + id + "\", \"transpose\", \"" +activeText+"\",  \"" +inactiveText+"\")'";
   var tooltip = "Transpose sequence view";

   if (options.iconButtons) 
   {
      html += "<button type='button' class='tooltip "+ctype+"button' title='"+tooltip+ "' "  + onclick + "><i " + idText + " class='"+active+"'></i></button>";
   }
   else 
   {
      html += "<button type='button' class='tooltip "+ctype+"button' " + idText + " title='"+tooltip+ "' "  + onclick + ">Transpose Sequences</button>";
   }
   html += "</div>";
   var parenttag = '#' + divId + '_controls';
   $(parenttag).append(html);
}

// ---------------------------------------------------------------------
/** 
Toggles between normal and transposed view, resetting height and width accordingly

@param {string}  divId        The div that we're dealing with
@param {object}  theButton    The transpose button object
@param {string}  theOption    The options transpose element
@param {string}  activeText   Icon for the active button
@param {string}  inactiveText Icon for the inactive button

@author 
- 03.01.17 Original   By: JH

*/
function JSAV_toggleTranspose(divId, theButton, theOption, activeText, inactiveText) 
{

   var div_sortable = $('#' + divId + '_sortable');
   var options = gOptions[divId];
   if(options[theOption]) 
   { 
      div_sortable.css('max-height', '');
      $('#' + divId).css('width', '96vw');
   } 
   else //transposed
   {
      div_sortable.css('max-height', '1000px');
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

   if (options[theOption]) 
   {
      $(tag).removeClass(inactiveText);
      $(tag).addClass(activeText);
   } 
   else 
   {
      $(tag).removeClass(activeText);
      $(tag).addClass(inactiveText);
   }

   if(gSorted[divId])
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
   {
      $(tag).addClass("active");
   }
   else
   {
      $(tag).removeClass("active");
   }

   if(gSorted[divId])
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
- 09.01.17	 Now calls calculate printHighlightCell to display each cell based on highlight  By: JH
*/
function JSAV_buildHighlightHTML(divId, seqLen, selectable, highlight, cc)
{
   var html = "";
   var pref;

   //    html += "<tr class='highlightrow'></td>";

   for(var i=0; i<seqLen; i++)
   {
      pref = '';
      if (i == cc) { pref = 'br_highlightrow'; }
      html += printHighlightCell(highlight, i, pref);
   }

   html += "<td class='rhcol'></td>\n";
   return(html);
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
   var parenttag = '#' + divId + '_controls';
   var ctype = gOptions[divId].chainType;
   var title = "title='Submit the selected sequences, or all sequences if none selected'";
   var html = "<button type='button' class='tooltip "+ctype+"button' "+title+" onclick='JSAV_submitSequences(\"" + divId + "\")'>";
   if (gOptions[divId].iconButtons) 
   {
      html += "<i class='"+label+"' "+title+"></i>";
   } 
   else 
   {
      html += "Submit Selected Sequences";
   }
   html += "</button>";

   $(parenttag).append(html);

   // Build a hidden sequences text box in the form to contain
   var formId = divId + "_form"; 
   var html = "<div style='display:none'><form id='" + formId + "' action='" + url + "' method='post'>";
   var textId = divId + "_submit";
   html += "<textarea id='" + textId + "' name='sequences'></textarea>";
   html += "</form></div>";
   $(parenttag).append(html);
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
   $(tag).each(function(index) 
               {
                  if($(this).prop('checked'))
                  {
                     var id = $(this).attr('name').substr(7);
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
   var dispOrder = gDisplayOrder[divId];
   // Find the selected sequences
   var tag = "#" + divId + " .selectBox";
   $(tag).each(function(index) 
               {
                  if($(this).prop('checked'))
                  {
	             var id = $(this).attr('name').substr(7);
                     toFASTA[id] = 1;
                     count++;
                  }
               });
   var sequenceText = "";
   var sequences = gSequences[divId];
   for(var i=0; i<sequences.length; i++)
   {
      if (sequences[dispOrder[i]].displayrow)
      {
         if((count == 0) || (count == sequences.length) || (toFASTA[sequences[dispOrder[i]].id] == 1))
         {
            sequenceText += ">" + sequences[dispOrder[i]].id + "\n";
            sequenceText += sequences[dispOrder[i]].sequence + "\n";
         }
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
   $(tag).each(function(index) 
               {
                  if($(this).prop('checked'))
                  {
	             var id = $(this).attr('name').substr(7);
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
      ACRM_confirm("Confirm", message, function(confirm)
                   {
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
                          if(gSorted[divId])
                          {
                             JSAV_sortAndRefreshSequences(divId)
                          }
                          else
                          {
                             JSAV_refresh(divId, gSequences[divId], gStartPos[divId]-1, gStopPos[divId]-1);
                          } 
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
   $(tag).each(function(index) 
               {
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
         JSAV_unsetDisplayrow('id', toHide[i], gSequences[divId]);
      }
      var options = gOptions[divId];

      // Update the consensus
      if(options.consensus)
      {
         gConsensus[divId] = JSAV_buildConsensus(gSequences[divId]);
      }

      // Refresh the display
      if(gSorted[divId])
      {
         JSAV_sortAndRefreshSequences(divId);
      }
      else
      {
         JSAV_refresh(divId, gSequences[divId], gStartPos[divId]-1, gStopPos[divId]-1);
      }
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

function JSAV_unsetDisplayrow(key, value, array)

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

function JSAV_resetDisplayrow(divId)
{
   initDisplayrow(gSequences[divId]);
   // Update the consensus
   var options = gOptions[divId];

   if(options.consensus)
   {
      gConsensus[divId] = JSAV_buildConsensus(gSequences[divId]);
   }

   // Refresh the display
   if(gSorted[divId])
   {
      JSAV_sortAndRefreshSequences(divId);
   }
   else
   {
      JSAV_refresh(divId, gSequences[divId], gStartPos[divId]-1, gStopPos[divId]-1);
   }
}

// ---------------------------------------------------------------------
/**
Toggle selection of all sequence selection buttons

@param {string}  divId   - The ID of the div to work in

@author 
- 09.06.14 Original   By: ACRM
*/
function JSAV_selectAllOrNone(divId, status)
{
   var tag = "." + divId + "_AllNone";

   if (status)
   {
      JSAV_selectAll(divId);
      $(tag).prop('checked', true);
   }
   else
   {
      JSAV_unselectAll(divId);
      $(tag).prop('checked', false);   
   }
}

//----------------------------------------------------------------------
/**
*/
function JSAV_resetAllNone(divId, cboxname, cboxstatus)
{
   var tag = "." + divId + "_AllNone";
   $(tag).prop('checked', false);
   tag = "." + cboxname;
   if (cboxstatus) 
   {
      $(tag).prop('checked', true);
   } 
   else 
   {
      $(tag).prop('checked', false);
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
   tag = "#" + divId + "_Table .selectBox";
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
   tag = "#" + divId + "_Table .selectBox";
   $(tag).prop('checked', false);
}

// ----------------------------------------------------------------------------------
/**
Prints the frequency slider and range boxes
@param  {string}     	divId		the div we're dealing with
@param  {string}     	controlDiv	the div for the controls
@param	{object}	opts		options object

@author 
- 01.06.18 Original  By: JH
*/
function printFrequencySlider(divId, controlDiv, opts) 
{

   var lowerlimit = '#' + controlDiv.toString() + 'lowerlimit';
   var upperlimit = '#' + controlDiv.toString() + 'upperlimit';
   var sliderrange = '#' + controlDiv.toString() + 'slider';
   var AboveMax = '#' + controlDiv.toString() + 'AboveMax';
   var initialPos = 100 * (opts.freqMax - opts.freqSlider2)/opts.freqMax;
   var AboveMaxDiv = '<div id="' + controlDiv.toString() + 'AboveMax" class="AboveMax" style="width: '+initialPos+'%"></div>';

   $(sliderrange).slider({
      range: true,
      min: 0,
      step: gOptions[divId].freqStep,
      max: gOptions[divId].freqMax,
      values: [gOptions[divId].freqSlider1, gOptions[divId].freqSlider2],
      change: function(event, ui) 
                      {
                         var disabled = $(sliderrange).slider( "option", "disabled");
                         if (!disabled)
                         {
                            $(lowerlimit).val(ui.values[0]);
                            $(upperlimit).val(ui.values[1]);
                            gOptions[divId].freqSlider1 = ui.values[0];
                            gOptions[divId].freqSlider2 = ui.values[1];
                            JSAV_refresh(divId, gSequences[divId], gStartPos[divId]-1, gStopPos[divId]-1);
	                    var max = parseFloat($(sliderrange).slider( "option", "max"));
                            $(AboveMax).css('width', 100 * (max - ui.values[0]) / max + '%');
                         }
                      },
      slide: function(event, ui) 
                     {
                        var disabled = $(sliderrange).slider( "option", "disabled");
                        if (!disabled)
                        {
                           $(lowerlimit).val(ui.values[0]);
                           $(upperlimit).val(ui.values[1]);
                           gOptions[divId].freqSlider1 = ui.values[0];
                           gOptions[divId].freqSlider2 = ui.values[1];
                           JSAV_refresh(divId, gSequences[divId], gStartPos[divId]-1, gStopPos[divId]-1);
	                   var max = parseFloat($(sliderrange).slider( "option", "max"));
                           $(AboveMax).css('width', 100 * (max - ui.values[0]) / max + '%');
                        }
                     }
      }).append(AboveMaxDiv);
   $(sliderrange).slider().addClass("freq-slider");
   
   //Set initial values
   $(lowerlimit).change(function()
                        {
                           var newlowerlim = parseFloat(this.value);
                           $(sliderrange).slider('values',0,newlowerlim);
                           gOptions[divId].freqSlider1 = newlowerlim;
                        });
   
   $(upperlimit).change(function()
                        {
                           var newupperlim = parseFloat(this.value);
                           $(sliderrange).slider('values',1,newupperlim);
                           gOptions[divId].freqSlider2 = newupperlim;
                        });
 
}

// ----------------------------------------------------------------------------------
/**
Prints the heatmap control divs and slider
@param  {string}     	divId		the div we're dealing with
@param  {string}     	controlDiv	the div for the controls
@param	{object}	opts		options object

@author 
- 01.06.18 Original  By: JH
*/
function JSAV_printFrequencyControls(divId, controlDiv, opts) 
{

   var html = '';
   var notshown = (gOptions[divId].colourScheme == 'frequencies') ? '' : ' notshown';
   html += "<div class='freqSlider" + notshown + "' id='"+divId+"FrequencyControls'>";
   html += "<div class='freqSliderLabel'>Frequencies </div>";
   html += "<div class='freqSliderLimits'>Lower limit: ";
   html += "<input value='"+opts.freqSlider1+"' name='"+divId+"fsMin' type='number' min='0' max='"+opts.freqMax+"' step='"+opts.freqStep+"' ";
   html += "id='"+controlDiv+"lowerlimit' class='freqSliderValue' /></div>";
   html += "<div class='freqSliderLimits'>Upper limit: ";
   html += "<input value='"+opts.freqSlider2+"' name='"+divId+"fsMax' type='number' min='0' max='"+opts.freqMax+"' step='"+opts.freqStep+"' ";
   html += "id='"+controlDiv+"upperlimit' class='freqSliderValue' /></div>";
   html += "<div class='freqSliderLimits' id='" + controlDiv + "slider'></div></div>";

   $('#' + controlDiv).append(html);

   printFrequencySlider(divId, controlDiv, opts);

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
Prints a single residue cell based on previous cell, colourscheme, consensuscell, etc.

@param {string} aa	       - the residue code to print
@param {string} prevAa	       - the previous residue code
@param {string} consensusClass - consensus class
@param {bool} isConsensus      - status of global isConsensus property
@param {bool} nocolour	       - status of global nocolour property
@param {bool} dotify	       - status of global dotify property
@param {string} colourScheme   -  current selected colour scheme
@param {string} pref           - prefix for formatting residue cell (transposed or otherwise)
@param {integer} freq          - residue's frequency value
@param {integer} slider1       - value of slider1
@param {integer} slider2       - value of slider2
@returns {string} html	       - HTML

@author
- 09.01.17 Original taken from JSAV_buildASequenceHTML By: JH
- 31.07.20 Added frequency value and slider limits for frequency colouring
*/

function printResidueCell(aa, prevAa, consensusClass, isConsensus, nocolour, dotify, colourScheme, pref, freq, slider1, slider2) 
{
   var colourClass = colourScheme + aa.toUpperCase();
        
   if ((colourScheme == 'frequencies') && (freq != undefined) && (slider1 != undefined)) 
   {
      colourClass = 'frequencyMed';
      if (freq <= slider1) 
      {
         colourClass = 'frequencyMin';
      }
      else if (freq > slider2)
      {
         colourClass = 'frequencyMax';
      }
   }

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
         {
            if(aa != '-') {aa = '.';}
         }
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
@param {array}    frequencies   Array of frequency values for the residues
@param {string}   prevSequence  A string containing the previous sequence
@param {bool}     isConsensus   This is the consensus sequence
@param {string}   idSubmit      URL to visit when sequence label clicked
@param {integer}  cc            Position for change from heavy to light chain
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
- 31.07.20 Added frequencies for call to printResidueCell By: JH
*/
function JSAV_buildASequenceHTML(divId, id, sequence, frequencies, prevSequence, isConsensus, idSubmit, cc)
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
      if (id == 'Consensus') 
      {
         consensusClass = " consensusCell";
      } 
      else 
      {
         consensusClass = " blastqueryCell";
      }
   }

   var pref;
   var nResidues = seqArray.length;
   var slider1 = (options.freqSlider1) ? options.freqSlider1 : undefined;
   var slider2 = (options.freqSlider2) ? options.freqSlider2 : undefined;
   for(var i=0; i<nResidues; i++) 
   {
      pref = '';
      if (i == cc) { pref = 'br_'; }
      var freq = undefined;
      if ((frequencies != undefined) && (options.labels != undefined))
      {
         freq = frequencies[options.labels[i]];
      }
      var prevAa = (prevSeqArray != undefined) ? prevSeqArray[i] : '#';   
      tableLine += printResidueCell(seqArray[i], prevAa, consensusClass, isConsensus, 
                                    options.nocolour, options.dotify, options.colourScheme, pref, freq, slider1, slider2);
      }
  
   tableLine += "</td><td class='rhcol'></td></tr>";
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

function JSAV_buildTypeLabel(labels) 
{

   var tableLine = "";
   tableLine += "<tr class='typeLabelRow'></td>";
   for (var l=0; l<labels.length; l++) 
      {
      var cellCol = (labels[l].substring(0,1) == 'L') ? "light-col" : "heavy-col";
      tableLine += "<td class='" + cellCol + "'></td>";
      }
   tableLine += "<td class='rhcol'></td></tr>";
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
   if (gOptions[divId].transpose) 
   {
      $(tag).html('');
   } 
   else 
   {
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

function printHighlightCell(highlight, i, pref) 
{
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
   var calcwidth = (sequences.length * 20) + 250;
   var tabwidth = calcwidth + 'px';
   $('#' + divId).css('width', tabwidth);

   html += "<div id='"+divId+"tr_outerseqtable' class='tr_outerseqtable'>";
   html += "<div class='tr_seqtable'>";
   html += "<table border='0'>\n";

   html += "<tr><th class='tr_labels tr_idCell rotate'><div>All/None</div></th>";
   if (options.selectable) html += "<td class='tr_highlightrow'></td>";
   for (var i=0;i<sequences.length;i++) 
   {
      if ((sequences[dispOrder[i]].displayrow) && numberedSequence(options.chainType, sequences[dispOrder[i]]))
      {
         var id = sequences[dispOrder[i]].id;
         if(options.idSubmit == null)
         {
            html += "<th class='tr_seqCell tr_idCell rotate'><div>" + id + "</div></th>";
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
            html += "<th class='tr_seqCell tr_idCell rotate'><div><a href='" + url + "'>" + id + "</a></div></th>";
         }
      }
   }
   if(options.consensus != undefined)
   {
      html += "<th class='tr_idCell rotate tr_consensusCell'><div>Consensus</div></th>";
   }
	
   if (options.selectable)
   {
      html += "<td class='tr_highlightrow'></td>";
   }
   html += '</tr>';

   // Create the selection button line
   if (options.selectable) 
   {
      html += JSAV_buildSelectAllHTML(divId, options.selectable, true, 'tr_labels');
      if (options.selectable) html += "<td class='tr_highlightrow'></td>";
      for (var i=0;i<sequences.length;i++)
      {
         if ((sequences[dispOrder[i]].displayrow) && numberedSequence(options.chainType, sequences[dispOrder[i]]))
         {
	    var name = "select_" + sequences[dispOrder[i]].id;
            var cname = name.replace(/\./g, "_").replace(/\//g, "_");
            html += "<td class='tr_seqCell tr_selectCell'><input class='selectBox "+cname+" tr_checkbox' type='checkbox' name='" + name; 
            html += "' onclick='JSAV_resetAllNone(\""+divId+"\", \""+cname+"\",this.checked);'/></td>";
         }
      }

      if(options.consensus != undefined)
      {
         html += "<td class='tr_seqCell tr_consensusCell'></td>";
      }

      if (options.selectable)
      {
         html += "<td class='tr_highlightrow'></td>";
      }
      html += '</tr>';
   }
	
   // Create transposed sequences
   html += "<tr class='topline'><td></td></tr>";

   for (var i=0;i<gSequenceLengths[divId];i++)
   {
      var toplineStr = (i==0) ? "topborder" : "";
      html += "<tr><th class='tr_labels idCell "+toplineStr+"'>"+options.labels[i]+"</th>";
      if (options.selectable) 
      {
         html += printHighlightCell(options.highlight, i, 'tr_highlightrow');
      }

      var prevAa = '#';
      var slider1 = (options.freqSlider1) ? options.freqSlider1 : undefined;
      var slider2 = (options.freqSlider2) ? options.freqSlider2 : undefined;
      for (var s=0; s<sequences.length; s++)
      {
         if ((sequences[dispOrder[s]].displayrow) && numberedSequence(options.chainType, sequences[dispOrder[s]]))
         {
            var label = options.labels[s];
            var freq = undefined;
            if (frequencies != undefined)
            {
               freq = sequences[dispOrder[s]].frequencies[options.labels[i]];
            }
            var aa = sequences[dispOrder[s]].sequence[i];
            html += printResidueCell(aa, prevAa, "", false, options.nocolour, options.dotify, 
                                     options.colourScheme, 'tr_', freq, slider1, slider2);
            prevAa = sequences[dispOrder[s]].sequence[i];
         }
      }
      if(options.consensus != undefined) 
      {
         var aa = gConsensus[divId][i];
         var prevAa = '#';
         html += printResidueCell(aa, prevAa, " tr_consensusCell", true, options.nocolour, options.dotify, 
                                  options.colourScheme, 'tr_', undefined, undefined, undefined);
      }
      if (options.selectable) 
      {
         html += printHighlightCell(options.highlight, i, 'tr_highlightrow');
      }
		
      html += "</tr>";
   }
   html += "</table>\n";
   html += "</div>\n";
   html += "</div>\n";
   html += "</div>\n";
   $('#'+divId+'tr_outerseqtable').css('direction','rtl');
   return(html);
}

// ----------------------------------------------------------------
/**
Builds the label for the sequence row

@param 		{string}	divId		ID of the div we're dealing with
@param 		{string}	attributeValue 	value of idSubmitAttribute for the id
@param 		{string}	id		sequence's id
@param 		{string}	idSubmit	text for submit values
@param          {string}        idSubmitKey     text for submit parameters
@param		{number}	colspan		number of table columns to span	
@param          {string}        bgcol           formatting class for the cell
@param          {string}        humanOrg        human organism option
@returns	{string}	html		HTML for the label

@author
- 23.03.17 Original By: JH
- 06.07.20 Fixed to recreate old default behaviour (i.e. the URL contains the ?key= part and
           appends the sequence unless keys and attributes are set)
*/

function JSAV_buildId(divId, attributeValue, id, idSubmit, idSubmitKey, colspan, bgcol, humanOrg) 
{

   var options = gOptions[divId];
   var html = "";

   if ((idSubmit == null) || (attributeValue == 'undefined'))
   {
      html += "<td colspan='" + colspan + "' class='" + bgcol + "'><div class='tooltip' title='" + id + "'>" + id + "</div></td>";
   }
   else
   {
      if(idSubmitKey == '')
      {
         var url = idSubmit;

         if(options.idSubmitClean)
         {
            // This would only normally be done in the default case where idSubmitAttribute is 'sequence'
            // It probably wouldn't make sense for IDs etc
            attributeValue = attributeValue.replace(/[^A-Za-z0-9]/g, '');
         }
         url += attributeValue;
      }
      else
      {
         var url = idSubmit;
         var seperator = '?';
         var attrArray = attributeValue.split(':');
         var keyArray = idSubmitKey.split(':');
         for (var a=0; a<attrArray.length; a++) 
         {
            var submitParam = attrArray[a];
            var submitKey = keyArray[a];
 
            if(options.idSubmitClean)
            {
               // This would only normally be done in the default case where idSubmitAttribute is 'sequence'
               // It probably wouldn't make sense for IDs etc
               submitParam = submitParam.replace(/[^A-Za-z0-9]/g, '');
            }
            url += seperator + submitKey + '=' + submitParam;
            seperator = '&';
         }
      }

      if (humanOrg) 
      {
         url += '&humanorganism='+humanOrg;
      }
      html += "<td colspan='" + colspan + "' class='" + bgcol + "'><a href='" + url + "'>" + id + "</a></td>";
   }

   return(html);
}

// ---------------------------------------------------------------------
/**
Returns true if the sequence is numbered

@param   {string}     chainType	  type of chain
@param   {object[]}   sequence    sequence object
@returns {boolean}                true if chain or either of the combined chains is numbered, otherwise returns false

@author 
- 15.10.17 Original  By: JH
*/

function numberedSequence(chainType, sequence)
{
   if (chainType == 'heavy') 
   {
      return (sequence.heavy_Numbered != 'N');
   } 
   else if (chainType == 'light') 
   {
      return (sequence.light_Numbered != 'N');
   } 
   else 
   {
      return ((sequence.light_Numbered != 'N') || (sequence.heavy_Numbered != 'N'));
   }
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
- 09.01.17 Added empty string format parameter to JSAV_buildSelectAllHTML 
		   Uses displayOrder to display sequences in sorted order	By: JH
- 07.04.20 Added blast query row if it exists By: JH
*/

function JSAV_buildSequencesHTML(divId, sequences)
{
   var options = gOptions[divId];
   var dispOrder = gDisplayOrder[divId];

   var html = "";
   html += "<div class='JSAV'>\n";

   //------------------ Header Columns --------------------------
   
   html += "<div class='header'><table border='0'>";
   html += "<tr><td class='idCell' colspan='10'>Kabat numbering and CDRs</td></tr><tr class='labelrow'>";
   var cc = chainChange(options.labels, options.autoLabels, divId);
   if (options.selectable)
   { 
      html += "<td class='idCell'>All/None</td>";
      html += JSAV_buildSelectAllHTML(divId, options.selectable, true, '');
   }
   else
   {
      html += "<td>&nbsp;</td><td class='selectCell'>&nbsp;</td>"; 
   }


   if(options.labels != undefined)
   {
      html += JSAV_buildLabelsHTML(divId,  gSequenceLengths[divId], options.labels, cc);
      html += "<td class='rhcol'></td>";
   }		
   html += "</tr>";

   if((options.labeltypecol != undefined) && (options.labels != undefined))
   {
      html += "<tr class='typeLabelRow'>";
      html += "<td></td><td></td>";
      html += JSAV_buildTypeLabel(options.labels);
      html += "</tr>";
   }

   if(options.highlight != undefined)
   {
      html += "<tr class='highlightrow'>";
      html += "<th class='idCell'>CDRs</th><td>&nbsp;</td>";
      html += JSAV_buildHighlightHTML(divId, gSequenceLengths[divId], options.selectable, options.highlight, cc);
      html += "</tr>";
   }

   if((options.blastaaquery != undefined) && (options.blastaaquery != ''))
   {
      html += "<tr class='tooltip blastqueryCell seqrow' title='This row shows the blast query sequence.'>";
      html += "<th class='idCell'>Query</th><th class='selectCell'>&nbsp;</th>";
      html += JSAV_buildASequenceHTML(divId, 'BlastQuery', options.blastaaquery, undefined, undefined, true, null, cc) + "\n";
      html += "</tr>";
   }

   html += "</table></div>";
   
   //---------------- Central Section ------------------------

   html += "<div class='outerseqtable'>";
   html += "<div class='seqtable'>";
   html += "<table border='0'>\n";

   var prevSequence = undefined;
   for(var i=0; i<sequences.length; i++) 
   {
      if(sequences[dispOrder[i]].displayrow != undefined)
      {
	 if ((sequences[dispOrder[i]].displayrow) && numberedSequence(options.chainType, sequences[dispOrder[i]]))
  	 {
	    html += "<tr class='seqrow' id='" + sequences[dispOrder[i]].id + "'>";

            var attrArray = options.idSubmitAttribute.split(':');
            var idSubmitAttr = '';
            for (var a=0; a<attrArray.length; a++)
               idSubmitAttr += sequences[dispOrder[i]][attrArray[a]] + ':';
            idSubmitAttr = idSubmitAttr.replace(/:$/,'');
     	    html += JSAV_buildId(divId, idSubmitAttr, sequences[dispOrder[i]].id, options.idSubmit, options.idSubmitKey, 1, 'idCell', options.humanOrganism) + "\n";
  	    var name = "select_" + sequences[dispOrder[i]].id;
	    var cname = name.replace(/\./g, "_").replace(/\//g, "_");
            html += "<th class='selectCell'>";
            html += (options.selectable) ? "<input class='"+cname+" selectBox' type='checkbox' name='" + name + "' onclick='JSAV_resetAllNone(\""+divId+"\",\""+cname+"\",this.checked);'/>" : "";
            html +="</th>";
            html += JSAV_buildASequenceHTML(divId, sequences[dispOrder[i]].id, sequences[dispOrder[i]].sequence, 
                                            sequences[dispOrder[i]].frequencies, prevSequence, false, options.idSubmit, cc) + "\n";
            prevSequence = sequences[dispOrder[i]].sequence;
            html += "</tr>";
  	 }
      }
   }
 
   html += "</table>";
   html += "</div>";
   html += "</div>";

   //------------ Footer section -----------------
   html += "<div class='footer'>";
   html += "<table border='0'>";
   if(options.consensus)
   {
      html += "<tr class='tooltip consensusCell seqrow' title='The consensus shows the most frequent amino acid. This is lower case if &le;50% of the  sequences have that residue.'>";
      html += "<th class='idCell'>Consensus</th><th class='selectCell'>&nbsp;</th>";
      html += JSAV_buildASequenceHTML(divId, 'Consensus', gConsensus[divId], undefined, undefined, true, null, cc) + "\n";
      html += "</tr>";
   }
   if(options.highlight != undefined)
   {
      html += "<tr class='highlightrow'>";
      html += "<th class='idCell'>CDRs</th><th class='selectCell'>&nbsp;</th>";
      html += JSAV_buildHighlightHTML(divId, gSequenceLengths[divId], options.selectable, options.highlight, cc);
      html += "</tr>";
   }
   if((options.labeltypecol != undefined) && (options.labels != undefined))
   {
      html += "<tr class='typeLabelRow'>";
      html += "<td></td><td></td>";
      html += JSAV_buildTypeLabel(options.labels);
      html += "</tr>";
   }

   if(options.sortable) 
   {
      html += "<tr class='tooltip markerrow' title='Select region for sorting - click here to reset sort region'>";
      html += "<th class='idCell' onclick='resetSortRegion(\""+divId+"\")';>Sort Region</th><th class='selectCell'>&nbsp;</th>";
      html += JSAV_buildMarkerHTML(divId, gSequenceLengths[divId], options.selectable);
      html += "</tr>";
   }

   html += "</table></div>";
   html += "</div>\n";
   seqtabWidth = ((gSequenceLengths[divId] * 9) + 165) + 'px';
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
function JSAV_buildSelectAllHTML(divId, selectable, displayContent, extraClass)
{

   var html = '';
   if (selectable) 
   {
      var id = divId + "_AllNone";
      var checked = ($('.' + id).prop('checked')) ? 'checked' : '';
      var content = (displayContent) ? "<input class='tooltop " + id + "' title='Select or deselect all sequences' type='checkbox' " + checked + " onclick='JSAV_selectAllOrNone(\"" + divId + "\",this.checked);' />" : '';
      html = "<td class='selectCell " + extraClass + "'>"+content+"</td>";
      gTableWidth[divId] += 20;
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

   //    html += "<tr class='tooltip markerrow' title='Select region for sorting'>";

   for(var i=0; i<seqLen; i++)
   {
      var id = divId + "_JSAVMarker" + i;
      var onmousedown = "setSortStart(\""+divId+"\", "+(i)+");";
      var onmouseover = "setSortRange(\""+divId+"\", "+i+");";
      html += "<td id='" + id + "' onmousedown='"+onmousedown+"' onmouseover='"+onmouseover+"'>&nbsp;</td>";
   }
   html += "<td class='rhcol'></td>\n";
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

function setSortStart(divId, i) 
{
	
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

function setSortRange(divId, i) 

{
   if (mouseState=="down") 
   {
      gStopPos[divId] = i+1;
      JSAV_showRange(divId);
   }
}

// ---------------------------------------------------------------------
/**
Resets sort region to full width

@author
- 15.09.17 Original By: JH
*/
function resetSortRegion(divId) 
{
   gStartPos[divId] = 1;
   gStopPos[divId] = gSequenceLengths[divId];
   JSAV_showRange(divId);
}

// ---------------------------------------------------------------------
/**
Initialises the global mouseState

@author
- 09.01.17 Original By: JH
*/

function mouseUpHandler() 
{
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
@param   {string}     divId       the divId we're dealing with

@author 
- 29.05.14 Original   By: ACRM
- 04.06.14 Added ignoreEnds (true) to JSAV_calcDifferenceMatrix() call
         Range version
- 04.09.17 Now writes new sort order to gDisplayOrder[divId]  By: JH
*/
function JSAV_sortSequences(sequences, start, stop, divId)
{
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
      gDisplayOrder[divId][i] = sortedIndexes[i];
   }
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
   JSAV_sortSequences(gSequences[divId], range[0], range[1], divId);
   resetDisplayColumn(gDisplayColumn[gOptions[divId].chaintype], gSequences[divId]);
   
   JSAV_refresh(divId, gSequences[divId], range[0], range[1]);

   // Record the fact that the display has been sorted
   gSorted[divId] = true;

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
   if (options.transpose) 
   {
      var html = JSAV_transposeSequencesHTML(divId, sequences)
   }
   else 
   {
      var html = JSAV_buildSequencesHTML(divId, sequences);
   }
									  
   var element = document.getElementById(divId + "_sortable");
   element.innerHTML = html;
   $('#' + divId + ' .seqtable').css('width', seqtabWidth);
   $('#' + divId + ' .outerseqtable').css('width', seqtabWidth);
   $('#' + divId + ' .header').css('width', seqtabWidth);
   $('#' + divId + ' .footer').css('width', seqtabWidth);

   if(options.border)
   {
      JSAV_modifyCSS(divId);
   }

   if (options.sortable)
   {	  
      JSAV_showRange(divId);
   }
   
   if(options.displaydatatable != undefined)
   {
      printDataTable(divId, sequences);						
   }

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
- 31.07.20 Added gSorted and gTableWidth By: JH
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
       gSorted		= Array();
       gTableWidth      = Array();
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
   return(['Taylor', 'Clustal', 'Zappo', 'HPhob']);
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
    var nDispSeqs = 0;
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
        nDispSeqs++;
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
        if(maxAA <= (nDispSeqs / 2))
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
                $( this ).dialog( "close" );
                $( this ).remove();
                callback(true);
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
Returns the position of the change from heavy to light chain - for combined sequences

@param {array}   labels     - array of residue labels ('H1',..)
@param {bool}    autoLabels - the autoLabels option
@param {string}  divId      - the divId we're dealing with
@returns {int}              - position of the change from heavy to light chain

@author 
- 18.06.17 Original   By: JH
*/

function chainChange(labels, autoLabels, divId) 
{

   if ((labels == undefined) || (autoLabels)) 
   {
      return gSequenceLengths[divId];
   } 
   else 
   {
      var res = labels.length;
      for (var i=0; i < labels.length-1; i++)
      if (labels[i].substring(0,1) != labels[i+1].substring(0,1)) 
         {
         res = i;
         }
      return res;
   }
}

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

function JSAV_buildLabelsHTML(divId,  seqLen, labels, cc)
{
   var html = "";
   var pref;
   var labelNumbers = "";
   for(var i=0; i<labels.length; i++)
   {
      pref = '';
      if (i == cc) { pref = 'br_'; }
      // Make a copy of the label and remove the chain label
      var cellCol = (labels[i].substring(0,1) == 'l') ? "light-txt" : "heavy-txt";
      var labelText = labels[i].replace(/^[A-Za-z]/g, '');
      var lastChar = labelText.substring(labelText.length-1,labelText.length);
      html += "<td class='"+pref+cellCol+"'>";
      if (lastChar == "0") 
      {
         labelNumbers = labelText;
      }
      if (labelNumbers.length > 0) 
      {
	 html += labelNumbers[0];
	 labelNumbers = labelNumbers.substring(1,labelNumbers.length)
      }
      html += "</td>";
   }
   html += "<td class='rhcol'></td></tr><tr class='labelrow'><td>&nbsp;</td><td>&nbsp;</td></td>";
   
   for(var i=0; i<labels.length; i++)
   {
      pref = '';
      if (i == cc) { pref = 'br_'; }
      var cellCol = (labels[i].substring(0,1) == 'l') ? "light-txt" : "heavy-txt";
      var labelText = labels[i].replace(/^[A-Za-z]/g, '');

      // Find the last character
      var lastChar = labelText.substring(labelText.length-1,labelText.length);

      // Open a table cell with the label as a tooltip
      html += "<td class='tooltip "+pref+cellCol+"' title='" + labels[i] + "'>";

      // Insert the appropriate character
      if (lastChar == "0")   // 0 - do a '|'
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
/**
Initialises dispOrder to initial sequence ordering

@param {object[]} sequences 	- array of sequence objects
@returns {int[]} dispOrder	- array of sequence elements in order of display

@author
- 09.01.17 Original By: JH
*/

function initDisplayOrder(sequences) 
{

   var dispOrder = [];
   for (var r=0; r<sequences.length; r++) 
   {
      dispOrder[r] = r;
   }

   return(dispOrder);
}

// -----------------------------------------------------------------
/**
Initialises dispColumn to default code 1 (unsorted) for each data table column (except sequence, displayrow, id and Chain id)

@param {string} divId		- divId we're dealing with
@param {object[]} sequences 	- array of sequence objects
@param {object} displayColumns  - original displayColumn object
@returns {int[]} dispColumn	- array of codes for indicating column sort status

@author
- 09.01.17 Original By: JH
- 20.03.19 Adapted to use underscore delimiter for grouping of column labels
*/

function initDisplayColumn(divId, sequences, displayColumns) 
{
	
   var stypes = ['heavy','light'];
   var dispColumn = {};
   for (var stype in stypes) 
   {
      for (var s=0; s<=sequences.length; s++) 
      {
         for (var key in sequences[s]) 
         {
	    if ((key != 'sequence') && (key != 'displayrow') && (key != 'id') && (key.substring(6) != 'Chain id')) 
            {
               var colheaders = key.split('_');
               var colname = '';
               for (k=2; k<colheaders.length; k++) 
               {
                  colname += colheaders[k] + '_';
               }
	       colname = colname.replace(/_+$/,'');
               colname = colname.trim();
               if (colheaders[0] == stypes[stype]) 
               {
      	          if (displayColumns && displayColumns.hasOwnProperty(key))
                  {
                     dispColumn[key] = displayColumns[key];
                  }
                  else if ( gOptions[divId].defaultVisibleColumns.indexOf(colname) >= 0 )
		  { 
                     dispColumn[key] = 1;
		  } 
                  else 
                  {
                     dispColumn[key] = 0;
                  }
               }
            }
	 }
      }
   }

  for (var term in gOptions[divId].searchTerms) 
  {
     for (var stype in stypes) 
     {
        for (var s=0; s<=sequences.length; s++) 
        {
           for (var key in sequences[s]) 
           {
              var colheaders = key.split('_');
              var colname = '';
              for (k=2; k<colheaders.length; k++) 
              {
                 colname += colheaders[k] + '';
              }
              colname = colname.trim();
	      if ((colname.toLowerCase() == term) || (term == 'simple')) 
              {
                 if (colheaders[0] == stypes[stype]) 
                 {
	            if ( sequences[s][key].toLowerCase().indexOf(gOptions[divId].searchTerms[term].toLowerCase()) >= 0 ) 
		    { 
      	               if (displayColumns && displayColumns.hasOwnProperty(key))
                       {
                          dispColumn[key] = displayColumns[key];
                       }
                       else
                       {
                          dispColumn[key] = 0; 
                       }
                    }
                 }
               }
            }
         }
      }
   }
   return(dispColumn);
}

// -----------------------------------------------------------------
// ------------------ Data Table Functions -------------------------
// -----------------------------------------------------------------
// -----------------------------------------------------------------
/**
Main function for printing the data table

@param {string} divId		- divId we're dealing with
@param {object[]} sequences 	- array of sequence objects

@author
- 09.01.17 Original By: JH
*/

function printDataTable(divId, sequences) 
{

   var options = gOptions[divId];
   var ctype = options.chainType;
   var dispOrder = gDisplayOrder[divId];
   var tableDiv = divId + '_Table';
   var outerTableDiv = tableDiv + 'Outer';
   var tableTag = "#" + tableDiv;
   var html = '';

   html += printToggleList(divId);
   html += "<div id='"+outerTableDiv+"'>";
   html += "<div class='header' style='padding-left:16px;'>";
   html += printTableHeader(divId, options.selectable);
   html += "</div>";
   html += "<div id='" + tableDiv + "_Outer' class='outertablebody'>";
   html += "<div id='" + tableDiv + "_Inner' class='innertablebody'>";
   html += "<table class='results' border='1' id='" + divId + "_tablebody'>";
   for (var s=0;s<sequences.length;s++)
   {
      html += printDataRow(divId, sequences[dispOrder[s]]);
   }
   html += '</table>';
   html += "</div></div></div>";
   html += "<div id='" + tableDiv + "_Controls' class='JSAVControls'>";
   html += "</div>";
   $("#" + tableDiv).html(html);

   if (options.hideable)
   {
      JSAV_ControlButton(divId, tableDiv + '_Controls', 'Hide selected sequences', 
                         options.hideLabel, '', 'Hide Sequences', 'JSAV_hideSelectedSequences("' + divId + '")');	
      JSAV_ControlButton(divId, tableDiv + '_Controls', 'Show hidden sequences', 
                         options.showallLabel, '', 'Show Hidden Sequences', 'JSAV_resetDisplayrow("' + divId + '")');	
   }

   if (options.exportable)
   {
      JSAV_ControlButton(divId, tableDiv + '_Controls', 'Export visible sequences to CSV', 
                         options.exportLabel, 'CSV', 'Export CSV', 'JSON2CSV("'+divId+'")');
      JSAV_ControlButton(divId, tableDiv + '_Controls', 'Export visible sequences to XML for Excel - your Excel must support XML import', 
                         options.exportLabel, 'Excel', 'Export Excel', 'JSON2XML("'+divId+'")');
   }
   $('#' + divId + "_tablebody").css('width',gTableWidth[divId]+6); 
   $('#' + tableDiv + "_Outer").css('width',gTableWidth[divId]+24); 
   $('#' + tableDiv + "_Inner").css('width',gTableWidth[divId]+8); 
   $("#" + outerTableDiv).css("width","98vw");
   $("#" + outerTableDiv).css("margin-left","0.5em");
   $("#" + outerTableDiv).css("overflow-x","auto");
}

// -----------------------------------------------------------------
/**
Returns true if column is not a main group for selection boxes

@param {string} col 		- column name
@returns                        - true of false

@author
- 09.01.20 Original By: JH
*/
function notColumnGroup(col) 
{

   var colGroups = ['General','PTMs','CDRs','Canonical Classes','Structural Environment','Modelled Structural Environment',
                   'Regions(Chothia definition)','Regions(AbM definition)','Regions(Kabat definition)','Regions(Contact definition)',
                   'Regions(IMGT definition)','Positions','Blast'];
   return (colGroups.indexOf(col) == -1) ? true : false;

}

// -----------------------------------------------------------------
/**
Replaces key with suitable format with underscore separating chain type, groupings and rows
e.g. heavy_General_Data Source, heavy_CDRs_H1_CDR, or heavy__MyData

@param {string} divId 		- the divId we're dealing with
@param {array} sequences        - sequence array

@author
- 09.01.20 Original By: JH
*/
function tidySequences(divId, sequences) 
{

   var section;
   var stypes = ['heavy','light'];
   for (var s=0;s<sequences.length;s++) 
   {
      for (var key in sequences[s]) 
      {
         var row = key.split('_');
         var newkey = key;
         section = (stypes.includes(row[0])) ? 1 : 0;
         if ((row[section]) && (row[section] != 'Chain id') && (row[section] != 'sequence') && (row[section] != 'id') && (row[section] != 'frequencies'))
         {
            if (notColumnGroup(row[section]))
            {
               newkey = key.replace(row[section],'_' + row[section]);
            }
         }
         if ((row[section]) && (row[section] != 'sequence') && (row[section] != 'id') && (row[section] != 'frequencies'))
         {
            if (!stypes.includes(row[0])) 
            {
               newkey = 'heavy_' + newkey;
            }
         }
         if (newkey != key) 
         {
            sequences[s][newkey] = sequences[s][key];
            delete sequences[s][key];
         }
      }
   }
}

// -----------------------------------------------------------------
/**
resets displayColumn to default code 1 (unsorted) for each data table column (except sequence, displayrow, id and Chain id)

@param {object[]} sequences 		- array of sequence objects
@param {int[]} displayColumn		- array of codes for indicating column sort status

@author
- 09.01.17 Original By: JH
*/

function resetDisplayColumn(displayColumn, sequences) 
{
   for (var key in displayColumn) 
   {
      if ((key != 'sequence') && (key != 'displayrow') && (key != 'id') && (key.substring(6) != 'Chain id'))
      {
	 if (displayColumn[key] >0)
         {
	    displayColumn[key] = 1;
         }
      }
   }
}

// -----------------------------------------------------------------
/**
Compares the hiVal and colVal to return a comparative value -1, 0 or 1 

@param {integer} colVal - the divId we're dealing with
@param {integer} hiVal	- the sort direction
@param {bool} numeric	- name of the column on which the sort is based

@author
- 09.01.17 Original By: JH
*/

function compareVals(colVal, hiVal, numeric) 
{
   if (numeric) 
   {
      if (Number(colVal) > Number(hiVal))
         return 1;
      else if (Number(colVal) < Number(hiVal))
         return -1;
      else return 0;
   } 
   else 
   {
      if (colVal > hiVal)
         return 1; 
      else if (colVal < hiVal)
         return -1;
      else return 0;
   }
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
function DT_sortColumn(divId, direction, colName) 
{
   var options = gOptions[divId];
   var sequence = gSequences[divId];
   var numeric = true;	
   var idxFree = [];
   var hV = -1;
   gStartPos[divId] = 1;
   gStopPos[divId] = gSequenceLengths[divId];

   for (var r1=0; r1<sequence.length; r1++) 
   {
      idxFree[r1] = true;
      if (isNaN(sequence[r1][colName])) 
      {
         hV = ''; 
         numeric = false;
      }
   }
   if (direction == 'asc') 
   {
      for (var r1=sequence.length-1; r1>=0; r1--) 
      {
         var hiVal = hV;
         var idx = 0;
         for (var r2=0; r2<sequence.length; r2++)
         {
            if (idxFree[r2]) 
            {
               if (compareVals(sequence[r2][colName], hiVal, numeric) >=0 ) 
               {
                  hiVal = sequence[r2][colName];
                  idx = r2;
               }
            }
         }
         idxFree[idx] = false;
         gDisplayOrder[divId][r1] = idx;
      }
   gDisplayColumn[gOptions[divId].chainType][colName] = 2;
   } 
   else 
   {
      for (var r1=0; r1<sequence.length; r1++) 
      {
         var hiVal = hV;
         var idx = 0;
         for (var r2=0; r2<sequence.length; r2++)
         {
            if (idxFree[r2]) 
            {
               if (compareVals(sequence[r2][colName], hiVal, numeric) >0) 
               {
                  hiVal = sequence[r2][colName];
                  idx = r2;
               }
            }
         }
         idxFree[idx] = false;
         gDisplayOrder[divId][r1] = idx;
      }
      gDisplayColumn[gOptions[divId].chainType][colName] = 3;
   }

   for (var key in gDisplayColumn[gOptions[divId].chainType])
   {
      if ((key != colName) && (gDisplayColumn[gOptions[divId].chainType][key] != 0))
      {
         gDisplayColumn[gOptions[divId].chainType][key] = 1;
      }
   }

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

function DT_toggleColumn(divId, colName) 
{
   if (gDisplayColumn[gOptions[divId].chainType][colName]) 
   {
      gDisplayColumn[gOptions[divId].chainType][colName] = 0;
   }
   else 
   {
      gDisplayColumn[gOptions[divId].chainType][colName] = 1;
   }
   printDataTable(divId, gSequences[divId]);		
}


// -----------------------------------------------------------------
/**
Prints the toggle list - the buttons for redisplaying columns where display is toggled off

@param {string} divId 		- divId we're dealing with
@returns {string} html		- HTML

@author
- 09.01.17 Original By: JH
- 20.08.19 Changed to include groupings for separate selection boxes
*/
function printToggleList(divId) 
{

   // Create the list of groups which will each generate a selection box
   var stypes = ['heavy','light'];
   var html = '';
   var grpList = [];
   var hiddenGroups = 0;
   for (var stype in stypes)
   {
      for (var key in gDisplayColumn[gOptions[divId].chainType]) 
      {
         if (gDisplayColumn[gOptions[divId].chainType][key] == false) 
         {
            hiddenGroups = 1;
            var keyList = key.split('_');
            if (keyList[0] == stypes[stype]) 
            {
               var grpGroup = keyList[0] + '_' + keyList[1];
               if (grpList.indexOf(grpGroup) == -1) 
               {
       	          grpList.push(grpGroup);
               }
            }
         }
      }
   }

   // For each group, create a selection box and add, as options, the column headers which are not displayed in the table
   for (var i=0; i<grpList.length; i++) 
   {
      var grpType = grpList[i].split('_');
      html += "<select class='toggle-col-list " + grpType[0] + "button' onchange='DT_toggleColumn(\"" + divId + "\",this.value);'>";
      var gTitle = (grpType[1] == '') ? 'Select' : grpType[1];
      html += "<option style='display:none;' disabled='disabled' selected='selected'>" + gTitle + "</option> ";
      for (var key in gDisplayColumn[gOptions[divId].chainType]) 
      {
         if (gDisplayColumn[gOptions[divId].chainType][key] == false) 
         {
            var keyList = key.split('_');
            if (grpList[i] == (keyList[0] + '_' + keyList[1])) 
            {
               var keyText = '';
               for (var k=2; k<keyList.length; k++) 
               {
                  keyText += keyList[k] + ' ';
               }
	       keyText = keyText.trim();
               var desc = keyText;
               if (gOptions[divId].ptmLabels)
               {
                  desc = (gOptions[divId].ptmLabels.hasOwnProperty(keyText)) ? gOptions[divId].ptmLabels[keyText] : keyText;
               }
               html += "<option class='tooltip' title='Show "+desc+"' value='"+key+"'>"+keyText+"</option>";
            }
         }
      }
      html += "</select>";
   }
   var divHtml = "<div class='toggle-col-list'";
   if (!hiddenGroups)  divHtml += " style='display:none'";
   divHtml += ">Show hidden columns: ";

   html += '</div>';
   return(divHtml + html);
}

// -----------------------------------------------------------------
/**
Prints the header for the table columns. Top line is the 'hide' icon, to toggle the column display to off.
Second line is the Name and the sort icon, based on the respective field in gDisplayColumn.

@param {string} divId 		- divId we're dealing with
@param {bool} selectable	- global options selectable variable
@returns {string} html		- HTML

@author
- 09.01.17 Original By: JH
- 20.08.19 Changed to include groupings
*/

function printTableHeader(divId, selectable) 
{
   var html = "<table class='results' border='1' id='" + divId + "_tablehead'>";

   var options = gOptions[divId];

   // Deduce number of column header rows (includes chainType and group for selection box, so actual rows + 2) 
   var maxrows = 0;
   for (var key in gDisplayColumn[options.chainType]) 
   {
      if (gDisplayColumn[options.chainType][key]) 
      {		
	 var numrows = key.split('_');
         if (numrows.length > maxrows) maxrows = numrows.length;
      }
   }

   // Build header row by row
   for (var row=0; row<maxrows; row++) 
   {
      html += "<tr>";
      gTableWidth[divId] = 120;

      // Build selectAll checkbox cell and ID header cell
      if (row > 0) 
      {
         var bgcol = (options.chainType == 'combined') ? 'heavy-col' : options.chainType+'-col';
         html += JSAV_buildSelectAllHTML(divId, selectable, (row==(maxrows-1)), 'lrborderheader '+bgcol);
	 html += "<th class='idCell " +bgcol+ "'>";
	 if (row==2) html += "ID";
	 html += "</th>";
      }

      var colspan = 3;
      var rowstart = true;
      var lastcell = "";
      var lasthtml = "";

      // Build each row cell for the column 
      for (var key in gDisplayColumn[options.chainType]) 
      {
         if (gDisplayColumn[options.chainType][key]) 
         {
            // colName is the cell name minus the chainType and group label, colheaders is the text for each row
            var colheaders = key.split('_');
            var colheader = "";
            var colName = '';
            for (var k=2; k<colheaders.length; k++) 
            {
               colName += colheaders[k] + ' ';
            }
	    colName = colName.trim();
	    var colClass = colheaders[0]+"-col";

            // colDesc is the column text for the tooltip (colName except for PTMS)
            var colDesc = colName;
            if (options.ptmLabels) 
            {
               colDesc = (options.ptmLabels.hasOwnProperty(colName)) ? options.ptmLabels[colName] : colName;
            }

            // Set column width and add this to the table width
            var colWidth = 50;
            if (options.formattedCols)
            {
               colWidth = (colName in options.formattedCols) ? options.formattedCols[colName] : 50;
            }
            gTableWidth[divId] += (colWidth + 40);
	    for (var r=0;r<=row;r++)
            {
	       colheader += colheaders[r];
            }
 
            // colspan increases if the column header for the row does not change 
            var htmlcell = "";
	    if (colheader == lastcell) 
            {
	       colspan +=3;
	    }
            else
            {
	       colspan = 3;
	    }

            // Build the cell
            if (row==0) 
            {
               var seqtype = colheaders[0]; // does nothing as this is the chainType row
            }
            else if (row==colheaders.length-1) 
            {
            // The last row of the column - includes the hide and sort icons
	       switch (gDisplayColumn[options.chainType][key]) 
               { 
                   case 2: var icon = options.sortDownLabel;
		      var textLbl = options.sortDownText;
                      var direction = "desc";
                      break;
                   case 3: var icon = options.sortUpLabel;
                      var textLbl = options.sortUpText;
                      var direction = "asc";
                      break;
                   default: var icon = options.sortBothLabel;
                      var textLbl = options.sortBothText;
                      var direction = "asc";
               }

               var toggleclick = "onclick='DT_toggleColumn(\"" + divId + "\", \"" + key + "\");'";
	       var sortclick = "onclick='DT_sortColumn(\"" + divId + "\", \"" + direction + "\", \"" + key + "\");'";
	       htmlcell += "<th class='"+colClass+" headerHide'>";
               htmlcell += "<div "+toggleclick+"><i class='"+options.hideLabel+" fa-inverse tooltip' title='Hide Column "+colDesc+"'>";
               htmlcell += "</i>"+options.hideText+"</div></th>";
               htmlcell += "<th class='"+colClass+" headerText' style='min-width:"+colWidth+"px;max-width:"+colWidth+"px;'>";
               htmlcell += "<div class='truncated tooltip' title='"+colDesc+"'>" + colheaders[row] + "</div></th>";
               htmlcell += "<th class='"+colClass+" headerSort'>";
               if (options.sortable)
               {
                  htmlcell += "<div "+sortclick+"><i class='"+icon+" fa-inverse fa-lg tooltip' title='Sort Column "+colName+"'></i>"+textLbl+"<div>";
               }
               htmlcell += "</th>";
	    } 
            else 
            {
            // non-last row cell - may be multiple column, so set the column width accordingly (colSpread)
               if (row < colheaders.length-1)
               {
                  var colSpread = ((colWidth * colspan)/3);
               }
               else
               {
                  var colSpread = colWidth;
               }
               htmlcell += "<th class='lrborderheader "+colClass+"' colspan="+colspan+" style='width:"+colSpread+"px;'>";
               htmlcell += "<div class='truncated'>";
               if (row < colheaders.length) htmlcell += colheaders[row]; 
               htmlcell += "</div></th>";
            }

            // Need to read ahead as first column has no lasthtml. 
            // We actuall write the lasthtml (previous column) and add the final lasthtml at the end.
            if (rowstart) 
            {
               rowstart = false;
	    } 
            else if (colheader != lastcell) 
            {
               html += lasthtml;
            }

	    lasthtml = htmlcell;
	    lastcell = colheader;
         }
      }
      html += lasthtml + "</tr>";
   }
   html += "</table>";
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
- 28.07.20 Removed use of accession for link - now used id
*/

function printDataRow(divId, sequence) 
{
   var options = gOptions[divId];
   var html = "";

   if (sequence.displayrow) 
   {
      html += "<tr id = 'table_" + sequence.id + "'>";

      // Add the initial select row checkbox cell. It's name is 'select_' and the id with decimal points and underscores removed.
      if (options.selectable)
      {
         var name = "select_" + sequence.id;
         var cname = name.replace(/\./g, "_").replace(/\//g, "_");
         var checked = ($('.' + cname).prop('checked')) ? 'checked' : '';
         var onclick = "onclick='JSAV_resetAllNone(\""+divId+"\",\""+cname+"\",this.checked);'";
         html += "<td><input class='"+cname+" selectBox' type='checkbox' name='" + name + "' " + checked + " " + onclick + "/></td>";
      }
   
      // Build the id cell
      var attrArray = options.idSubmitAttribute.split(':');
      var idSubmitAttr = '';
      for (var a=0; a<attrArray.length; a++)
      {
         idSubmitAttr += sequence[attrArray[a]] + ':';
      }
      idSubmitAttr = idSubmitAttr.replace(/:$/,'');
      html += JSAV_buildId(divId, idSubmitAttr, sequence.id, options.idSubmit, options.idSubmitKey, 1, 'idCell', options.humanOrganism) + "\n";

      // Build the data cells
      for (var key in gDisplayColumn[gOptions[divId].chainType])
      {
         if (gDisplayColumn[gOptions[divId].chainType][key])
	 {
            // colName is the cell name minus the chainType and group label, colheaders is the text for each row
            var colheaders = key.split('_');
            var colName = '';
            for (var k=2; k<colheaders.length; k++) 
               colName += colheaders[k] + ' ';
	    colName = colName.trim();

            // Set column width and lower-case Colname based on the formattedCols object
            var lcColName = 'other';
            var colWidth = 90;
            if (options.formattedCols) 
            {
               lcColname = (colName in options.formattedCols) ? colName.toLowerCase() : 'other';
               colWidth = (colName in options.formattedCols) ? (options.formattedCols[colName] + 40) : 90;
            }

            // Add feint class if sequence not matched.
	    var matchcol = colheaders[0] + '_Numbered';
            var feint = (sequence[matchcol] == 'N') ? ' feint' : '';

            // Build the cell (or empty cell if no data)
 	    if (typeof(sequence[key]) == 'undefined') 
            {
               html += "<td></td>";
	    } 
            else 
            {                     
               var cellText = sequence[key];

               // Check search terms as, if found in the cellText, the word will be upper-cased and highlighted
               for (var term in options.searchTerms) 
               {
                  if (( term == 'simple')  || (colName.toLowerCase() == term) ) 
                  {
                     var re = new RegExp(options.searchTerms[term], 'i');
                     if (sequence[key].search(re) != -1) 
                     {
                        var cellArr = sequence[key].replace(/\>/g,'> ').split(' ');
                        cellText = '';
                        for (var c=0; c<cellArr.length; c++) 
                        {
                           var cellWord = cellArr[c] + ' ';
                           if (cellWord.search(re) != -1) 
                              {
                                 cellWord = "<span class='highlightmatch'>"+cellWord.toUpperCase()+"</span>"
                              }
                           cellText += cellWord;
                        }
                     }
                  }
               }

               // Write the cell
	       html += "<td class='bodyText' style='min-width:"+colWidth+"px;max-width:"+colWidth+"px;'><div class='wwrap " + lcColName + feint + "'>";
               html += decodeURIComponent(cellText) + "</div></td>";
            }
	 }
      }
      html += "</tr>";
   }
   return(html);
}

// -----------------------------------------------------------------
/**
Export sequences to CSV file
@param {string} divId	- divId we're dealing with

@author
- 22.05.17 Original By : JH
*/

function JSON2CSV(divId) 
{
   var sequence = gSequences[divId];
   var dispOrder = gDisplayOrder[divId];
   var CSV = '';
   var row = '';
   var columns = [];
   columns['heavy'] = new Array();
   columns['light'] = new Array();
   for (var s in sequence[0]) 
   {
      if (gDisplayColumn[gOptions[divId].chainType][s]) 
      {
          if ((columns[s.substring(0,5)].indexOf('id')) == -1)
          { 
             columns[s.substring(0,5)].push('id');
          }
	  columns[s.substring(0,5)].push(s);
      }
   }
   for (var t in columns)
   { 
      if (columns[t].length > 0) 
      {
         row += '"' + t.toUpperCase() + '",';
         for (var d=1; d<columns[t].length; d++)
            row += ",";
      }
   }
   CSV += row.slice(0,-1) + '\r\n';
   row = '';
   for (var t in columns) 
   {
      for (var c=0; c<columns[t].length; c++)
      {
	 row += columns[t][c].substring(6) + ',';
      }
   }
   
   for (var s=0; s<gOptions[divId].labels.length; s++) 
   {
      row += gOptions[divId].labels[s] + ',';
   }

   CSV += row.slice(0,-1) + '\r\n';

   for (var i=0; i<sequence.length; i++) 
   {
      if (sequence[dispOrder[i]].displayrow) 
      {
         row = '';
	 for (var t in columns) 
         {
            for (var c=0; c<columns[t].length; c++) 
            {
               if (sequence[dispOrder[i]][columns[t][c]] == undefined) 
               {
	          row += ',';
               } 
               else 
               {
                   row += '"' + sequence[dispOrder[i]][columns[t][c]] + '",';
	       }
            }
	 }

         for (var s=0; s<sequence[dispOrder[i]].sequence.length; s++) 
         {
            row += sequence[dispOrder[i]].sequence[s] + ',';
         }
	 CSV += row.slice(0,-1) + '\r\n';
      }
   }

   if (CSV == '') 
   {
      alert("Invalid data");
      return;
   }
   var link = document.createElement("a");
   var browser = window.navigator.userAgent;
   var appStr = 'data:text/csv;charset=utf-8';
   var fileName = "JSAV_Export.csv";
   if((browser.indexOf('MSIE ') > 0) || (browser.indexOf('Trident/') > 0) || (browser.indexOf('Edge/') > 0)) 
   { 
      var blob = new Blob([CSV], {type: appStr });
      window.navigator.msSaveBlob(blob, fileName);
   }
   else
   {
      link.href = appStr + ',' + encodeURIComponent(CSV);
      link.style = "visibility:hidden";
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
   }
}


// -----------------------------------------------------------------
/**
Export sequences to XML file
@param {string} divId	- divId we're dealing with

@author
- 2.08.17 Original By : JH
*/

function JSON2XML(divId) 
{
   var sequence = gSequences[divId];
   var dispOrder = gDisplayOrder[divId];
   var options = gOptions[divId];
   var columns = [];
   var dnaColumn = 0;

   columns['combined'] = new Array();
   columns['heavy'] = new Array();
   columns['light'] = new Array();

   var XML = '<?xml version="1.0"?>\r\n<?mso-application progid="Excel.Sheet"?>\r\n';
   XML += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"\r\nxmlns:o="urn:schemas-microsoft-con:office:office"\r\n';
   XML += 'xmlns:x="urn:schemas-microsoft-com:office:excel"\r\nxmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"\r\n';
   XML += 'xmlns:html="http://www.w3.org/TR/REC-html40">\r\n';
   XML += '<DocumentProperties xmlns="urn:schemas-microsoft-com:office:office"></DocumentProperties>\r\n';
   XML += '<ExcelWorkbook xmlns="urn:schemas-microsoft-com:office:excel"></ExcelWorkbook>\r\n';
   XML += '<Styles>\r\n <Style ss:ID="columnHeader">';
   XML += '  <Alignment ss:Horizontal="Center"/>\r\n';
   XML += '  <Font ss:Bold="1"/>\r\n';
   XML += ' </Style>\r\n';

   if (typeof(aaColours) !== 'undefined') 
   {
      for (var c in aaColours[options.colourScheme]) 
      {
         XML += ' <Style ss:ID="'+ c + '">';
         XML += '  <Interior ss:Color="' + aaColours[options.colourScheme][c] + '" ss:Pattern="Solid" />';
         XML += ' </Style>\r\n';
      }
   }

   XML += ' <Style ss:ID="heavy">';
   XML += '  <Interior ss:Color="#666666" ss:Pattern="Solid" />';
   XML += ' </Style>\r\n';
   XML += ' <Style ss:ID="light">';
   XML += '  <Interior ss:Color="#999999" ss:Pattern="Solid" />';
   XML += ' </Style>\r\n';
   XML += ' <Style ss:ID="courier">';
   XML += '  <Font ss:FontName="Courier" x:Family="Swiss" />';
   XML += ' </Style>\r\n';
   XML += '</Styles>\r\n';
   XML += '<Worksheet ss:Name="Annotated Alignment">\r\n<Table x:FullColumns="1" x:FullRows="1" ss:DefaultRowHeight="15">\r\n';


   // Column definitions
   // Set datatable column widths
   var chainId = Array();
   for (var s in sequence[0]) 
   {
      if (s.substring(6) == 'General_Dna')
      {
         dnaColumn = 1;
      }
      var ctype = gOptions[divId].chainType;
      if (gDisplayColumn[ctype][s]) 
      {
         if (chainId.indexOf(ctype) == -1)
         {
            chainId.push(ctype);
            XML += '  <Column ss:AutoFitWidth="0" ss:Width="100"/>\r\n';
            columns[ctype].push('id');
         }
         XML += '  <Column ss:AutoFitWidth="0" ss:Width="'+(s.length*4)+'"/>\r\n';
	 columns[s.substring(0,5)].push(s);
      }
   }

   // Set residue column widths
   for (var s=0; s<sequence[0].sequence.length; s++) 
   {
      XML += '  <Column ss:AutoFitWidth="0" ss:Width="15.0"/>\r\n';
   }


   XML += '<Row ss:StyleID="columnHeader">\r\n';

   // Column Headers
   // Datatable chain type header row
   for (var t in columns) 
   {
      var cellStyle = '';
      if ((t == 'heavy') || (t =='light')) cellStyle = ' ss:StyleID="' + t + '" ss:MergeAcross="' + (columns[t].length-1) + '"';
      if (columns[t].length > 0) 
      {
         XML += '  <Cell ' + cellStyle  + '><Data ss:Type="String">' + t.toUpperCase();
        XML += '</Data></Cell>\r\n';
      }
   }
   XML += '</Row>\r\n';
   XML += '<Row ss:StyleID="columnHeader">\r\n';

   // Datatable column headers
   for (var t in columns) 
   {
      var cellStyle = '';
      if ((t == 'heavy') || (t =='light')) cellStyle = ' ss:StyleID="' + t + '"';
      for (var c=0; c<columns[t].length; c++)
      {
	 XML += '  <Cell ' + cellStyle + '><Data ss:Type="String">' + columns[t][c].substring(6) + '</Data></Cell>\r\n';
      }
   }

   // Residue labels header
   if(options.labels != undefined)
   {
      for (var s=0; s<options.labels.length; s++) 
      {
         XML += '  <Cell><Data ss:Type="String">' + options.labels[s] + '</Data></Cell>\r\n';
      }
   }
   XML += '</Row>\r\n';

   // Table cells
   if((gOptions[divId].blastaaquery != undefined) && (gOptions[divId].blastaaquery != ''))
   {
      row = '<Row>\r\n';
      row += '  <Cell><Data ss:Type="String">Blast Query</Data></Cell>\r\n';
      for (var t in columns) 
      {
         for (var c=1; c<columns[t].length; c++) 
         {
	    row += '  <Cell><Data ss:Type="String"> </Data></Cell>\r\n';
         }
      }
      var blastArray = gOptions[divId].blastaaquery.split("");
      for (var s=0; s<blastArray.length; s++) 
         {
            row += '  <Cell';
            var r = blastArray[s];
	    if ((typeof(aaColours) !== 'undefined') && (aaColours[gOptions[divId].colourScheme].hasOwnProperty(r)))
            {
               row += ' ss:StyleID="' + r + '"';
            }
	    row += '><Data ss:Type="String">' + r + '</Data></Cell>\r\n';          
         }
      row += '</Row>\r\n';
      XML += row;
   }

   for (var i=0; i<sequence.length; i++) 
   {
      if (sequence[dispOrder[i]].displayrow) 
      {
         row = '<Row>\r\n';
	 for (var t in columns) 
         {
            for (var c=0; c<columns[t].length; c++) 
            {
               if (sequence[dispOrder[i]][columns[t][c]] == undefined) 
               {
	          row += '  <Cell><Data ss:Type="String"> </Data></Cell>\r\n';
               } 
               else 
               {
                  row += '  <Cell><Data ss:Type="String">' + sequence[dispOrder[i]][columns[t][c]] + '</Data></Cell>\r\n';
	       }
            }
	 }

         for (var s=0; s<sequence[dispOrder[i]].sequence.length; s++) 
         {
            row += '  <Cell';
            var r = sequence[dispOrder[i]].sequence[s];
	    if ((typeof(aaColours) !== 'undefined') && (options.colourScheme !== 'frequencies') && (aaColours[options.colourScheme].hasOwnProperty(r)))
               {
                  row += ' ss:StyleID="' + r + '"';
               }
	    row += '><Data ss:Type="String">' + r + '</Data></Cell>\r\n';          
         }
         row += '</Row>';
	 XML += row;
      }
   }

   XML += '</Table></Worksheet>';
   // CDR Region worksheet
   if (options.regionTypes)
   {
      XML += '<Worksheet ss:Name="Regions">\r\n<Table x:FullColumns="1" x:FullRows="1" ss:DefaultRowHeight="15">\r\n';

      var intoCDR = 0;
      var newHighlight = [];
      for (h=0; h<options.highlight.length; h++) 
      {
        newHighlight[h] = options.highlight[h] + intoCDR -1; 
        intoCDR = (intoCDR == 1) ? 0 : 1;
      }

      // Column definitions
      XML += '  <Column ss:AutoFitWidth="0" ss:Width="100.0"/>\r\n';
      for (c=0;c<newHighlight.length;c++)
      {
         var colWidth = (c == 0) ? (newHighlight[0] * 10) : ((newHighlight[c] - newHighlight[c-1]) * 10);
         XML += '  <Column ss:AutoFitWidth="0" ss:Width="' + colWidth + '"/>\r\n';
      }
      XML += '  <Column ss:AutoFitWidth="0" ss:Width="100.0"/>\r\n';
      XML += '  <Column ss:AutoFitWidth="0" ss:Width="200.0"/>\r\n';
      if (dnaColumn)
      {
         XML += '  <Column ss:AutoFitWidth="0" ss:Width="400.0"/>\r\n';
      }

      // Headers
      row = '<Row>\r\n';
      row += '  <Cell><Data ss:Type="String"> </Data></Cell>\r\n';
      for (r=0; r<options.regionTypes.length; r++)
      {
         row += '  <Cell><Data ss:Type="String">' + options.regionTypes[r] + '</Data></Cell>\r\n';
      }
      row += '  <Cell><Data ss:Type="String">SEQUENCE</Data></Cell>\r\n';
      if (dnaColumn)
      {
         row += '  <Cell><Data ss:Type="String">DNA</Data></Cell>\r\n';
      }
      row += '</Row>';
      XML += row;

      // Table cells
      var dispStr = '';
      for (var i=0; i<sequence.length; i++) 
      {
         if (sequence[dispOrder[i]].displayrow) 
         {
            row = '<Row>\r\n';
            row += '  <Cell><Data ss:Type="String">' + sequence[dispOrder[i]].id + '</Data></Cell>\r\n';
            for (var s=0; s<sequence[dispOrder[i]].sequence.length; s++) 
            {
               dispStr += sequence[dispOrder[i]].sequence[s];
               if (newHighlight.indexOf(s) != -1)
               {
                  row += '  <Cell ss:StyleID="courier"><Data ss:Type="String">' + dispStr.replace(/-/g,"") + '</Data></Cell>\r\n';          
                  dispStr = '';
               }
            }
            row += '  <Cell ss:StyleID="courier"><Data ss:Type="String">' + dispStr.replace(/-/g,"") + '</Data></Cell>\r\n'; 
            row += '  <Cell ss:StyleID="courier"><Data ss:Type="String">' + sequence[dispOrder[i]].sequence.replace(/-/g,"") + '</Data></Cell>\r\n'; 
            if (dnaColumn)
            {
               var dna = '';
               if (sequence[dispOrder[i]].hasOwnProperty('heavy_General_Dna'))
                  dna += sequence[dispOrder[i]]['heavy_General_Dna'];
               if (sequence[dispOrder[i]].hasOwnProperty('light_General_Dna'))
                  dna += sequence[dispOrder[i]]['light_General_Dna'];
               row += '  <Cell ss:StyleID="courier"><Data ss:Type="String">' + dna + '</Data></Cell>\r\n';
            }
            row += '</Row>';
	    XML += row;
         }
      }
      XML += '</Table></Worksheet>';
   }

   XML += '</Workbook>';
   if (XML == '') 
   {
      alert("Invalid data");
      return;
   }
   var link = document.createElement("a");
   var browser = window.navigator.userAgent;
   var appStr = 'data:application/xml;charset=utf-8';
   var fileName = gOptions[divId].chainType.charAt(0).toUpperCase() + gOptions[divId].chainType.slice(1) + "_Chain_Alignment.xml";
   if((browser.indexOf('MSIE ') > 0) || (browser.indexOf('Trident/') > 0) || (browser.indexOf('Edge/') > 0)) 
   { 
      var blob = new Blob([XML], {type: appStr });
      window.navigator.msSaveBlob(blob, fileName);
   }
   else
   {
      link.href = appStr + ',' + encodeURIComponent(XML);
      link.style = "visibility:hidden";
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
   }
}


// --------------------- END OF FILE ------------------------------------/
