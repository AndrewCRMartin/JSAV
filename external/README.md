External Files
==============

Files in this directory are not part of JSAV and are provided merely for convenience.

The following are required for JSAV to work
-------------------------------------------

- JQuery is available from http://www.jquery.com/
- JQuery UI is available from http://www.jqueryui.com/

Your HTML should import these with:

    <link href="external/jquery.css" rel="stylesheet" />
    <script type='text/javascript' src='external/jquery-1.10.2.min.js'></script>
    <script type='text/javascript' src='external/jquery-ui-1.10.4.custom.min.js'></script>


The following is optional
-------------------------
Tooltipster provides much more attractive tooltips

- Tooltipster is available from http://iamceege.github.io/tooltipster/

To use this, your HTML should include:

    <link href="external/tooltipster-master/css/tooltipster.css" rel="stylesheet" />
    <script type='text/javascript' src='external/tooltipster-master/js/jquery.tooltipster.min.js'></script>
    <script>
    function enableTooltipster()
    {
        $(document).ready(function() {
            $('.tooltip').tooltipster();
        });
    }
    enableTooltipster();
    </script>

and your options for JSAV should include:

```javascript
    options.callback = "enableTooltipster";
```


