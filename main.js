const fs = require("fs");
const path = require("path");
const os = require("os");
const readline = require("readline");
const https = require("https");
const axios = require("axios");




  /////////////////////////////////////////////////////////////////////
  //part 2 updating the swisbit config///

const configFileName = "config.ini";
const certificateFolderName = "certificate";

// Get the list of available drives on the system
const drives = os.platform() === "win32" ? getWindowsDrives() : getUnixDrives();

// Iterate through the drives to find the correct one
let targetDrive = null;
let configFilePath = null;
let certificateFolderPath=null;
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

 certificateFolderPath = path.join(driveRoot, certificateFolderName);
  configFilePath = path.join(driveRoot, configFileName);

  console.log(`Checking for certificate folder: ${certificateFolderPath}`);
  console.log(`Checking for config file: ${configFilePath}`);

  // Check if the certificate folder and config.ini file exist
  if (fs.existsSync(certificateFolderPath) && fs.existsSync(configFilePath)) {
    targetDrive = drive;
    break;
  }
}

//first we check for the drive that has the certificate and config so that we make sure the swissbit is present
//we
if (!targetDrive) {
  console.error(
    `Drive with '${certificateFolderName}' folder and '${configFileName}' file not found.`
  );
  console.log("Please insert the Revmax Device ");
  console.log("Close the program and then try again.")
  return;
}

console.log(`Target drive found: ${targetDrive}`);


fs.readFile(configFilePath, "utf8", (err, data) => {
  if (err) {
    console.error("Error opening the file:", err);
    return;
  }

  console.log("Config File opened");

  let deviceID;

  const lines = data.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.match(/^DeviceID:/i)) {
      deviceID = line.split(":")[1].trim(); // Extract the device ID from the line
      break; // Exit the loop once the Device ID is found
    }
  }

  //we only work if the device id is present//
  if (deviceID) {
    console.log("Device ID:", deviceID);
//start
console.log(certificateFolderPath)
console.log(configFilePath)

const certificatePath = path.join( certificateFolderPath , "cert.crt");
const privateKeyPath = path.join(certificateFolderPath , "key.key");

const certificate = fs.readFileSync(certificatePath, "utf8");
const privateKey = fs.readFileSync(privateKeyPath, "utf8");

// Read the .crt and .key files

// Create an HTTPS agent using the certificate and private key
const agentOptions = {
  cert: certificate,
  key: privateKey,
};
const agent = new https.Agent(agentOptions);

// Create an instance of axios with the agent
const axiosInstance = axios.create({
  httpsAgent: agent,
});

// Send a request using axios
axiosInstance
  .get(`https://fdmsapitest.zimra.co.zw/Device/v1/${deviceID}/GetStatus`, {
    headers: {
      DeviceModelName: "Revmax",
      DeviceModelVersion: "v1",
    },
  })
  .then((response) => {
    const data = response.data;
    const fiscalDayStatus = data.fiscalDayStatus;

    if (fiscalDayStatus === "FiscalDayClosed") {
      console.log("Fiscal Day is Closed" );
      console.log("Let's Upgrade");
      console.log("...")
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
    check=1;
    fs.writeFile(configFilePath, updatedData, "utf8", (err) => {
      if (err) {
        console.error("Error saving the file:", err);
        console.error("Update failed!");
      } else {
     //   console.log("Update Settings successful!");
     //   console.log("Update Config successful");
     //   console.log("Files SAVED successfully.");
        console.log("");
        console.log('UPDATE DONE!!');
        console.log("Press Enter to close the program")
     
      }
    });
  } else {
    check=0;
    console.log("VATNumber and PreviousReceiptDate already exist. No changes made.");
    
  }
 
  
 
});
// Continue with the rest of the code for the target drive

//////////////////////////////////////////////////////




// Part 0: MOVING THE APIS
const currentDirectory = __dirname;
const sourceFilePath = path.join(currentDirectory, "RevmaxAPI.dll");
const sourceFilePath2 = path.join(currentDirectory, "RevmaxAPI.tlb");
const sourceFilePath3 = path.join(currentDirectory, "RevmaxAPI.pdb");

//end  checker//

let check =0;


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


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const filesCopiedCallback = () => {
  if(check ===0){
    console.log('UPDATE DONE!!');
    console.log("\nPress Enter key to close the program.");

  }

  rl.on('line', (input) => {
    if (input === '') {
      console.log('Closing the program...');
      console.log('UPDATE DONE!!');
      console.log("You can now fiscalize in ZiG ;)");
      rl.close();
      process.exit();
    }
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
    console.error("Error opening the file:", err);
    return;
  }





  const sectionDelimiter = "["; // Delimiter to identify sections in the INI file
  const sections = data.split(sectionDelimiter); // Split data into sections



  let updatedData = sections
    .map((section, index) => {
      if (index > 0) {
        const currenciesExist = section.includes("CURRENCIES=ZIG|ZiG|ZIG$|ZiG$|zig|Zig|ziG|ZG$|");
        const invoiceExist = /ZiGINVOICE/.test(section);
        const invoiceExist2 = /ZIGINVOICE/.test(section);
        const amountPaidExist = /AMOUNTPAIDZiG/.test(section);
        const amountPaidExist2 = /AMOUNTPAIDZIG/.test(section);
      const dollarExists = section.includes("DOLLAR=ZIG|ZiG|ZIG$|ZiG$|zig|Zig|ziG|ZG$");


        if (!dollarExists && !/LARGEDOLLAR/i.test(section)) {
          section = section.replace(/DOLLAR=/gi, "DOLLAR=ZIG|ZiG|ZIG$|ZiG$|zig|Zig|ziG|ZG$|");
        }

        if (!currenciesExist) {
          section = section.replace(/CURRENCIES=/gi, "CURRENCIES=ZIG|ZiG|ZIG$|ZiG$|zig|Zig|ziG|ZG$|");
        }

        if (!invoiceExist) {
          section = section.replace(
            /(USDINVOICE.*)/gi,
            (match, line) => line + "\n" + line.replace(/USDINVOICE/g, "ZiGINVOICE")
          );
        }
        if (!invoiceExist2) {
          section = section.replace(
            /(USDINVOICE.*)/gi,
            (match, line) => line + "\n" + line.replace(/USDINVOICE/g, "ZIGINVOICE")
          );
        }

        if (!amountPaidExist) {
          section = section.replace(
            /(AMOUNTPAIDUSD.*)/gi,
            (match, line) => line + "\n" + line.replace(/USD/g, "ZiG")
          );
        }
        if (!amountPaidExist2) {
          section = section.replace(
            /(AMOUNTPAIDUSD.*)/gi,
            (match, line) => line + "\n" + line.replace(/USD/g, "ZIG")
          );
        }
      }

      return section;
    })
    .join(sectionDelimiter); // Join sections back together

  const updatesPerformed = updatedData !== data;

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

    console.log("File saved successfully.");
    console.log("Updates applied successfully!");


  
   
  });
});



    } else {
      console.log("To perform this upgrade the Fiscal Day has to be closed");
      console.log("Please Generate Z Report to close the current day, then try again.");
      console.log("You can close the program ")
    }
  });

//end
  } else {
    console.log("Device ID not found in the file.");
  }
});

// Continue with the rest of the code for the target drive
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
