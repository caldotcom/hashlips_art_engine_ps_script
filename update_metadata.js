// Simple art generator by HashLips <-> https://github.com/HashLips/hashlips_art_engine_ps_script
// Contributed to by caldotcom <-> https://github.com/caldotcom

#include "./lib/json2.js";

function main() {
	var continueConfirmation = confirm(
		"You are about to update the metadata of your collection. Are you sure you want to continue?"
	);

	if (!continueConfirmation) return;

	var prefix = prompt("What is your new metadata prefix?", "");
	var suffix = prompt("What is your new metadata suffix?", "");

	var path = app.activeDocument.path;
	var metadataFolder = new Folder(path + "/build/metadata");

	if (metadataFolder.exists) {
		var fileList = metadataFolder.getFiles(/\.(json)$/i);

		for (var i = 0; i < fileList.length; i++) {
			var file = new File(fileList[i]);
			file.open("r");
			var data = JSON.parse(file.read());
			file.close();

			data.image = prefix + data.edition + suffix;

			file.open("w");
			file.write(JSON.stringify(data, null, 2));
			file.close();
		}

		alert("Updating metadata process is complete.");
	} else {
		alert("Metadata folder does not exist.");
	}
}

main();
