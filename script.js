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
	if(!json["rconfig"] || json["rconfig"].length < 1) {
		alert("No rconfig in file.");
		return;
	}
	
	Object.keys(json["rconfig"]).forEach( (device)=> {
		if(!json["rconfig"][device].deviceType) {
			h2 = document.createElement("h2");
			h2.appendChild(document.createTextNode("Unknown: " + json["rconfig"][device]));
			document.getElementById("rconfig").appendChild(h2);
		}
		if(json["rconfig"][device].deviceType && json["rconfig"][device].deviceType != "Vision") {
			h2 = document.createElement("h2");
			h2.appendChild(document.createTextNode("Device: " + json["rconfig"][device].name));
			document.getElementById("rconfig").appendChild(h2);
		}
		if(json["rconfig"][device].deviceType && json["rconfig"][device].deviceType == "Vision") {
			parseVisionDevice(json["rconfig"][device]);
		}
	});

}


function parseVisionDevice(v) {
	deviceDiv = document.createElement("div");
	document.getElementById("rconfig").appendChild(deviceDiv);
	deviceDiv.className = "vision";

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
	
	visionSettingConfig = visionSetting.config;
	if(!visionSettingConfig) {
		configDiv.appendChild(document.createTextNode("No Vision Setting Config Found"));
		return;
	}
	config = JSON.parse(visionSettingConfig);
	config = config.config;
	if(!config) {
		configDiv.appendChild(document.createTextNode("No Config JSON within Config Found"));
		return;
	}
	
	// FIX VEX FILE RENDERING ERROR
	v.setting.config = config;
	
	// Device Brightness //

	brightness = config.brightness;
	if(!brightness) {
		configDiv.appendChild(document.createTextNode("No Brightness Setting Config Found"));
		return;
	}
	
	p = document.createElement("p");
	label = document.createTextNode("brightness:");
	textbox = document.createElement("input");
	textbox.className = "brightness";
	textbox.value = brightness;
	textbox.setAttribute("type", "number");
	textbox.onchange = function (e) { e.currentTarget.ref["brightness"] = Number(this.value); };
	textbox.ref = config;
	p.appendChild(label);
	p.appendChild(textbox);
	configDiv.appendChild(p);
	

	// Parse Signatures //
	
	signatures = config.signatures;
	if(!signatures) {
		configDiv.appendChild(document.createTextNode("No Signatures Found"));
		return;
	}

	for(i = 0; i < signatures.length; i++) {
		sigDiv = document.createElement("div");
		sigDiv.id = signatures[i].name; // The existence of name hasn't been checked AND I don't know this will be unique
		h3 = document.createElement("h3");
		h3.appendChild(document.createTextNode(signatures[i].name));
		sigDiv.appendChild(h3);
		configDiv.appendChild(sigDiv);
		
		// Parse Details

		Object.keys(signatures[i]).forEach( (value)=> {
			// name
			if(value == "name") {
				p = document.createElement("p");
				p.appendChild(document.createTextNode("name: " + signatures[i][value]));
				sigDiv.appendChild(p);
			}
			// parameters
			else if(value == "parameters") {
				parameters = signatures[i]["parameters"];
				Object.keys(parameters).forEach( (parameter)=> {
						p = document.createElement("p");
						label = document.createElement("p");
						label.appendChild(document.createTextNode(parameter));
						textbox = document.createElement("input");
						if(isNaN(parameters[parameter])) {
							textbox.setAttribute("type", "text");
							textbox.setAttribute("disabled", true);
						} else {
							textbox.setAttribute("type", "number");
							textbox.onchange = function (e) {
								t = this.previousSibling.textContent;
								e.currentTarget.ref[t] = Number(this.value);
							};
							textbox.ref = parameters;
						}
						textbox.value = parameters[parameter];
						p.appendChild(label);
						p.appendChild(textbox);
						sigDiv.appendChild(p);
				});
			}
			// range
			else if(value == "range") {
				p = document.createElement("p");
				label = document.createTextNode("range:");
				textbox = document.createElement("input");
				textbox.className = "range";
				textbox.value = signatures[i][value];
				textbox.setAttribute("type", "number");
				textbox.onchange = function (e) { e.currentTarget.ref["range"] = Number(this.value); };
				textbox.ref = signatures[i];
				p.appendChild(label);
				p.appendChild(textbox);
				sigDiv.appendChild(p);
			}
			// unexpected...
			else {
				p = document.createElement("p");
				p.appendChild(document.createTextNode(value + "**: " + signatures[i][value]));
				sigDiv.appendChild(p);
			}
		});
		
	}
}


function downloadFile() {
		// ADAPT FOR VEX FILE RENDERING ERROR
		Object.keys(json["rconfig"]).forEach( (device)=> {
			if(json["rconfig"][device].deviceType && json["rconfig"][device].deviceType == "Vision") {
				json.rconfig[device].setting.config = JSON.stringify(json.rconfig[device].setting)
			}
		});
		
		fileContent = new Blob([JSON.stringify(json)],{type:"text/plain"});
		
		fileName = file.name.split(".v5blocks")[0] + " (new).v5blocks";
		link = document.getElementById("download-a");
		link.href = URL.createObjectURL(fileContent);
		link.download = fileName;
		link.click();
}
