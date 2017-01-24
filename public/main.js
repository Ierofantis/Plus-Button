jQuery.fn.extend({
    disable: function(state) {
        return this.each(function() {
            var $this = $(this);
            $this.toggleClass('disabled', state);
        });
    }
});

$( "#war" ).click(function() {
  $('#success').disable(true);
});

$( "#sucess" ).click(function() {
  $('#war').disable(true);
});
