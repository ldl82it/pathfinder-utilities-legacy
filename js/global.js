$(document).ready(function(){
	Calculate();
	duplicate();
	elimina();
	resetTotale();
	hoverNote();
	retry();
	pulisciErrori();
	vibraTasti();
});





function CalcoloTotale(){
			var costoPergamenaTot = 0;
			$('.costoPergamena').each(function() {
				costoPergamenaTot += parseFloat($(this).text());
			});
			
			var tempoNecessarioTot = 0;
			$('.tempoNecessario').each(function() {
				tempoNecessarioTot += parseFloat($(this).text());
			});			
			
			$("#costoPergamenaTot").html(costoPergamenaTot + "g");
			$("#tempoNecessarioTot").html(tempoNecessarioTot.toFixed(1) + "h");
}


function Calculate() {
	
		$(".calcolaCosto").click(function () {
			
			for (var i = 0; i < 11; i++) {
				var livelloCaster = $("#sezionePerg-"+ i + " .livelloCaster").val();
				var livelloSpell = $("#sezionePerg-"+ i + " .livelloSpell").val();
				
				if(livelloSpell == 0){
					var livelloSpell = 0.5;
				}
				
				var numeroPergamene = $("#sezionePerg-"+ i + " .numeroPergamene").val();
				var costoPergamena = 12.5*livelloCaster*livelloSpell*numeroPergamene;
				var tempoNecessario= (costoPergamena/125);
				
					if(costoPergamena <= 250){
						var tempoNecessario2= "2";
					}
					else if (costoPergamena > 250 && costoPergamena < 1000){
						var tempoNecessario2= "8";
					}
					else {
						var tempoNecessario2= (Math.ceil(costoPergamena/1000))*8;
						//var tempoNecessario2= String(costoPergamena).substring(0,2);
					}
												
					$("#sezionePerg-"+ i + " .costoPergamena").html(costoPergamena + "g");
						
					$("#sezionePerg-"+ i + " .tempoNecessario").html(tempoNecessario + "h");
					
					$("#sezionePerg-"+ i + " .tempoNecessario2").html(tempoNecessario2 + "h");

				$("*").removeClass("errorBox");
				
			}	
			

			// CHECK SE SONO NUMERI
			$('.pergamene').each(function(){
				var inputVari = $(this).val();
				
				if($(this).val() == ''){
					$("#alertVari").removeClass("hidden");
					$(".invalidInput").removeClass("hidden");
					$(this).addClass("errorBox");	
				}
				else {
				}
				
			})
			
			
			// CHECK SE LVL SPELL > DI 10
			
			$('.livelloSpell').each(function(){
				var livelloSpell2 = $(this).val();
				
				if(livelloSpell2 > 10){
					$("#alertVari").removeClass("hidden");
					$(".lvlSpellAlto").removeClass("hidden");
					
					$(this).addClass("errorBox");	
				}
				else {
				}
				
			})
			
			$('.livelloCaster').each(function(){
				var livelloCaster2 = $(this).val();
				
				if(livelloCaster2 > 20){
					$("#alertVari").removeClass("hidden");
					$(".lvlSpellAlto").removeClass("hidden");
					
					$(this).addClass("errorBox");	
				}
				else if(livelloCaster2 == 0){
					$("#alertVari").removeClass("hidden");
					$(".invalidInput").removeClass("hidden");
					
					$(this).addClass("errorBox");	
				}
				
				else {
				}
				
			})
			
			$('.numeroPergamene').each(function(){
				var numeroPergamene2 = $(this).val();
				
				if(numeroPergamene2 > 30){
					$("#alertVari").removeClass("hidden");
					$(".lvlSpellAlto").removeClass("hidden");
					
					$(this).addClass("errorBox");	
				}
				else {
				}
				
			})
			
			// EASTER EGG SETTE
			
			$('.livelloSpell').each(function(){
				var a = $(this).val();
				var b = $(this).closest(".calcoloSingolaPergamena").find(".livelloCaster").val();
				var c = $(this).closest(".calcoloSingolaPergamena").find(".numeroPergamene").val();
				
				if((a == 7) && (b == 7) && (c == 7)){
					$('#sette').get(0).play();	
				}
				else {
				}
				
			})
			
			CalcoloTotale();
				
		});
	
}



function duplicate() {
	$(".btn-copy").on('click', function(){
		var clone = $(this).closest('.calcoloSingolaPergamena').clone(true);
		var length = $(".calcoloSingolaPergamena").length;
		var newId = "sezionePerg-" + length++;
				
		clone.attr("id", newId);
		
		clone.find("#sezionePerg").attr("id","sezionePerg-"+length);
		
		//append clone on the end
		$(this).closest('.calcoloSingolaPergamena').after(clone);
		$(".costoPergamenaTot, .tempoNecessarioTot").empty();
		$(".calcoloSingolaPergamena:last .costoPergamena").empty();
		$(".calcoloSingolaPergamena:last .tempoNecessario").empty();
		$(".calcoloSingolaPergamena:last .tempoNecessario2").empty();
		$( ".calcoloSingolaPergamena:last .pergamene" ).val('');
		$( ".calcoloSingolaPergamena:last .numeroPergamene" ).val('1');
		$(this).addClass("hidden");
	})
}


function elimina(){
	$(".btn-delete").on('click', function(){
		
		$(this).closest('.calcoloSingolaPergamena').remove();
		$(".costoPergamenaTot, .tempoNecessarioTot").empty();
		$(".calcoloSingolaPergamena:last .btn-copy").removeClass("hidden");
	})
	
}

function resetTotale(){
	$(".resetTotale").on('click', function(){
		$("input[type=number]").val("");
		$( ".calcoloSingolaPergamena .numeroPergamene" ).val('1');
		$(".costoPergamena, .tempoNecessario, .tempoNecessario2").empty();
		$(".costoPergamenaTot, .tempoNecessarioTot").empty();
		$(".calcoloSingolaPergamena").not( "#sezionePerg-0" ).remove();
		$("#sezionePerg-0 .btn-copy").removeClass("hidden");
	})
}

function hoverNote(){
	$(".btn-note").mouseenter(
		  function() {
			  $("#note").toggleClass("capolino");
		  }
	);
	
	$(".btn-note").on('click', function(){
			if($("#note").hasClass("noteVisibili")){
				  $("#note").removeClass("noteVisibili");
				  $("#note .fa-times").addClass("hidden");
				  $("#note .fa-asterisk").removeClass("hidden");
				  $("body").removeClass("oscurato");
				  $("html").removeClass("noScroll");
			}
			else{
				  $("#note").addClass("noteVisibili");
				  $("#note .fa-times").removeClass("hidden");
				  $("#note .fa-asterisk").addClass("hidden");
				  $("body").addClass("oscurato");
				  $("html").addClass("noScroll");
			}
	});
}


function retry(){
	$(".btn-retry").on('click', function(){
		$("#alertVari, .testoAlert").addClass("hidden");
		$( ".calcoloSingolaPergamena .numeroPergamene" ).val('1');
		$(".costoPergamena, .tempoNecessario, .tempoNecessario2").empty();
		$(".costoPergamenaTot, .tempoNecessarioTot").empty();
	})	
}


function pulisciErrori(){
	$('.pergamene').on('input', function() {
			
		if($(this).hasClass("errorBox")){
		   $(this).removeClass("errorBox");
		}
				
	})
}


function vibraTasti(){
	
	if ($(window).width() < 500) {

		$('.vibraTasti').on('click', function() {
			
			  // Vibrate for 200ms
			  navigator.vibrate([200]);
			
		})
	}
	
}

