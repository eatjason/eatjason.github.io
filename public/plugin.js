(function( se, $, undefined ) {

    
    se.command({
        'new': {
            pr: {
                text: 'string',
                num: 'number',
                flt: 'float',
                bo: 'boolean'
            },
            fn: function(pr) {
                se.console.append(`made new ${pr.text}, ${pr.num}, ${pr.flt}, ${pr.bo}`);
            }
        }
    });


}( window.se = window.se || {}, undefined ));