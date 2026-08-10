const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Garante que as pastas de armazenamento existam
const uploadFolder = path.resolve(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder);
  },
  filename: (req, file, cb) => {
    // Adiciona um timestamp único no nome do arquivo para evitar sobrescrever
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({ storage });

module.exports = upload;