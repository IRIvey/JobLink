// import multer from "multer";
// import path from "path";

// // Storage configuration
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     if (file.fieldname === "logo") {
//       cb(null, "uploads/logos"); // folder for logos
//     } else if (file.fieldname === "coverPhoto") {
//       cb(null, "uploads/covers"); // folder for cover photos
//     }
//   },
//   filename: function (req, file, cb) {
//     // unique name: companyId-fieldname-timestamp.ext
//     const ext = path.extname(file.originalname);
//     cb(null, `${req.body.companyName}-${file.fieldname}-${Date.now()}${ext}`);
//   },
// });

// // File filter
// const fileFilter = (req, file, cb) => {
//   const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
//   if (allowedTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error("Only PDF, JPG, JPEG, and PNG files are allowed"), false);
//   }
// };

// // Multer upload
// export const upload = multer({ storage, fileFilter });

