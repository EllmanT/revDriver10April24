const fs = require("fs");
const path = require("path");
const os = require("os");
const readline = require("readline");

// Part 0: MOVING THE APIS
const currentDirectory = __dirname;
const sourceFilePath = path.join(currentDirectory, "RevmaxAPI.dll");
const sourceFilePath2 = path.join(currentDirectory, "RevmaxAPI.tlb");
const sourceFilePath3 = path.join(currentDirectory, "RevmaxAPI.pdb");

const osDrive =
  os.platform() === "win32" ? os.homedir().split(path.sep)[0] : "/";
const destinationFilePath = path.join(
  osDrive,
  "Revmax",
  "Revmax",
  "RevmaxAPI.dll"
);
const destinationFilePath2 = path.join(
  osDrive,
  "Revmax",
  "Revmax",
  "RevmaxAPI.tlb"
);
const destinationFilePath3 = path.join(
  osDrive,
  "Revmax",
  "Revmax",
  "RevmaxAPI.pdb"
);

console.log("");

const copyFile = (source, destination, callback) => {
  fs.access(destination, (err) => {
    if (err) {
      fs.copyFile(source, destination, (err) => {
        if (err) {
          console.error("Error copying file:", err);
        } else {
          console.log("\nRevMaxAPI File copied successfully!");
          callback(); // Call the callback function after copying
        }
      });
    } else {
      fs.copyFile(source, destination, (err) => {
        if (err) {
          console.error("Error replacing file:", err);
        } else {
          console.log("RevMaxAPI File replaced successfully!");
          callback(); // Call the callback function after copying
        }
      });
    }
  });
};

// Callback function to be called after all files have been copied
const filesCopiedCallback = () => {
  console.log("\nPress Enter key to close the program.");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.on("line", (input) => {
    rl.close(); // Close the readline interface when the user presses Enter
    console.log("UPDATE DONE!!");
    console.log("you can now fiscalise in ZIG ;)")
    // Perform any additional actions or exit the program
  });
};

// Copy the files and call the callback function when done
copyFile(sourceFilePath, destinationFilePath, () => {
  copyFile(sourceFilePath2, destinationFilePath2, () => {
    copyFile(sourceFilePath3, destinationFilePath3, filesCopiedCallback);
  });
});



const driverLetter = os.homedir().charAt(0).toUpperCase();
const filePath = path.join(driverLetter + ":", "Revmax", "settings.ini");

//part 1  Updating the settings .ini file//
fs.readFile(filePath, "utf8", (err, data) => {
  if (err) {
    console.error("Error Settings opening the file:", err);
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
      "Desired changes already exist in the Settings file. No updates performed."
    );
    return;
  }

  fs.writeFile(filePath, updatedData, "utf8", (err) => {
    if (err) {
      console.error("Error saving the file:", err);
      console.error("Update failed!");
      return;
    }

    console.log("Updates for Settings applied successfully!");
    console.log("Settings File saved successfully.");

   
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

  console.log(`Checking for certificate folder: ${certificateFolderPath}`);
  console.log(`Checking for config file: ${configFilePath}`);

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

  console.log("Config File opened");


  let previousReceiptDateExists = false;
  let VATNumberExists = false;

  const lines = data.split("\n");
  let updatedData = data.trim() + "\n"; // Start with existing data and add a new line

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.match(/^PreviousReceiptDate:/i)) {
      previousReceiptDateExists = true;
    }

    if (line.match(/^VATNumber:/i)) {
      VATNumberExists = true;
    }
  }

  if (!VATNumberExists) {
    const vatNumber = "test12345";
    updatedData += `VATNumber: ${vatNumber}\n`;
  }

  if (!previousReceiptDateExists) {
    const currentDate = new Date().toISOString();
    updatedData += `PreviousReceiptDate: ${currentDate}\n`;
  }

  if (!VATNumberExists || !previousReceiptDateExists) {
    fs.writeFile(configFilePath, updatedData, "utf8", (err) => {
      if (err) {
        console.error("Error saving the file:", err);
        console.error("Update failed!");
      } else {
        console.log("Update Settings successful!");
        console.log("Update Config successful");
        console.log("Files SAVED successfully.");
     
      }
    });
  } else {
    console.log("VATNumber and PreviousReceiptDate already exist. No changes made.");
    
  }
 
  
 
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


