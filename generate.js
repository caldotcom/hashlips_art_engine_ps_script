// Simple art generator by HashLips <-> https://github.com/HashLips/hashlips_art_engine_ps_script
// Contributed to by caldotcom <-> https://github.com/caldotcom

#include "./lib/json2.js";

function main() {
	var continueConfirmation = confirm(
		"You are about to use the HashLips art generator. Are you sure you want to continue?"
	);

	if (!continueConfirmation) return;

	var supply = prompt("How many images do you want to generate?", "10");
	var name = prompt("What is the name of your collection?", "");
	var description = prompt("What is the description for your collection?", "");

	alert(
		supply +
		" images will be generated, so sit back relax and enjoy the art being generated."
	);

	var groups = app.activeDocument.layerSets;
	resetLayers(groups);

	for (var h = 1; h <= parseInt(supply); h++) {
		var obj = {};
		obj.name = name + " #" + h;
		obj.description = description;
		obj.image = "build/images/" + h + ".jpg";
		obj.edition = h;
		obj.attributes = [];

		for (var i = 0; i < groups.length; i++) {
			var totalWeight = 0;
			var layerMap = [];

			for (var j = 0; j < groups[i].layers.length; j++) {
				totalWeight += getRWeights(groups[i].layers[j].name);
				layerMap.push({
					index: j,
					name: cleanName(groups[i].layers[j].name),
					weight: getRWeights(groups[i].layers[j].name)
				});
			}

			var ran = Math.floor(Math.random() * totalWeight);

			(function() {
				for (var j = 0; j < groups[i].layers.length; j++) {
					ran -= layerMap[j].weight;
					if (ran < 0) {
						groups[i].layers[j].visible = true;
						obj.attributes.push({
							trait_type: groups[i].name,
							value: layerMap[j].name.replace(/ /g, "\\ ")
						});
						return;
					}
				}
			})();
		}
		saveImage(obj.edition, obj.attributes);
		saveMetadata(obj);
		resetLayers(groups);
	}

	alert("Generation process is complete.");
}

function resetLayers(layerGroups) {
	for (var i = 0; i < layerGroups.length; i++) {
		layerGroups[i].visible = true;
		for (var j = 0; j < layerGroups[i].layers.length; j++) {
			layerGroups[i].layers[j].visible = false;
		}
	}
}

function getRWeights(str) {
	var weight = Number(str.split("#").pop());
	if (isNaN(weight)) {
		weight = 1;
	}
	return weight;
}

function cleanName(str) {
	return str.split("#").shift();
}

function saveImage(edition, attributes) {
	var saveFile = new File(toFolder("build/images") + "/" + edition + ".jpg");
	var exportOptions = new ExportOptionsSaveForWeb();
	exportOptions.format = SaveDocumentType.JPEG;
	exportOptions.quality = 100; // Highest quality
	app.activeDocument.info.title = "Edition " + edition;
	app.activeDocument.info.caption = JSON.stringify(attributes);
	app.activeDocument.exportDocument(
		saveFile,
		ExportType.SAVEFORWEB,
		exportOptions
	);
}

function saveMetadata(data) {
	var metadata = {
		name: data.name,
		description: data.description,
		image: data.image,
		edition: data.edition,
		attributes: data.attributes
	};

	var file = new File(toFolder("build/metadata") + "/" + data.edition + ".json");
	file.open("w");
	file.write(JSON.stringify(metadata, null, 2));
	file.close();
}

function toFolder(folderName) {
	var path = app.activeDocument.path;
	var folder = new Folder(path + "/" + folderName);
	if (!folder.exists) folder.create();
	return folder;
}

main();
