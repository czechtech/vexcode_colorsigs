// global
var file = null;
var json = null;

function loadFile(e) {
	if(!e || !e.target || !e.target.files || !e.target.files[0]) {
		alert("No file");
		return
	}
	file = e.target.files[0];
	fr = new FileReader();
	fr.readAsText(file);
	fr.addEventListener('error', ()=>alert("Error while reading.") );
	fr.addEventListener('abort', ()=>alert("Reading aborted.") );
	fr.addEventListener('loadend', processFile);

	document.getElementById("rconfig").innerHTML = '';
	document.getElementById("file-download").disabled = false;
}


function processFile(e) {
	if(!e || !e.target || !e.target.result) {
		alert("Error processing file.");
		return;
	}
	json = JSON.parse(e.target.result);
	if(!json["robotConfig"] || json["robotConfig"].length < 1) {
		alert("No robotConfig in file.");
		return;
	}
	
	Object.keys(json["robotConfig"]).forEach( (device)=> {
		if(!json["robotConfig"][device].deviceType) {
			h2 = document.createElement("h2");
			h2.appendChild(document.createTextNode("Unknown: " + json["robotConfig"][device]));
			document.getElementById("rconfig").appendChild(h2);
		}
		else {
			// VISION DEVICE
			if(json["robotConfig"][device].deviceType == "Vision") {
				alert("Unable to process Vision device.");
				//parseVisionDevice(json["robotConfig"][device]);
			}
			// AI VISION DEVICE
			else if(json["robotConfig"][device].deviceType == "AIVision") {
				parseAIVisionDevice(json["robotConfig"][device]);
			}
			else {
				h2 = document.createElement("h2");
				h2.appendChild(document.createTextNode("Device: " + json["robotConfig"][device].name));
				document.getElementById("rconfig").appendChild(h2);
			}
		}
	});

}


function parseAIVisionDevice(v) {
	deviceDiv = document.createElement("div");
	document.getElementById("rconfig").appendChild(deviceDiv);
	deviceDiv.className = "aivision";

	visionName = v.name;
	if(!visionName) {
		configDiv.appendChild(document.createTextNode("No Vision Name Found"));
		return;
	}
	
	deviceDiv.id = v.name;                
	h2 = document.createElement("h2");
	deviceDiv.appendChild(h2);
	h2.appendChild(document.createTextNode("Device: " + v.name));
	Object.keys(v).forEach( (value)=> {
		if(value != "name" && value != "setting") {
			p = document.createElement("p");
			deviceDiv.appendChild(p);
			p.appendChild(document.createTextNode(value + ": " + v[value]));
		}
	});
	
	visionSetting = v.setting;
	if(!visionSetting) {
		configDiv.appendChild(document.createTextNode("No Vision Settings Found"));
		return;
	}

	// Parse Vision Setting //

	configDiv = document.createElement("div");
	deviceDiv.appendChild(configDiv);
	configDiv.className = "config";
	configHead = document.createElement("h3");
	configHead.appendChild(document.createTextNode("config"));
	configDiv.appendChild(configHead);
	
	visionSettingConfig = visionSetting.config;
	if(!visionSettingConfig) {
		configDiv.appendChild(document.createTextNode("No Vision Setting Config Found"));
		return;
	}

	// ADAPT FOR VEX FILE STRINGIFIED AIVISION SETTING'S CONFIG
	v.setting.config = JSON.parse(v.setting.config);
	if(!v.setting.config) {
		configDiv.appendChild(document.createTextNode("Error Parsing AIVision Setting Config's JSON"));
		return;
	}
	visionSettingConfig = visionSetting.config;
	
	// Confirm Colors //
	colors = visionSettingConfig.colors;
	if(!colors) {
		configDiv.appendChild(document.createTextNode("No Colors Found"));
		return;
	}
	
	Object.keys(visionSettingConfig).forEach( (key)=> {
		// COLORS
	  if(key == "colors") {
			for(i = 0; i < colors.length; i++) {
				colorDiv = document.createElement("div");
				colorDiv.id = colors[i].name; // The existence of name hasn't been checked. This should be unique because it is a constant in the vex-generated code
				h3 = document.createElement("h3");
				h3.appendChild(document.createTextNode(colors[i].name));
				colorDiv.appendChild(h3);
				configDiv.appendChild(colorDiv);
				// Parse Details
				Object.keys(colors[i]).forEach( (key)=> {
					label = document.createElement("label");
					label.appendChild(document.createTextNode(key));
					textbox = document.createElement("input");
					if(isNaN(colors[i][key])) {
						textbox.setAttribute("type", "text");
						textbox.setAttribute("disabled", true);
					} else {
						textbox.setAttribute("type", "number");
						// Changes need to be updated in the json...
						textbox.onchange = function (e) {
							k = this.parentNode.textContent;
							e.currentTarget.json_ref[k] = Number(this.value);
							if(k == 'red' || k == 'green' || k == 'blue') {
								this.parentNode.parentNode.style.backgroundColor = `rgb(${e.currentTarget.json_ref.red}, ${e.currentTarget.json_ref.green}, ${e.currentTarget.json_ref.blue})`;
							}
						};
						textbox.json_ref = visionSettingConfig.colors[i];
					}
					textbox.value = colors[i][key];
					label.appendChild(textbox);
					colorDiv.appendChild(label);
					colorDiv.style.backgroundColor = `rgb(${colors[i].red}, ${colors[i].green}, ${colors[i].blue})`;
				});		
			}
		}
		// codes, tags, AIObjects, AIObjectModel, AIModelMetaData, aiModelDropDownValue
		else {
				p = document.createElement("p");
				p.appendChild(document.createTextNode(key + ": " + visionSettingConfig[key]));
				configDiv.appendChild(p);
		}
	});
	// done parsing AIVisionDevice		
}


function downloadFile() {
		// ADAPT FOR VEX FILE STRINGIFIED AIVISION SETTING'S CONFIG
		Object.keys(json["robotConfig"]).forEach( (device)=> {
			if(json["robotConfig"][device].deviceType && json["robotConfig"][device].deviceType == "AIVision") {
				json.robotConfig[device].setting.config = JSON.stringify(json.robotConfig[device].setting.config)
			}
		});
		
		fileContent = new Blob([JSON.stringify(json)],{type:"text/plain"});
		
		fileName = file.name.split(".v5blocks")[0] + " (new).v5blocks";
		link = document.getElementById("download-a");
		link.href = URL.createObjectURL(fileContent);
		link.download = fileName;
		link.click();
}
