const fs = require("fs");
const path = require("path");
const os = require("os");
const readline = require("readline");

//part 0 MMOVING THE APIS///
const currentDirectory = __dirname;
const sourceFilePath = path.join(currentDirectory, "RevmaxAPI.dll");
const sourceFilePath2 = path.join(currentDirectory, "RevmaxAPI.tlb");
const sourceFilePath3 = path.join(currentDirectory, "RevmaxAPI.pdb");

const osDrive =
  os.platform() === "win32" ? os.homedir().split(path.sep)[0] : "/"; // Get the OS drive letter (C:\ for Windows, / for Unix-like systems)
const destinationFilePath = path.join(osDrive, "Revmax", "RevmaxAPI.dll");
const destinationFilePath2 = path.join(osDrive, "Revmax", "RevmaxAPI.tlb");
const destinationFilePath3 = path.join(osDrive, "Revmax", "RevmaxAPI.pdb");

const copyFile = (source, destination) => {
  fs.access(destination, (err) => {
    if (err) {
      // File does not exist, copy it
      fs.copyFile(source, destination, (err) => {
        if (err) {
          console.error("Error copying file:", err);
        } else {
          console.log("File copied successfully!");
        }
      });
    } else {
      // File exists, replace it
      fs.copyFile(source, destination, (err) => {
        if (err) {
          console.error("Error replacing file:", err);
        } else {
          console.log("File replaced successfully!");
        }
      });
    }
  });
};

copyFile(sourceFilePath, destinationFilePath);
copyFile(sourceFilePath2, destinationFilePath2);
copyFile(sourceFilePath3, destinationFilePath3);

const driverLetter = os.homedir().charAt(0).toUpperCase();
const filePath = path.join(driverLetter + ":", "Revmax", "settings.ini");

//part 1  Updating the settings .ini file//
fs.readFile(filePath, "utf8", (err, data) => {
  if (err) {
    console.error("Error opening the file:", err);
    return;
  }

  const currenciesExist = data.includes("CURRENCIES=ZiG|");
  const invoiceExist = /ZiGINVOICE/.test(data);
  const amountPaidExist = /AMOUNTPAIDZiG/.test(data);

  let updatedData = data;

  if (!currenciesExist) {
    updatedData = updatedData.replace(/CURRENCIES=/gi, "CURRENCIES=ZiG|");
  }

  if (!invoiceExist) {
    updatedData = updatedData.replace(
      /(USDINVOICE.*)/gi,
      (match, line) => line + "\n" + line.replace(/USDINVOICE/g, "ZiGINVOICE")
    );
  }

  if (!amountPaidExist) {
    updatedData = updatedData.replace(
      /(AMOUNTPAIDUSD.*)/gi,
      (match, line) => line + "\n" + line.replace(/USD/g, "ZiG")
    );
  }

  const updatesPerformed =
    !currenciesExist || !invoiceExist || !amountPaidExist;

  if (!updatesPerformed) {
    console.log(
      "Desired changes already exist in the file. No updates performed."
    );
    return;
  }

  fs.writeFile(filePath, updatedData, "utf8", (err) => {
    if (err) {
      console.error("Error saving the file:", err);
      console.error("Update failed!");
      return;
    }

    console.log("Updates Settings applied successfully!");
    console.log("File saved successfully.");

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  });
});

//part 2 updating the swisbit config///

const configFileName = "config.ini";
const certificateFolderName = "certificate";

// Get the list of available drives on the system
const drives = os.platform() === "win32" ? getWindowsDrives() : getUnixDrives();

// Iterate through the drives to find the correct one
let targetDrive = null;
let configFilePath = null;
for (const drive of drives) {
  const driveRoot = path.join(drive, path.sep);

  // Skip the drive containing the operating system
  if (os.platform() === "win32" && driveRoot === os.platform() + "\\") {
    console.log(`Skipping drive ${drive} (OS drive)`);
    continue;
  }
  if (os.platform() !== "win32" && driveRoot === "/") {
    console.log(`Skipping drive ${drive} (OS drive)`);
    continue;
  }

  console.log(`Checking drive ${drive}...`);

  const certificateFolderPath = path.join(driveRoot, certificateFolderName);
  configFilePath = path.join(driveRoot, configFileName);

  console.log(`Checking certificate folder: ${certificateFolderPath}`);
  console.log(`Checking config file: ${configFilePath}`);

  // Check if the certificate folder and config.ini file exist
  if (fs.existsSync(certificateFolderPath) && fs.existsSync(configFilePath)) {
    targetDrive = drive;
    break;
  }
}

if (!targetDrive) {
  console.error(
    `Drive with '${certificateFolderName}' folder and '${configFileName}' file not found.`
  );
  return;
}

console.log(`Target drive found: ${targetDrive}`);

//actual updating of swisbit starts here//
fs.readFile(configFilePath, "utf8", (err, data) => {
  if (err) {
    console.error("Error opening the file:", err);
    return;
  }

  console.log("File opened");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  let previousReceiptDateExists = false;

  const lines = data.split("\n");
  let updatedData = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.match(/^PreviousReceiptDate:/i)) {
      previousReceiptDateExists = true;
    }

    updatedData += line + "\n";
  }

  if (!previousReceiptDateExists) {
    const currentDate = new Date().toISOString();
    updatedData += `PreviousReceiptDate: ${currentDate}\n`;
  }

  fs.writeFile(configFilePath, updatedData, "utf8", (err) => {
    if (err) {
      console.error("Error saving the file:", err);
      console.error("Update failed!");
    } else {
      console.log("Update Settings successful!");
      console.log("Update Config successful");
      console.log("Files SAVED successfully.");

      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.setEncoding("utf8");
      console.log("");
 
      console.log("Press 'y' key to close the program.");

      process.stdin.on("keypress", (key) => {
        if (key === "y") {
          console.log("");
          console.log("You can now fiscalize in ZiG ;)");
          console.log("UPGRADE DONE!!");
          process.stdin.pause();
          process.stdin.removeAllListeners("keypress");
          process.stdin.setRawMode(false);
          process.exit();
        }
      });
    }
  });
});
// Continue with the rest of the code for the target drive

//functions

// Function to get the list of Windows drives
function getWindowsDrives() {
  const drives = [];
  for (let i = 65; i <= 90; i++) {
    const driveLetter = String.fromCharCode(i);
    const drivePath = driveLetter + ":\\";
    if (fs.existsSync(drivePath)) {
      drives.push(drivePath);
    }
  }
  return drives;
}

// Function to get the list of Unix drives
function getUnixDrives() {
  return fs.readdirSync("/").map((entry) => path.join("/", entry));
}
