module.factory('timerBasedPlayer', function($http){


	var dataControl = {buffer : null, pages : [], cursor : 0, minimalBuffer : 0, hasNext : true, audioContext : null};


	var getNextPage = function(){

		var capturePattern;
		var dataView;
		var initialPoint;
		var idx;
		var segmentAreaSize = 0;

		dataView = new DataView(dataControl.buffer);

		var pageSegmentsIntValue = parseInt(dataView.getUint8(26 + dataControl.cursor).toString(10));
		//var segmentAreaSize = (parseInt(pageSegmentsIntValue) - 1) * 255 + parseInt(dataView.getUint8(parseInt(pageSegmentsIntValue) + 26 + dataControl.cursor).toString(10));

		for (idx = 0; idx < pageSegmentsIntValue; idx++){
			segmentAreaSize = segmentAreaSize + parseInt(dataView.getUint8(idx + 27 + dataControl.cursor).toString(10));
		}

		var page = {
			
			capturePattern : dataView.getUint8(0 + dataControl.cursor).toString(16) + dataView.getUint8(1 + dataControl.cursor).toString(16) + dataView.getUint8(2 + dataControl.cursor).toString(16) + dataView.getUint8(3 + dataControl.cursor).toString(16),
			version : dataView.getUint8(4 + dataControl.cursor).toString(16),
			headerType : dataView.getUint8(5 + dataControl.cursor).toString(16),
			granulePosition1 : dataView.getUint8(6 + dataControl.cursor).toString(16) + dataView.getUint8(7 + dataControl.cursor).toString(16) + dataView.getUint8(8 + dataControl.cursor).toString(16) + dataView.getUint8(9 + dataControl.cursor).toString(16),
			granulePosition2 : dataView.getUint8(10 + dataControl.cursor).toString(16) + dataView.getUint8(11 + dataControl.cursor).toString(16) + dataView.getUint8(12 + dataControl.cursor).toString(16) + dataView.getUint8(13 + dataControl.cursor).toString(16),
			bitstreamSerialNumber : dataView.getUint8(14 + dataControl.cursor).toString(16) + dataView.getUint8(15 + dataControl.cursor).toString(16) + dataView.getUint8(16 + dataControl.cursor).toString(16) + dataView.getUint8(17 + dataControl.cursor).toString(16),
			pageSequenceNumber : dataView.getUint8(21 + dataControl.cursor).toString(10) + dataView.getUint8(20 + dataControl.cursor).toString(10) + dataView.getUint8(19 + dataControl.cursor).toString(10) + dataView.getUint8(18 + dataControl.cursor).toString(10),
			checksum : dataView.getUint8(22 + dataControl.cursor).toString(16) + dataView.getUint8(23 + dataControl.cursor).toString(16) + dataView.getUint8(24 + dataControl.cursor).toString(16) + dataView.getUint8(25 + dataControl.cursor).toString(16),
			pageSegments : dataView.getUint8(26 + dataControl.cursor).toString(16),
			pageSegmentsIntValue : pageSegmentsIntValue,
			lastSegmentSize : dataView.getUint8(parseInt(pageSegmentsIntValue) + 26 + dataControl.cursor).toString(16),
			segmentAreaSize : segmentAreaSize,
			toBeContinued : (dataView.getUint8(parseInt(pageSegmentsIntValue) + 26 + dataControl.cursor).toString(10) == "255"),
			headerSize : pageSegmentsIntValue + 27,
			pageSize : pageSegmentsIntValue + 27 + segmentAreaSize,
			initialPosition: dataControl.cursor,
			finalPosition: -1,
			buffer : null

		};


		initialPoint = dataControl.cursor;

		page.buffer = dataControl.buffer.slice(initialPoint, page.pageSize + dataControl.cursor);

		dataControl.cursor = page.pageSize + dataControl.cursor;

		page.finalPosition = dataControl.cursor - 1;

		return page;

	};

	var setHeader = function(buffer){

			var headerCommentsBuffer = dataControl.buffer.slice(dataControl.pages[0].initialPosition, dataControl.pages[3].finalPosition);

			var dataView1 = new DataView(buffer);
			var dataView2 = new DataView(headerCommentsBuffer);

			var idx = 0;

			for (idx = 0; idx < dataControl.pages[2].finalPosition; idx++){

				dataView1.setUint8(idx, dataView2.getUint8(idx));

			}

	};
/*
	var setContent = function(buffer, start, finish){

			var additionalBuffer = dataControl.buffer.slice(dataControl.pages[start].initialPosition, dataControl.pages[finish].finalPosition);

			var dataView1 = new DataView(buffer);
			var dataView2 = new DataView(additionalBuffer);

			console.log("pag inicial: " + dataView2.getUint8(21).toString(10) + dataView2.getUint8(20).toString(10) + dataView2.getUint8(19).toString(10) + dataView2.getUint8(18).toString(10));

			var idx = 0;

			for (idx = 0; idx < dataControl.pages[finish].finalPosition - dataControl.pages[start].initialPosition; idx++){

				dataView1.setUint8(idx + dataControl.pages[3].initialPosition, dataView2.getUint8(idx));

			}

	};
*/

	var setContent = function(buffer, start, finish){

			//var additionalBuffer = dataControl.buffer.slice(dataControl.pages[start].initialPosition, dataControl.pages[finish].finalPosition);

			var dataView1 = new DataView(buffer);
			var dataView2;

			var idx = 0;
			var idy = 0;
			var pointer = 0;

			pointer = dataControl.pages[3].initialPosition;

			for (idx = start; idx <= finish; idx++){

				dataView2 = new DataView(dataControl.pages[idx].buffer);

				for (idy = 0; idy < dataControl.pages[idx].buffer.byteLength; idy++){

					dataView1.setUint8(pointer, dataView2.getUint8(idy));

					pointer++;

				}

 			}
/*
			console.log("pag inicial: " + dataView2.getUint8(21).toString(10) + dataView2.getUint8(20).toString(10) + dataView2.getUint8(19).toString(10) + dataView2.getUint8(18).toString(10));

			var idx = 0;

			for (idx = 0; idx < dataControl.pages[finish].finalPosition - dataControl.pages[start].initialPosition; idx++){

				dataView1.setUint8(idx + dataControl.pages[3].initialPosition, dataView2.getUint8(idx));

			}
*/
	};

	return {

		load: function(token, id, isDemo, minimalBuffer, callback){

			var page;

			dataControl.audioContext = new AudioContext();

			dataControl.minimalBuffer = minimalBuffer;

            var ms_hostname = window.localStorage.getItem("environment");

             var request = $http({
                method: "get",
                url: ms_hostname + "/MultiSongs/api/download/music/" + token + "/" + id + "/" + isDemo,
                responseType:"arraybuffer"
            });


            request.success(

                function( response ) {

            		dataControl.buffer = response;

                	while (dataControl.hasNext) {

                		page = getNextPage();

                		dataControl.pages.push(page);

                		dataControl.hasNext = page.buffer.byteLength + dataControl.cursor < dataControl.buffer.byteLength - 1;

                	} 

                    callback();

                }

            );

            request.error(

                function( response ) { 

                    callback();

                }

            );
 
         },


		play : function(){

			var idx;
			var buffer;
			var time;
			var buffers = [];
			var timers = [];

			time = 0;

			var idy = 0;
			for (idx = 0; idx < 2; idx++){
				
				//buffer = dataControl.buffer.slice(dataControl.pages[idx * dataControl.minimalBuffer].initialPosition, dataControl.pages[(idx + 1) * dataControl.minimalBuffer].finalPosition);

				if (idx == 0){

					buffer = new ArrayBuffer(dataControl.pages[dataControl.minimalBuffer].finalPosition + 1);

					setHeader(buffer);
					setContent(buffer, 3, dataControl.minimalBuffer);

				}else{
//dataControl.pages[(idx + 1) * dataControl.minimalBuffer].finalPosition - dataControl.pages[idx * dataControl.minimalBuffer].finalPosition
					buffer = new ArrayBuffer(dataControl.pages[3].initialPosition + dataControl.pages[(idx + 1) * dataControl.minimalBuffer].finalPosition - dataControl.pages[idx * dataControl.minimalBuffer].finalPosition + 1);

					setHeader(buffer);
					setContent(buffer, idx * dataControl.minimalBuffer + 1, (idx + 1) * dataControl.minimalBuffer);

				}


				dataControl.audioContext.decodeAudioData(buffer, function(decodedBuffer){

					var bufferSource = dataControl.audioContext.createBufferSource();
					var gainNode = dataControl.audioContext.createGain();
		            //var panNode = dataControl.audioContext.createStereoPanner();
		            //var analyserNode = dataControl.audioContext.createAnalyser();

		            bufferSource.buffer = decodedBuffer;

		            
		            //panNode.connect(gainNode);
		            gainNode.connect(dataControl.audioContext.destination);
		            //gainNode.connect(analyserNode);

					if (time > 0){
			            var delay = dataControl.audioContext.createDelay();
			            //delay.delayTime.value =  time - Math.floor(time);
			            bufferSource.connect(delay);
			            delay.connect(gainNode);
			            console.log("criou delay com " + (time));
			        }else{
			        	bufferSource.connect(gainNode);
			        	//analyserNode.connect(dataControl.audioContext.destination);
			        }    


		            buffers.push(bufferSource);
		            timers.push(time);

		            if (buffers.length == 2){
						buffers.forEach(function(entry){
							entry.start(timers[idy]);
							idy++;
						})
						//bufferSource.start(Math.floor(time));
		            }



		            time = time + decodedBuffer.length / decodedBuffer.sampleRate;

/*
		            if (buffers.length == 2){

						buffers.forEach(function(entry){
							entry.start();
						})

		            }
*/
				});



			};



		}

	}

});
