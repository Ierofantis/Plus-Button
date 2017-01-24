
   var count=5;
   var socket = io();
    socket.on('counts',function(c) {
     $( "#health" ).html( "Health ==>" + "&nbsp" + c + "" 
      )}  
     )

$( "#success" ).click(function() { 
socket.emit('counts', count++);
});

$( "#war" ).click(function() {
 socket.emit('counts', count--);
 if(count==0){
  
  alert("game over")
  return count=5

 }
});

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

$( "#success" ).click(function() {
  $('#war').disable(true);
});
