const fs = require('fs');
const path = require('path');

module.exports = (directory, folderOnly = false) => {
  const fileNames = [];

  const files = fs
    .readdirSync(directory, { withFileTypes: true })
    .filter((file) => !file.name.startsWith('.'))
    .filter((file) => (folderOnly ? file.isDirectory() : file.isFile()));

  for (const file of files) {
    const filePath = path.join(directory, file.name);

    if (folderOnly && file.isDirectory()) {
      fileNames.push(filePath);
    } else if (!folderOnly && file.isFile()) {
      fileNames.push(filePath);
    }
  }

  return fileNames;
};
