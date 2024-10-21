import { diskStorage } from 'multer';
import multer, { FileFilterCallback } from 'multer';

export const fileUploadOptions: any = {
  limits: {
    fileSize: 1024 * 1024 * 8,
    files: 7,
  },
  fileFilter: (req: Request, file: File, acceptFile: FileFilterCallback) => {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/bmp',
      'image/tiff',
    ];
    acceptFile(null, allowedMimeTypes.includes(file['mimetype']));
  },
  storage: diskStorage({
    destination: (req: any, file: any, cb: any) => {
      cb(null, './src/public/uploads');
    },
    filename: (req: any, file: any, cb: any) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
    },
  }),
};

export const fileUploadExcel = {
  storage: multer.diskStorage({
    // destination: (req, file, cb) => {
    //   cb(null, './src/public/uploads');
    // },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
    },
  }),

  limits: {
    fileSize: 1 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only Excel files are allowed.'), false);
    }
  }
};


export const multipleImgUploadOptionsWithColumn: any = {
  limits: {
    fileSize: 1024 * 1024 * 8,
    files: 2,
  },
  fileFilter: (req: Request, file: File, acceptFile: FileFilterCallback) => {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/bmp',
      'image/tiff',
    ];
    acceptFile(null, allowedMimeTypes.includes(file['mimetype']));
  },
  storage: diskStorage({
    destination: (req: any, file: any, cb: any) => {
      cb(null, './src/public/uploads');
    },
    filename: (req: any, file: any, cb: any) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
    },
  }),
};







